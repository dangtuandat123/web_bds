import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { executeTool } from "@/lib/ai/tools";
import { getSetting } from "@/app/actions/settings";

// Inline tool definitions to prevent tree-shaking
const toolDefinitions = [
    {
        type: "function" as const,
        function: {
            name: "search_properties",
            description: "Tìm kiếm bất động sản (dự án, căn hộ, nhà đất) theo yêu cầu của khách hàng. Gọi tool này khi khách hỏi về BĐS, căn hộ, nhà, đất, dự án.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Câu truy vấn tìm kiếm, ví dụ: 'căn hộ 2PN quận 2', 'biệt thự Thảo Điền', 'dự án Vinhomes'"
                    },
                    limit: {
                        type: "number",
                        description: "Số lượng kết quả tối đa, mặc định 5"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function" as const,
        function: {
            name: "save_customer_info",
            description: "Lưu thông tin liên hệ của khách hàng vào hệ thống. Gọi tool này khi khách để lại số điện thoại, email hoặc tên để được tư vấn.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Họ tên khách hàng"
                    },
                    phone: {
                        type: "string",
                        description: "Số điện thoại khách hàng"
                    },
                    email: {
                        type: "string",
                        description: "Email khách hàng (không bắt buộc)"
                    },
                    interest: {
                        type: "string",
                        description: "Khách đang quan tâm đến BĐS nào, ví dụ: 'căn hộ 2PN quận 2', 'dự án Vinhomes', 'nhà phố Thủ Đức'. Lấy từ ngữ cảnh cuộc hội thoại."
                    },
                    message: {
                        type: "string",
                        description: "Ghi chú thêm về nhu cầu của khách"
                    }
                },
                required: ["phone"]
            }
        }
    },
    {
        type: "function" as const,
        function: {
            name: "get_project_detail",
            description: "Lấy thông tin chi tiết của một dự án cụ thể. Gọi tool này khi khách hỏi sâu về một dự án mà bạn đã tìm được.",
            parameters: {
                type: "object",
                properties: {
                    slug: {
                        type: "string",
                        description: "Slug của dự án, ví dụ: 'vinhomes-grand-park'"
                    }
                },
                required: ["slug"]
            }
        }
    }
];

export const maxDuration = 60;

interface ToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string;
    };
}

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

BẠN CÓ CÁC CÔNG CỤ (TOOLS) - BẮT BUỘC PHẢI DÙNG:
1. search_properties: **BẮT BUỘC gọi khi khách hỏi về BĐS**
2. save_customer_info: LƯU thông tin khách hàng (SĐT, tên)
3. get_project_detail: Lấy chi tiết dự án cụ thể

⚠️ QUY TẮC BẮT BUỘC VỀ TÌM KIẾM:
- Khi khách hỏi "tìm", "có", "căn hộ", "nhà", "dự án" → **LUÔN LUÔN** gọi search_properties
- VÍ DỤ BẮT BUỘC phải search:
  * "Tìm căn hộ" → search_properties(query="căn hộ")
  * "Có dự án nào không?" → search_properties(query="dự án")
  * "Giá 2 tỷ" → search_properties(query="giá 2 tỷ")
  * "Quận 1" → search_properties(query="quận 1")
- KHÔNG TỰ TRẢ LỜI mà không search! Phải gọi tool trước!

⚠️ QUY TẮC VỀ LƯU SĐT (QUAN TRỌNG NHẤT):
- Khi user VIẾT SỐ ĐIỆN THOẠI (10 số bắt đầu 0) → **NGAY LẬP TỨC** gọi save_customer_info
- PHÁT HIỆN: 0123456789, 0912345678, 0987654321, etc
- KHÔNG HỎI XÁC NHẬN, GỌI TOOL NGAY!
- Sau khi gọi tool → Trả lời: "Em đã ghi nhận..."

CÁCH LÀM VIỆC:
1. Khách hỏi về BĐS → Gọi search_properties NGAY (không giải thích)
2. Có kết quả → Giới thiệu tóm tắt
3. Khách để lại SĐT → Gọi save_customer_info NGAY

VÍ DỤ SEARCH:
User: "Tìm căn hộ 2PN"
→ GỌI: search_properties(query="căn hộ 2 phòng ngủ")
→ TRẢ LỜI: "Em tìm được X căn hộ 2PN..."

VÍ DỤ LƯU SĐT (BẮT BUỘC):
User: "0912345678"
→ GỌI NGAY: save_customer_info(phone="0912345678")
→ TRẢ LỜI: "Em đã ghi nhận ạ!"

User: "Tôi là Tuấn, 0987654321"
→ GỌI NGAY: save_customer_info(phone="0987654321", name="Tuấn")

User: "Tìm căn 2PN, SĐT 0901234567"  
→ GỌI 1: search_properties(query="căn 2PN")
→ GỌI 2: save_customer_info(phone="0901234567", interest="căn 2PN")

QUAN TRỌNG: THẤY SĐT = GỌI TOOL NGAY!`
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
                    model: "google/gemini-2.5-flash",
                    messages: agentMessages,
                    tools: toolDefinitions,
                    tool_choice: "auto",
                    temperature: 0.1, // Low temp for consistent tool usage
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
                                properties = parsed.properties.map((p: any) => {
                                    const type = p.type;
                                    const slug = p.slug;
                                    const typeKey = (type || '')
                                        .toString()
                                        .toLowerCase()
                                        .normalize('NFD')
                                        .replace(/[\u0300-\u036f]/g, '');

                                    const url = p.url || (
                                        slug
                                            ? (typeKey.includes('du an') || typeKey.includes('project')
                                                ? `/du-an/${slug}`
                                                : (typeKey.includes('tin dang') || typeKey.includes('listing') || typeKey.includes('nha'))
                                                    ? `/nha-dat/${slug}`
                                                    : '/')
                                            : '/'
                                    );

                                    return {
                                        title: p.title || 'Bat dong san',
                                        price: p.price || 'Lien he',
                                        area: p.area,
                                        location: p.location,
                                        url,
                                        thumbnailUrl: p.thumbnailUrl,
                                        type,
                                        slug,
                                    };
                                });
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

        // Fallback if model returned empty content
        if (!finalResponse.trim()) {
            finalResponse = 'Em dang gap loi khi tra loi. Anh/chi cho em xin nhu cau va so dien thoai de em ho tro nhanh nhe.';
        }

        // Prepare CTA message
        const ctaMessages = [
            "Anh/chi dang quan tam can nao de em tu van chi tiet hon nhe?",
            "Anh/chi de lai so dien thoai de em lien he tu van ngay!",
            "Anh/chi cho em xin so dien thoai de ho tro tot nhat a!",
        ];

        const normalizedResponse = finalResponse
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');

        const hasPhoneRequest = /so\s*(dt|dien thoai)|sdt|lien he|lien lac/.test(normalizedResponse);

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
