import { streamText, tool, convertToCoreMessages, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { searchVectorDB, createLead } from '@/lib/ai/tools'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { z } from 'zod'

// Configure OpenRouter Provider (using OpenAI compatible API)
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

// System prompt generator - STRICT SALES PERSONA
const getSystemPrompt = (host: string, date: string) => `
BẠN LÀ: Chuyên gia Bất Động Sản hàng đầu của Happy Land (${host}).
THỜI GIAN: ${date}

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. **KHÔNG NÓI NHẢM:** Chỉ trả lời đúng trọng tâm câu hỏi. Nếu không tìm thấy thông tin, hãy nói thẳng "Hiện tại em chưa tìm thấy BĐS phù hợp với yêu cầu này" và gợi ý các lựa chọn khác gần nhất.
2. **TƯ DUY TRƯỚC KHI LÀM (ReAct):**
   - Luôn phân tích kỹ yêu cầu của khách hàng.
   - Sử dụng công cụ \`searchVectorDB\` để tìm kiếm thông tin chính xác từ cơ sở dữ liệu.
   - KHÔNG ĐƯỢC BỊA ĐẶT thông tin bất động sản.
3. **CHỐT KHÁCH:** Mục tiêu cuối cùng là lấy được thông tin liên hệ (SĐT).
   - Sau khi cung cấp thông tin nhà, LUÔN hỏi khéo: "Anh/chị thấy căn này thế nào ạ? Em gửi thêm sổ hồng qua Zalo cho mình nhé?"
   - Nếu khách quan tâm, hãy gợi ý họ để lại SĐT để được tư vấn kỹ hơn.
4. **PHÁP LÝ & QUY HOẠCH:**
   - Chỉ cung cấp thông tin pháp lý cơ bản (Sổ hồng, HĐMB) nếu có trong dữ liệu.
   - Tuyệt đối KHÔNG tư vấn pháp lý chuyên sâu hoặc cam kết lợi nhuận nếu không có căn cứ xác thực.

QUY TRÌNH TƯ VẤN:
Bước 1: Lắng nghe và Phân tích nhu cầu (Khu vực, Giá, Loại hình...).
Bước 2: Sử dụng \`searchVectorDB\` để tìm BĐS phù hợp.
Bước 3: Trình bày kết quả ngắn gọn, rõ ràng (kèm Link Markdown).
Bước 4: Mời khách để lại SĐT hoặc đặt lịch xem nhà.
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
        const systemPrompt = getSystemPrompt(host, date)

        // Call AI with ReAct Agent capabilities
        const result = await streamText({
            model: openrouter('google/gemini-2.5-flash'),
            system: systemPrompt,
            messages,
            stopWhen: stepCountIs(5), // Enable multi-step reasoning (ReAct)
            tools: {
                searchVectorDB: tool({
                    description: 'Tìm kiếm bất động sản trong cơ sở dữ liệu vector. Sử dụng khi khách hàng hỏi về mua bán, cho thuê nhà đất, căn hộ, dự án.',
                    parameters: z.object({
                        query: z.string().describe('Mô tả chi tiết nhu cầu tìm kiếm (VD: "chung cư quận 9 giá 3 tỷ", "nhà phố thủ đức").'),
                        limit: z.number().optional().describe('Số lượng kết quả tối đa. Mặc định là 5.'),
                    }) as any,
                    execute: async ({ query, limit }: { query: string; limit?: number }) => {
                        return await searchVectorDB(query, limit)
                    },
                } as any) as any,
                createLead: tool({
                    description: 'Lưu thông tin khách hàng tiềm năng. CHỈ GỌI khi khách hàng CUNG CẤP Tên và Số điện thoại.',
                    parameters: z.object({
                        name: z.string().describe('Tên khách hàng'),
                        phone: z.string().describe('Số điện thoại khách hàng'),
                        message: z.string().optional().describe('Ghi chú hoặc nhu cầu cụ thể'),
                    }) as any,
                    execute: async ({ name, phone, message }: { name: string; phone: string; message?: string }) => {
                        return await createLead(name, phone, message)
                    },
                } as any) as any,
            },
            onFinish: async ({ response }) => {
                // Save chat session to database
                try {
                    const responseMessages = response.messages;
                    const lastMessage = responseMessages[responseMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                        await prisma.chatSession.upsert({
                            where: { sessionId },
                            create: {
                                sessionId,
                                messages: [...messages, lastMessage],
                                metadata: { host, lastUpdated: new Date().toISOString() }
                            },
                            update: {
                                messages: [...messages, lastMessage],
                                metadata: { host, lastUpdated: new Date().toISOString() }
                            }
                        })
                    }
                } catch (error) {
                    console.error('[Chat Session] Save failed:', error)
                }
            }
        })

        return result.toUIMessageStreamResponse()

    } catch (error) {
        console.error('Chat API Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
