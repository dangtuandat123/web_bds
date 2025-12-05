import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { searchProperties, createLead } from '@/lib/ai/tools'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Configure OpenRouter client
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

// Tool Definitions
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'searchProperties',
            description: 'Tìm kiếm bất động sản. ƯU TIÊN GỌI HÀM NÀY NGAY khi người dùng nhắc đến nhu cầu.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Từ khóa tìm kiếm chung. Ví dụ: "chung cư cao cấp", "nhà mặt tiền".',
                    },
                    district: {
                        type: 'string',
                        description: 'Quận/Huyện. Ví dụ: "Quận 9", "Thủ Đức".',
                    },
                    type: {
                        type: 'string',
                        enum: ['APARTMENT', 'HOUSE', 'LAND', 'RENT', 'VILLA'],
                        description: 'Loại hình BĐS. APARTMENT=Căn hộ, HOUSE=Nhà phố, LAND=Đất nền, RENT=Cho thuê, VILLA=Biệt thự.',
                    },
                    minPrice: { type: 'number', description: 'Giá tối thiểu (tỷ đồng)' },
                    maxPrice: { type: 'number', description: 'Giá tối đa (tỷ đồng)' },
                    minArea: { type: 'number', description: 'Diện tích tối thiểu (m2)' },
                    direction: { type: 'string', description: 'Hướng nhà (Đông, Tây, Nam, Bắc...)' },
                    limit: { type: 'number', description: 'Số lượng kết quả tối đa. Mặc định 5.' },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'createLead',
            description: 'Lưu thông tin khách hàng. Chỉ gọi khi khách hàng cung cấp Tên và SĐT.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Tên khách hàng' },
                    phone: { type: 'string', description: 'Số điện thoại khách hàng' },
                    message: { type: 'string', description: 'Lời nhắn hoặc nhu cầu cụ thể' },
                },
                required: ['name', 'phone'],
            },
        },
    },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// System prompt generator - SALES AGGRESSIVE VERSION
const getSystemPrompt = (host: string, date: string) => `
BẠN LÀ: Top Sales Bất Động Sản của Happy Land (${host}) - Chuyên gia tư vấn hàng đầu.
THỜI GIAN: ${date}

SỨ MỆNH: Tìm nhà phù hợp cho khách VÀ chốt thông tin liên hệ để Sale gọi tư vấn sâu.

═══════════════════════════════════════════════════════════════
🎯 QUY TRÌNH BÁN HÀNG (TUÂN THỦ NGHIÊM NGẶT):
═══════════════════════════════════════════════════════════════

Bước 1️⃣: PHÂN TÍCH & TÌM KIẾM
- Khách nói "nhà căn", "chung cư", "đất" → Hiểu ngay là cần tìm BĐS.
- Tìm kiếm RỘNG bằng tool \`searchProperties\` với từ khóa linh hoạt.
- Ví dụ: "Tìm căn hộ Q9 dưới 3 tỷ" → \`searchProperties({ query: "căn hộ", district: "Quận 9", maxPrice: 3 })\`
- Nếu khách hỏi chung chung "Có nhà không?" → Gọi \`searchProperties({ limit: 5 })\` để show ngay BĐS mới nhất.

Bước 2️⃣: TRÌNH BÀY KẾT QUẢ (DÙNG MARKDOWN LINK)
- Format: \`[Tiêu đề BĐS](url_từ_tool)\`
- Ví dụ: \`[Căn hộ Vinhomes 3PN - 3.5 tỷ](/nha-dat/vinhomes-abc)\`
- Hiển thị 3-5 căn, kèm giá, diện tích.

Bước 3️⃣: CHỐT KHÁCH (QUAN TRỌNG NHẤT ⚠️)
📌 SAU KHI GỬI LINK NHÀ, BẮT BUỘC PHẢI HỎI:
   "Anh/chị cho em xin Họ Tên và Số Điện Thoại để em gửi sổ hồng, pháp lý chi tiết qua Zalo cho mình nhé? 📄✨"

- Nếu khách đưa SĐT → GỌI NGAY \`createLead\` để lưu.
- Nếu khách từ chối → Hỏi lại nhẹ nhàng: "Hoặc anh/chị để lại SĐT, Sale sẽ tư vấn thêm về giá ưu đãi đặc biệt ạ."

═══════════════════════════════════════════════════════════════
💬 GIỌNG ĐIỆU:
═══════════════════════════════════════════════════════════════
- Nhiệt tình, chuyên nghiệp như Sales thực thụ.
- Dùng emoji vừa phải: 🏡 ✨ 📞
- Xưng "Em" - "Anh/Chị".
- Ngắn gọn, dễ hiểu.

⚠️ LƯU Ý:
- TUYỆT ĐỐI không bịa BĐS. Chỉ dùng data từ Tool.
- LUÔN LUÔN hỏi SĐT sau khi gửi link nhà.
`;

