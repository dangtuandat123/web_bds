import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { searchProperties, createLead } from '@/lib/ai/tools'

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
            description: 'Tìm kiếm bất động sản. ƯU TIÊN GỌI HÀM NÀY NGAY khi người dùng nhắc đến nhu cầu (mua, thuê, tìm nhà...) dù thông tin chưa đầy đủ.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Từ khóa chính (địa điểm, tên dự án, loại hình). Ví dụ: "quận 9", "vinhomes", "chung cư"',
                    },
                    minPrice: { type: 'number', description: 'Giá tối thiểu (tỷ đồng)' },
                    maxPrice: { type: 'number', description: 'Giá tối đa (tỷ đồng)' },
                    minArea: { type: 'number', description: 'Diện tích tối thiểu (m2)' },
                    direction: { type: 'string', description: 'Hướng nhà (Đông, Tây, Nam, Bắc...)' },
                },
                required: ['query'],
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

// System prompt
const systemPrompt = `Bạn là chuyên gia tư vấn BĐS của Happy Land.

NGUYÊN TẮC VÀNG (PROACTIVE):
1. SEARCH FIRST, ASK LATER: Nếu khách nói "tìm nhà quận 9", GỌI NGAY \`searchProperties({query: "quận 9"})\`. Đừng hỏi "Bạn muốn giá bao nhiêu?" trước khi tìm.
2. ĐOÁN Ý: Nếu khách nói "tài chính 5 tỷ", hãy tự động thêm tham số \`maxPrice: 5\`.
3. HIỂN THỊ TRƯỚC: Luôn đưa ra danh sách BĐS tìm được trước, sau đó mới hỏi thêm chi tiết để lọc kỹ hơn.

QUY TẮC TRẢ LỜI:
- BẮT BUỘC dùng Markdown Link: [Tiêu đề](url) cho mọi BĐS.
- Không hiển thị URL trần.
- Giọng điệu: Nhiệt tình, chuyên nghiệp, ngắn gọn.

VÍ DỤ:
User: "Tìm căn hộ quận 2"
AI: (Gọi tool searchProperties) -> (Nhận kết quả) -> "Dạ, em tìm thấy vài căn hộ tốt ở Quận 2 cho anh/chị tham khảo:
1. [Masteri Thảo Điền - 3.5 tỷ](/nha-dat/masteri-td)
2. [The Vista - 4 tỷ](/nha-dat/the-vista)
Anh/chị thấy căn nào ưng ý không ạ? Hay mình muốn tìm mức giá khác?"`

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

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
                        functionArgs.query,
                        functionArgs.minPrice,
                        functionArgs.maxPrice,
                        functionArgs.minArea,
                        functionArgs.direction
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
            })

            const stream = OpenAIStream(secondResponse as any)
            return new StreamingTextResponse(stream)
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

        const stream = OpenAIStream(streamResponse as any)
        return new StreamingTextResponse(stream)

    } catch (error) {
        console.error('Chat API Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
