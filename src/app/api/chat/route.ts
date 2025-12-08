import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { executeTool } from "@/lib/ai/tools";
import { toolDefinitions, ToolCall } from "@/lib/ai/tool-definitions";
import { getSetting } from "@/app/actions/settings";

export const maxDuration = 60;

interface Message {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

interface PropertyResult {
    title: string;
    price: string | number;
    area?: number;
    location?: string;
    url?: string;
    thumbnailUrl?: string;
    type?: string;
}

export async function POST(req: Request) {
    try {
        const { messages: uiMessages, sessionId: clientSessionId } = await req.json();
        const sessionId = clientSessionId || randomUUID();
        const host = req.headers.get("host") || "happyland.me";
        const date = new Date().toLocaleDateString("vi-VN");

        // Convert UI messages
        let processedMessages: Message[] = uiMessages.map((m: any) => {
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

        processedMessages = processedMessages.filter((m) => m.content && m.content.trim());
        const firstUserIndex = processedMessages.findIndex((m) => m.role === 'user');
        const messages: Message[] = firstUserIndex >= 0 ? processedMessages.slice(firstUserIndex) : processedMessages;

        const OPENROUTER_API_KEY = await getSetting('api_openrouter') || process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({ error: "API key not configured" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const systemMessage: Message = {
            role: "system",
            content: `BẠN LÀ: Trợ lý AI Agent tư vấn Bất Động Sản của Happy Land (${host}).
THỜI GIAN: ${date}

TÍNH CÁCH:
- Xưng hô: "em" với khách, gọi khách là "anh/chị"
- Thân thiện, nhiệt tình, chuyên nghiệp
- Ngắn gọn, tối đa 100 từ mỗi câu trả lời

BẠN CÓ CÁC CÔNG CỤ (TOOLS):
1. search_properties: Tìm kiếm BĐS khi khách hỏi về căn hộ, dự án, nhà đất
2. save_customer_info: Lưu thông tin khi khách để lại SĐT/tên
3. get_project_detail: Lấy chi tiết dự án cụ thể

CÁCH LÀM VIỆC:
- Khi khách hỏi về BĐS → GỌI TOOL search_properties để tìm
- Khi khách để lại SĐT → GỌI TOOL save_customer_info để lưu
- Dựa trên kết quả tool để trả lời khách CHÍNH XÁC
- KHÔNG bịa thông tin, chỉ dùng dữ liệu từ tools
- Sau khi tư vấn, gợi ý khách để lại SĐT

VÍ DỤ:
- Khách: "Tìm căn hộ 2PN quận 2" → Gọi search_properties(query="căn hộ 2PN quận 2")
- Khách: "SĐT em là 0909123456" → Gọi save_customer_info(phone="0909123456")`
        };

        // Agent Loop - Max 3 iterations
        const MAX_ITERATIONS = 3;
        let agentMessages: Message[] = [systemMessage, ...messages];
        let finalResponse = '';
        let iteration = 0;
        let properties: PropertyResult[] = []; // Collect properties from tool results

        while (iteration < MAX_ITERATIONS) {
            iteration++;
            console.log(`[Agent] Iteration ${iteration}`);

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": `https://${host}`,
                    "X-Title": "Happy Land AI Agent",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: agentMessages,
                    tools: toolDefinitions,
                    tool_choice: "auto",
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[Agent] API Error:", errorText);
                break;
            }

            const data = await response.json();
            const choice = data.choices?.[0];
            const assistantMessage = choice?.message;

            if (!assistantMessage) break;

            // Check for tool calls
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                console.log("[Agent] Tool calls detected:", assistantMessage.tool_calls.length);

                // Add assistant message with tool calls
                agentMessages.push({
                    role: "assistant",
                    content: assistantMessage.content || "",
                    tool_calls: assistantMessage.tool_calls
                });

                // Execute each tool and add results
                for (const toolCall of assistantMessage.tool_calls) {
                    const toolName = toolCall.function.name;
                    let toolArgs = {};

                    try {
                        toolArgs = JSON.parse(toolCall.function.arguments || "{}");
                    } catch (e) {
                        console.error("[Agent] Failed to parse tool args:", e);
                    }

                    const toolResult = await executeTool(toolName, toolArgs);
                    console.log(`[Agent] Tool ${toolName} result:`, toolResult.substring(0, 200));

                    // Extract properties from search_properties tool result
                    if (toolName === 'search_properties') {
                        try {
                            const parsed = JSON.parse(toolResult);
                            if (parsed.success && parsed.properties && parsed.properties.length > 0) {
                                properties = parsed.properties.map((p: any) => ({
                                    title: p.title || 'Bất động sản',
                                    price: p.price || 'Liên hệ',
                                    area: p.area,
                                    location: p.location,
                                    url: p.url || '/',
                                    thumbnailUrl: p.thumbnailUrl,
                                    type: p.type,
                                }));
                                console.log(`[Agent] Extracted ${properties.length} properties for cards`);
                            }
                        } catch (e) {
                            console.error("[Agent] Failed to parse properties:", e);
                        }
                    }

                    agentMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: toolResult
                    });
                }

                // Continue loop to get AI's response after tool execution
                continue;
            }

            // No tool calls - this is the final response
            finalResponse = assistantMessage.content || '';
            break;
        }

        // Stream the final response
        const messageId = `msg_${randomUUID()}`;
        const textId = `text_${randomUUID()}`;
        const encoder = new TextEncoder();

        // Prepare property marker to append after AI response
        const propertyMarker = properties.length > 0
            ? `\n\n<!-- PROPERTIES:${JSON.stringify(properties)} -->`
            : '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    controller.enqueue(encoder.encode(`data: {"type":"start","messageId":"${messageId}"}\n\n`));
                    controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"${textId}"}\n\n`));

                    // Stream response word by word for better UX
                    const words = finalResponse.split(' ');
                    for (const word of words) {
                        const chunk = word + ' ';
                        const escaped = JSON.stringify(chunk);
                        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escaped}}\n\n`));
                        await new Promise(r => setTimeout(r, 20)); // Small delay for typing effect
                    }

                    // Append property marker at the end
                    if (propertyMarker) {
                        const escapedMarker = JSON.stringify(propertyMarker);
                        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escapedMarker}}\n\n`));
                    }

                    controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"${textId}"}\n\n`));
                    controller.enqueue(encoder.encode(`data: {"type":"finish","messageId":"${messageId}","finishReason":"stop"}\n\n`));

                } catch (error) {
                    console.error("[Agent] Stream error:", error);
                } finally {
                    // Save session
                    const messagesWithResponse = [
                        ...messages,
                        { role: 'assistant', content: finalResponse + propertyMarker }
                    ];

                    prisma.chatsession.upsert({
                        where: { sessionId },
                        update: { messages: JSON.stringify(messagesWithResponse), updatedAt: new Date() },
                        create: { sessionId, messages: JSON.stringify(messagesWithResponse), updatedAt: new Date() }
                    }).catch((e: any) => console.error("[Agent] DB Error:", e));

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
        console.error("[Agent] Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
