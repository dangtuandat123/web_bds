import { streamText, tool, convertToCoreMessages, CoreMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { searchVectorDB, createLead } from '@/lib/ai/tools'
import { SearchVectorDBArgs, CreateLeadArgs } from '@/types'

// Configure OpenRouter Provider
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

// System prompt generator
const getSystemPrompt = (host: string, date: string) => `
BẠN LÀ: Chuyên gia BDS Happy Land (${host}), thời gian: ${date}.
NHIỆM VỤ: Tư vấn và CHỐT KHÁCH (lấy SĐT).

NGUYÊN TẮC BẮT BUỘC:
1. **TÌM KIẾM TRƯỚC**: Luôn gọi \`searchVectorDB\` KHI khách hỏi về BDS.
   - Không có kết quả -> Nói thẳng "Hiện chưa có căn nào khớp 100%" -> Gợi ý căn gần nhất.
   - TUYỆT ĐỐI KHÔNG BỊA ĐẶT thông tin.
2. **CHỐT SALE**:
   - Cuối mỗi câu trả lời phải MỤC TIÊU LẤY SĐT.
   - VD: "Anh/chị để lại SĐT em gửi sơ hồng qua Zalo nhé?", "Em có thể gọi tư vấn kỹ hơn không ạ?"
3. **LƯU LEAD**:
   - Ngay khi khách đưa Tên/SĐT -> Gọi \`createLead\` NGAY LẬP TỨC.
4. **PHONG CÁCH**:
   - Ngắn gọn, chuyên nghiệp, tự tin.
   - Chỉ đưa ra tối đa 3 lựa chọn tốt nhất.
`;

// Helper to sanitize messages for OpenRouter/Gemini compatibility
function sanitizeMessages(messages: CoreMessage[]): CoreMessage[] {
    return messages.map(msg => {
        // Handle content if it's an array (common in Vercel AI SDK for multimodal/tools)
        if (Array.isArray(msg.content)) {
            // Extract text parts
            const textContent = msg.content
                .filter(part => part.type === 'text')
                .map(part => (part as any).text)
                .join('\n');

            // For tool-result, we might want to keep it as is or stringify?
            // OpenRouter/Gemini often expects 'user' role for tool results if not strictly supported
            // But here we just want to ensure 'content' is a string for normal messages.

            return {
                ...msg,
                content: textContent || '' // Ensure string
            } as CoreMessage;
        }

        // If content is not a string (and not an array, e.g. object?), stringify it
        if (msg.content && typeof msg.content !== 'string') {
            return {
                ...msg,
                content: JSON.stringify(msg.content)
            } as CoreMessage;
        }

        return msg;
    });
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        const host = req.headers.get('host') || 'happyland.me'
        const date = new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const systemPrompt = getSystemPrompt(host, date)

        if (!process.env.OPENROUTER_API_KEY) {
            return new Response('OpenRouter API key missing', { status: 500 })
        }

        // 1. Convert UI messages to Core messages
        const coreMessages = convertToCoreMessages(messages)

        // 2. Sanitize messages for OpenRouter (flatten text arrays)
        const sanitizedMessages = sanitizeMessages(coreMessages)

        // 3. Call AI with Tools and ReAct logic
        try {
            const result = await streamText({
                model: openrouter('google/gemini-2.5-flash'),
                system: systemPrompt,
                messages: sanitizedMessages,
                tools: {
                    searchVectorDB: (tool as any)({
                        description: 'Tìm kiếm bất động sản. ƯU TIÊN GỌI HÀM NÀY NGAY khi người dùng nhắc đến nhu cầu.',
                        parameters: z.object({
                            query: z.string().describe('Mô tả nhu cầu tìm kiếm').default(''),
                            limit: z.number().optional().describe('Số kết quả tối đa').default(5),
                        }),
                        execute: async ({ query, limit }: { query: string, limit?: number }) => {
                            console.log(`[Tool] searchVectorDB: ${query}`)
                            if (!query) return 'Vui lòng cung cấp thông tin tìm kiếm cụ thể hơn.';
                            try {
                                return await searchVectorDB(query, limit)
                            } catch (error) {
                                console.error('[Tool Error] searchVectorDB:', error)
                                return 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.'
                            }
                        },
                    }),
                    createLead: (tool as any)({
                        description: 'Lưu thông tin khách hàng.',
                        parameters: z.object({
                            name: z.string().describe('Tên khách hàng').default('Khách hàng'),
                            phone: z.string().describe('Số điện thoại').default(''),
                            message: z.string().optional().describe('Lời nhắn'),
                        }),
                        execute: async ({ name, phone, message }: { name: string, phone: string, message?: string }) => {
                            console.log(`[Tool] createLead: ${name}, ${phone}`)
                            if (!phone) return 'Vui lòng cung cấp số điện thoại để lưu thông tin.';
                            try {
                                return await createLead(name, phone, message)
                            } catch (error) {
                                console.error('[Tool Error] createLead:', error)
                                return 'Lỗi lưu thông tin. Vui lòng thử lại sau.'
                            }
                        },
                    }),
                },
                onStepFinish: (step) => {
                    console.log('[Chat] Step finished:', JSON.stringify(step, null, 2))
                },
            })

            // Debug logging
            console.log('[Debug] streamText result keys:', Object.keys(result))

            if (result && typeof (result as any).toDataStreamResponse === 'function') {
                return (result as any).toDataStreamResponse()
            } else if (result && typeof (result as any).toTextStreamResponse === 'function') {
                console.warn('[Warning] Using toTextStreamResponse as fallback.')
                return (result as any).toTextStreamResponse()
            } else {
                console.error('[Critical] Result object is invalid:', result)
                return new Response(JSON.stringify({ error: 'AI Service Error: Invalid response from model' }), { status: 500 })
            }

        } catch (streamError: any) {
            console.error('[Stream Error]', streamError)
            return new Response(JSON.stringify({ error: streamError.message || 'Stream Error' }), { status: 500 })
        }

    } catch (error: any) {
        console.error('Chat API Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