// Enhanced prompt (ASCII-safe) used for runtime
const getSalesPrompt = (host: string, date: string) => `
BAN LA?: Top Sales Bat Dong San cua Happy Land (${host}) - chuyen gia tu van ban hang.
THOI GIAN: ${date}

MUC TIEU: Tim BĐS phu hop, hien link ket qua ro rang, va xin thong tin lien he de ho tro sau.

Quy trinh:
1) Phan tich nhu cau, goi tool searchProperties ngay. Neu khach hoi chung chung -> searchProperties({ limit: 5 }).
2) Tra ve 3-5 ket qua dang Markdown link [Tieu de](url) kem gia/dien tich.
3) Chot khach: sau khi gui link, BAT BUOC hoi Ho Ten + SDT. Neu co SDT -> goi createLead.
4) Sau khi hien danh sach nha, goi y khach bam xem chi tiet hoac hoi nhu cau khac.

Giong noi: nhiet tinh, ngan gon, ro rang, xung ho Em - Anh/Chi, emoji vua phai. Tuyet doi khong bia thong tin khong co du lieu.
`;

export async function POST(req: Request) {
    try {
        const { messages, sessionId: clientSessionId } = await req.json()

        // Generate or use existing session ID
        const sessionId = clientSessionId || randomUUID()

        // Get dynamic context
        const host = req.headers.get('host') || 'happyland.me'
        const date = new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const systemPrompt = getSalesPrompt(host, date)

        if (!process.env.OPENROUTER_API_KEY) {
            return new Response('OpenRouter API key not configured', { status: 500 })
        }

        // Initial call to model
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.5-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            tools,
            tool_choice: 'auto',
        })

        const responseMessage = response.choices[0].message

        // Check if response is completely empty
        if (!responseMessage.content && !responseMessage.tool_calls) {
            console.error('[AI Error] Model returned empty response')
            return new Response(JSON.stringify({
                error: 'AI model returned empty response. Please try again.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Handle Tool Calls
        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls

            // CRITICAL: Append assistant's tool call message to history to maintain context
            const newMessages = [
                { role: 'system', content: systemPrompt },
                ...messages,
                responseMessage
            ]

            // Execute tools
            for (const toolCall of toolCalls) {
                const functionName = (toolCall as any).function.name
                const functionArgs = JSON.parse((toolCall as any).function.arguments)
                let functionResult = ''

                if (functionName === 'searchProperties') {
                    functionResult = await searchProperties(
                        functionArgs.query || '',
                        functionArgs.minPrice,
                        functionArgs.maxPrice,
                        functionArgs.minArea,
                        functionArgs.direction,
                        functionArgs.district,
                        functionArgs.type,
                        functionArgs.limit
                    )
                } else if (functionName === 'createLead') {
                    functionResult = await createLead(functionArgs.name, functionArgs.phone, functionArgs.message)
                }

                // Append tool result to history
                newMessages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResult,
                } as any)
            }

            // Second call to model with COMPLETE history (User + Assistant Tool Call + Tool Result)
            const secondResponse = await openai.chat.completions.create({
                model: 'google/gemini-2.5-flash',
                stream: true,
                messages: newMessages as any,
                tools,
                tool_choice: 'none', // Don't allow more tool calls after executing
                temperature: 0.7,
            })

            const stream = OpenAIStream(secondResponse as any, {
                async onFinal(completion) {
                    // Save chat session to database
                    try {
                        await prisma.chatSession.upsert({
                            where: { sessionId },
                            create: {
                                sessionId,
                                messages: [
                                    ...messages,
                                    { role: 'assistant', content: completion }
                                ],
                                metadata: {
                                    host,
                                    lastUpdated: new Date().toISOString()
                                }
                            },
                            update: {
                                messages: [
                                    ...messages,
                                    { role: 'assistant', content: completion }
                                ],
                                metadata: {
                                    host,
                                    lastUpdated: new Date().toISOString()
                                }
                            }
                        })
                    } catch (error) {
                        console.error('[Chat Session] Save failed:', error)
                    }
                }
            })
            return new StreamingTextResponse(stream)
        }

        // Check if response has content
        if (!responseMessage.content) {
            return new Response(JSON.stringify({
                error: 'Model returned empty response'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // If no tool calls, just stream the response
        const streamResponse = await openai.chat.completions.create({
            model: 'google/gemini-2.5-flash',
            stream: true,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
        })

        const stream = OpenAIStream(streamResponse as any, {
            async onFinal(completion) {
                // Save chat session to database
                try {
                    await prisma.chatSession.upsert({
                        where: { sessionId },
                        create: {
                            sessionId,
                            messages: [
                                ...messages,
                                { role: 'assistant', content: completion }
                            ],
                            metadata: {
                                host,
                                lastUpdated: new Date().toISOString()
                            }
                        },
                        update: {
                            messages: [
                                ...messages,
                                { role: 'assistant', content: completion }
                            ],
                            metadata: {
                                host,
                                lastUpdated: new Date().toISOString()
                            }
                        }
                    })
                } catch (error) {
                    console.error('[Chat Session] Save failed:', error)
                }
            }
        })
        return new StreamingTextResponse(stream)

    } catch (error) {
        console.error('Chat API Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
