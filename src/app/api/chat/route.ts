import { z } from "zod";
import { searchVectorDB, createLead } from "@/lib/ai/tools";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export const maxDuration = 60;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
    try {
        const { messages: uiMessages, sessionId: clientSessionId } = await req.json();
        const sessionId = clientSessionId || randomUUID();
        const host = req.headers.get("host") || "happyland.me";
        const date = new Date().toLocaleDateString("vi-VN");

        // Convert UI messages to proper format and filter invalid ones
        let processedMessages = uiMessages.map((m: any) => {
            if (m.parts && Array.isArray(m.parts)) {
                const textContent = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
                return { role: m.role, content: textContent || '' };
            }
            if (typeof m.content === 'string') {
                return { role: m.role, content: m.content };
            }
            return m;
        });

        // Filter: remove empty messages and ensure conversation starts with user message
        processedMessages = processedMessages.filter((m: any) => m.content && m.content.trim());

        // Find first user message index and slice from there
        const firstUserIndex = processedMessages.findIndex((m: any) => m.role === 'user');
        const messages = firstUserIndex >= 0 ? processedMessages.slice(firstUserIndex) : processedMessages;

        console.log("[Chat API] Final messages:", JSON.stringify(messages, null, 2));

        // Build request for OpenRouter Chat Completions API
        const systemMessage = {
            role: "system",
            content: `BẠN LÀ: Chuyên gia Bất Động Sản hàng đầu của Happy Land (${host}).
THỜI GIAN: ${date}

NGUYÊN TẮC:
1. Trả lời đúng trọng tâm. Khi khách hỏi về BĐS, hãy hỏi thêm về nhu cầu cụ thể.
2. Mục tiêu: Lấy SĐT khách hàng để tư vấn chi tiết.
3. Không bịa đặt thông tin. Nếu không có dữ liệu, hãy nói rõ.
4. Trả lời thân thiện, chuyên nghiệp bằng tiếng Việt.
5. Giới thiệu các dự án phù hợp với nhu cầu của khách.`
        };

        const requestBody = {
            model: "google/gemini-2.5-flash",
            messages: [systemMessage, ...messages],
            stream: true,
            max_tokens: 1024,
        };

        console.log("[Chat API] Request body:", JSON.stringify(requestBody, null, 2));

        // Call OpenRouter directly with Chat Completions API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Happy Land Chatbot",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Chat API] OpenRouter error:", errorText);
            return new Response(JSON.stringify({ error: "OpenRouter API Error", details: errorText }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Stream response in AI SDK v5 UIMessage format (SSE)
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                const messageId = `msg_${randomUUID()}`;
                const textId = `text_${randomUUID()}`;
                let fullContent = '';
                let sentStart = false;

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n').filter(line => line.trim());

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') {
                                    // Send text-end
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`));
                                    // Send finish message
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish", messageId: messageId, finishReason: "stop" })}\n\n`));
                                    continue;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    const delta = parsed.choices?.[0]?.delta;

                                    if (delta?.content) {
                                        // Send message-start and text-start only once
                                        if (!sentStart) {
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start", messageId: messageId })}\n\n`));
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: textId })}\n\n`));
                                            sentStart = true;
                                        }

                                        fullContent += delta.content;
                                        // Send text-delta in AI SDK v5 format
                                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: textId, delta: delta.content })}\n\n`));
                                    }
                                } catch (parseError) {
                                    // Skip non-JSON lines
                                }
                            }
                        }
                    }

                    // If no content was sent, send empty finish
                    if (!sentStart) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start", messageId: messageId })}\n\n`));
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: textId })}\n\n`));
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: textId })}\n\n`));
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "finish", messageId: messageId, finishReason: "stop" })}\n\n`));
                    }

                    // Save session to database
                    try {
                        const allMessages = [...messages, { role: 'assistant', content: fullContent }];
                        await prisma.chatSession.upsert({
                            where: { sessionId },
                            update: {
                                messages: JSON.stringify(allMessages),
                                updatedAt: new Date()
                            },
                            create: {
                                sessionId,
                                messages: JSON.stringify(allMessages),
                                updatedAt: new Date(),
                            }
                        });
                        console.log("[Chat API] Session saved:", sessionId);
                    } catch (dbError) {
                        console.error("[Chat API] DB Error:", dbError);
                    }
                } catch (streamError) {
                    console.error("[Chat API] Stream error:", streamError);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(streamError) })}\n\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error("[Chat API] Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
