import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { searchVectorDB } from "@/lib/ai/tools";

export const maxDuration = 60;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

        // Convert UI messages to proper format
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

        // Filter empty messages
        processedMessages = processedMessages.filter((m: any) => m.content && m.content.trim());
        const firstUserIndex = processedMessages.findIndex((m: any) => m.role === 'user');
        const messages = firstUserIndex >= 0 ? processedMessages.slice(firstUserIndex) : processedMessages;

        // Get latest user message for RAG
        const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
        const userQuery = lastUserMessage?.content || '';

        console.log("[Chat API] User query:", userQuery);

        // RAG: Search vector database
        let ragContext = '';
        let properties: PropertyResult[] = [];

        // Known locations in our database
        const knownLocations = ['thủ đức', 'thu duc', 'tp thủ đức', 'quận 2', 'district 2', 'an phú', 'thảo điền'];

        // Locations that indicate specific but unavailable areas
        const queryLower = userQuery.toLowerCase();
        const unavailableLocations = ['gia lai', 'đà nẵng', 'hà nội', 'hải phòng', 'cần thơ', 'bình dương', 'đồng nai', 'long an', 'bà rịa', 'vũng tàu'];

        // Check if user is asking for a specific unavailable location
        const isAskingUnavailableLocation = unavailableLocations.some(loc => queryLower.includes(loc));

        if (userQuery && !isAskingUnavailableLocation) {
            try {
                const searchResults = await searchVectorDB(userQuery, 5);
                console.log("[Chat API] RAG results:", searchResults);

                if (typeof searchResults === 'string' && searchResults.startsWith('[')) {
                    const parsed = JSON.parse(searchResults);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Transform for UI cards
                        properties = parsed.map((p: any) => ({
                            title: p.title || 'Bất động sản',
                            price: typeof p.price === 'number' ? `${p.price} tỷ` : (p.price || 'Liên hệ'),
                            area: p.area,
                            location: p.location,
                            url: p.url || '/',
                            thumbnailUrl: p.thumbnailUrl,
                            type: p.type === 'PROJECT' ? 'Dự án' : (p.type === 'LISTING' ? 'Tin đăng' : p.type),
                        }));

                        // Context for AI
                        ragContext = `\n\n🏠 DỮ LIỆU BẤT ĐỘNG SẢN TÌM ĐƯỢC:\n`;
                        properties.forEach((p, i) => {
                            ragContext += `${i + 1}. ${p.title} - Giá: ${p.price}${p.area ? `, ${p.area}m²` : ''}${p.location ? `, ${p.location}` : ''}\n`;
                        });
                    }
                }
            } catch (ragError) {
                console.error("[Chat API] RAG Error:", ragError);
            }
        } else if (isAskingUnavailableLocation) {
            console.log("[Chat API] User asking for unavailable location, skipping RAG");
        }

        const hasRelevantData = properties.length > 0;

        const systemMessage = {
            role: "system",
            content: `BẠN LÀ: Trợ lý AI tư vấn Bất Động Sản của Happy Land (${host}).
THỜI GIAN: ${date}

TÍNH CÁCH:
- Xưng hô: "em" với khách, gọi khách là "anh/chị"
- Thân thiện, nhiệt tình, chuyên nghiệp
- Ngắn gọn, tối đa 80 từ mỗi câu trả lời

CÁCH TRẢ LỜI:
1. CÂU CHÀO/HỎI THĂM → Chào lại lịch sự, hỏi "Anh/chị đang quan tâm đến loại BĐS nào ạ?"
2. TÌM KIẾM BĐS:
   - ${hasRelevantData ? 'CÓ dữ liệu phù hợp → Giới thiệu TÊN, GIÁ, DIỆN TÍCH, VỊ TRÍ từ danh sách bên dưới.' : 'KHÔNG có dữ liệu phù hợp → Nói "Hiện tại Happy Land chưa có BĐS phù hợp với yêu cầu của anh/chị."'}
   - KHÔNG bịa đặt, KHÔNG đề xuất BĐS khác vị trí nếu khách hỏi vị trí cụ thể.
3. YÊU CẦU GIÁ/NGÂN SÁCH → Hỏi rõ ngân sách, vị trí mong muốn.
4. CÂU HỎI KHÁC → Trả lời nếu biết, hoặc "Em sẽ chuyển cho bộ phận chuyên môn."
5. LUÔN gợi ý: "Anh/chị để lại SĐT để em tư vấn chi tiết nhé!"

${ragContext || '📋 KHÔNG CÓ DỮ LIỆU BĐS PHÙ HỢP trong hệ thống.'}`
        };

        console.log("[Chat API] Found", properties.length, "properties");

        const requestBody = {
            model: "google/gemini-2.5-flash",
            messages: [systemMessage, ...messages],
            stream: true,
            max_tokens: 300,
        };

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
            return new Response(JSON.stringify({ error: "API Error" }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        const messageId = `msg_${randomUUID()}`;
        const textId = `text_${randomUUID()}`;
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        let buffer = '';
        let startSent = false;

        // Prepare property marker to append after AI response
        const propertyMarker = properties.length > 0
            ? `\n\n<!-- PROPERTIES:${JSON.stringify(properties)} -->`
            : '';

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body!.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (!line.startsWith('data: ')) continue;
                            const data = line.slice(6).trim();

                            if (data === '[DONE]') {
                                // Append property marker before finish
                                if (propertyMarker) {
                                    const escaped = JSON.stringify(propertyMarker);
                                    controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escaped}}\n\n`));
                                }
                                controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"${textId}"}\n\n`));
                                controller.enqueue(encoder.encode(`data: {"type":"finish","messageId":"${messageId}","finishReason":"stop"}\n\n`));
                                continue;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;

                                if (content) {
                                    if (!startSent) {
                                        controller.enqueue(encoder.encode(`data: {"type":"start","messageId":"${messageId}"}\n\n`));
                                        controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"${textId}"}\n\n`));
                                        startSent = true;
                                    }
                                    const escaped = JSON.stringify(content);
                                    controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escaped}}\n\n`));
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }

                    // Ensure stream ends properly
                    if (startSent) {
                        if (propertyMarker) {
                            const escaped = JSON.stringify(propertyMarker);
                            controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escaped}}\n\n`));
                        }
                        controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"${textId}"}\n\n`));
                        controller.enqueue(encoder.encode(`data: {"type":"finish","messageId":"${messageId}","finishReason":"stop"}\n\n`));
                    }
                } catch (error) {
                    console.error("[Chat API] Stream error:", error);
                } finally {
                    controller.close();
                }
            }
        });

        // Save session async
        prisma.chatSession.upsert({
            where: { sessionId },
            update: { updatedAt: new Date() },
            create: { sessionId, messages: JSON.stringify(messages), updatedAt: new Date() }
        }).catch(e => console.error("[Chat API] DB Error:", e));

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error("[Chat API] Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
