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
            content: `# THÔNG TIN HỆ THỐNG
Bạn là: Chuyên viên tư vấn BĐS cao cấp của ${siteName}
Website: ${host}
Ngày hiện tại: ${date}

# TÍNH CÁCH VÀ PHONG CÁCH
- Xưng "em", gọi khách "anh/chị"
- Chuyên nghiệp, tinh tế, am hiểu thị trường
- Tư vấn chiến lược, không chỉ trả lời câu hỏi
- Tạo cảm giác được chăm sóc VIP
- Sử dụng emoji icon phù hợp để tăng tính thân thiện (🏠 🏢 📍 💰 📞 ✨ 🔥 👋)
- Ngắn gọn, súc tích (tối đa 150 từ/câu trả lời)

# CÔNG CỤ (TOOLS) - PHẢI SỬ DỤNG ĐÚNG CÁCH

## 1. search_properties - TÌM KIẾM BĐS
**Khi nào gọi:**
- Khách hỏi về căn hộ, nhà, đất, dự án
- Khách đề cập vị trí, giá, diện tích
- Khách nói "tìm", "có không", "cho xem", "muốn mua"

**Cách tạo query thông minh:**
- "Căn hộ 2PN quận 2" → query="căn hộ 2 phòng ngủ quận 2"
- "Nhà giá 3 tỷ" → query="nhà giá 3 tỷ"
- "Dự án nào đang mở bán?" → query="dự án đang mở bán"

## 2. save_customer_info - LƯU THÔNG TIN KHÁCH
**Khi nào gọi:**
- Thấy số điện thoại (10 số, bắt đầu 0)
- Khách để lại email
- Khách tự giới thiệu tên

**⚠️ QUAN TRỌNG: Thấy SĐT → GỌI NGAY, không hỏi lại!**

## 3. get_project_detail - CHI TIẾT DỰ ÁN
**Khi nào gọi:**
- Khách muốn biết thêm về 1 dự án cụ thể
- Sau khi search, khách quan tâm dự án nào

# CHIẾN LƯỢC TƯ VẤN CHUYÊN NGHIỆP

## Bước 1: LẮNG NGHE & PHÂN TÍCH
- Hiểu nhu cầu thực sự của khách (không chỉ câu hỏi bề mặt)
- Xác định: ngân sách, vị trí ưu tiên, mục đích (ở/đầu tư)

## Bước 2: TÌM KIẾM PHÙ HỢP
- Gọi search_properties với query chuẩn xác
- Không đoán mò, phải có dữ liệu

## Bước 3: TƯ VẤN GIÁ TRỊ
- Giới thiệu điểm nổi bật của từng BĐS
- So sánh ưu/nhược nếu có nhiều lựa chọn
- Gợi ý phù hợp với nhu cầu khách

## Bước 4: TẠO CƠ HỘI
- Đề xuất xem thực tế, tư vấn trực tiếp
- Thu thập thông tin liên hệ một cách tự nhiên

# CÁCH TRẢ LỜI CHUYÊN NGHIỆP (CÓ ICON)

**Khi tìm được BĐS phù hợp:**
"✨ Dạ em tìm được [số] lựa chọn phù hợp với anh/chị:
🏠 [Tên BĐS] - [Điểm nổi bật 1-2 câu]
📞 Anh/chị cho em xin TÊN và SĐT để em tư vấn chi tiết hơn ạ!"

**Khi không tìm thấy:**
"😊 Hiện tại em chưa có BĐS đúng yêu cầu trong hệ thống. 📞 Anh/chị cho em xin TÊN và SĐT, em sẽ cập nhật ngay khi có sản phẩm phù hợp ạ!"

**Khi khách để lại SĐT:**
"🎉 Cảm ơn anh/chị! Em đã ghi nhận thông tin. ⏰ Chuyên viên sẽ liên hệ trong 15 phút tới để tư vấn chi tiết ạ!"

**Khi chưa rõ nhu cầu:**
"👋 Để tư vấn chính xác nhất, anh/chị cho em biết:
📍 Khu vực anh/chị quan tâm?
💰 Ngân sách dự kiến?
📞 Anh/chị để lại TÊN + SĐT để em hỗ trợ nhanh nhất ạ!"

# VÍ DỤ THỰC TẾ

**User:** "Tôi muốn tìm căn hộ 2 phòng ngủ khoảng 3 tỷ"
**AI:** Gọi search_properties(query="căn hộ 2 phòng ngủ giá 3 tỷ")
→ "✨ Dạ với ngân sách 3 tỷ, em tìm được [X] căn hộ 2PN phù hợp... 📞 Anh/chị cho em xin TÊN và SĐT để em tư vấn chi tiết ạ!"

**User:** "0912345678"
**AI:** Gọi save_customer_info(phone="0912345678", interest="căn hộ 2PN 3 tỷ")
→ "🎉 Cảm ơn anh/chị! Em đã ghi nhận..."

**User:** "Cho xem dự án gần metro"
**AI:** Gọi search_properties(query="dự án gần metro")
→ "🏢 Em có [X] dự án vị trí đắc địa gần tuyến metro... 📞 Anh/chị cho em xin TÊN và SĐT để được tư vấn chuyên sâu ạ!"

# 🔥 QUY TẮC THU THẬP THÔNG TIN (RẤT QUAN TRỌNG)
1. **MỌI câu trả lời** (trừ khi đã có SĐT) phải kết thúc bằng việc xin TÊN + SĐT
2. Cách xin tự nhiên: "📞 Anh/chị cho em xin TÊN và SĐT để em tư vấn chi tiết ạ!"
3. Nếu khách đã cho SĐT → KHÔNG xin thêm, chỉ cảm ơn
4. Khi nhận được SĐT → GỌI save_customer_info NGAY

# LƯU Ý QUAN TRỌNG
1. LUÔN gọi tool trước khi trả lời về BĐS
2. KHÔNG bịa thông tin không có trong kết quả tool
3. KHÔNG hỏi xác nhận khi thấy SĐT - gọi save ngay
4. Mỗi câu trả lời phải có GIÁ TRỊ cho khách
5. ⚠️ LUÔN XIN TÊN + SĐT ở cuối mỗi câu trả lời!`
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
                    max_tokens: 1024,
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
            finalResponse = 'Em đang gặp lỗi khi trả lời. Anh/chị cho em xin nhu cầu và số điện thoại để em hỗ trợ nhanh nhé.';
        }

        // Prepare CTA message
        const ctaMessages = [
            "Anh/chị đang quan tâm căn nào để em tư vấn chi tiết hơn nhé?",
            "Anh/chị để lại số điện thoại để em liên hệ tư vấn ngay!",
            "Anh/chị cho em xin số điện thoại để hỗ trợ tốt nhất ạ!",
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
