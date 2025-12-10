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
        const host = req.headers.get("host") || "example.com";
        const date = new Date().toLocaleDateString("vi-VN");

        // Get site name from settings
        const siteName = await getSetting('site_name') || 'Bất Động Sản';

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
            content: `BẠN LÀ: Trợ lý AI Agent tư vấn Bất Động Sản của ${siteName} (${host}).
THỜI GIAN: ${date}

TÍNH CÁCH:
- Xưng hô: "em" với khách, gọi khách là "anh/chị"
- Thân thiện, nhiệt tình, chuyên nghiệp
- Ngắn gọn, tối đa 80 từ

BẠN CÓ CÁC CÔNG CỤ (TOOLS):
1. search_properties: Tìm kiếm BĐS khi khách hỏi
2. save_customer_info: LƯU thông tin khách hàng (SĐT, tên)
3. get_project_detail: Lấy chi tiết dự án cụ thể

⚠️ QUY TẮC QUAN TRỌNG VỀ LƯU SĐT:
- Khi khách NÓI số điện thoại (VD: "0909123456", "sđt 091...", "số em là...") → BẮT BUỘC gọi save_customer_info
- Khi khách cho tên + SĐT → Gọi save_customer_info(phone="...", name="...")
- Số điện thoại VN có 10 số, bắt đầu bằng 0 (03x, 05x, 07x, 08x, 09x)
- KHÔNG ĐƯỢC bỏ qua khi khách cho SĐT, LUÔN LUÔN phải gọi tool để lưu

CÁCH LÀM VIỆC:
- Khi khách hỏi về BĐS → Gọi search_properties
- Khi khách để lại thông tin liên hệ → Gọi save_customer_info
- Sau khi lưu SĐT → Cảm ơn và xác nhận đã lưu

VÍ DỤ NHẬN DIỆN SĐT:
- "sđt 0909123456" → save_customer_info(phone="0909123456")
- "em là Hoa, số 0912345678" → save_customer_info(phone="0912345678", name="Hoa")
- "0987654321, tên Minh" → save_customer_info(phone="0987654321", name="Minh")
- "liên hệ số 0901234567 nhé" → save_customer_info(phone="0901234567")`
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
                    // X-Title removed to avoid ByteString encoding error with Vietnamese characters
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

                    const toolResult = await executeTool(toolName, toolArgs, sessionId);
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

        // Prepare CTA message
        const ctaMessages = [
            "Anh/chị quan tâm đến căn nào để em tư vấn chi tiết hơn ạ?",
            "Anh/chị để lại SĐT để em liên hệ tư vấn trực tiếp nhé!",
            "Anh/chị cho em xin SĐT để được hỗ trợ tốt nhất ạ!"
        ];

        const hasPhoneRequest = finalResponse.toLowerCase().includes('sđt') ||
            finalResponse.toLowerCase().includes('số điện thoại') ||
            finalResponse.toLowerCase().includes('liên hệ');

        // CTA will be added AFTER the property cards
        const ctaText = (properties.length > 0 && !hasPhoneRequest)
            ? '\n\n' + ctaMessages[Math.floor(Math.random() * ctaMessages.length)]
            : '';

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

                    // Append property marker (cards will be rendered from this)
                    if (propertyMarker) {
                        const escapedMarker = JSON.stringify(propertyMarker);
                        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escapedMarker}}\n\n`));
                    }

                    // Append CTA AFTER the property cards
                    if (ctaText) {
                        const escapedCta = JSON.stringify(ctaText);
                        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"${textId}","delta":${escapedCta}}\n\n`));
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
