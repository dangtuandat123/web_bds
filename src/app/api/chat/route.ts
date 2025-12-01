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
            description: 'Tìm kiếm bất động sản (nhà phố, căn hộ, đất nền, dự án) dựa trên từ khóa, địa điểm, nhu cầu.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Từ khóa tìm kiếm (ví dụ: "căn hộ 2 phòng ngủ quận 1", "vinhomes grand park", "đất nền giá rẻ")',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'createLead',
            description: 'Lưu thông tin liên hệ của khách hàng khi họ muốn được tư vấn kỹ hơn.',
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
const systemPrompt = `Bạn là trợ lý ảo thông minh của Happy Land - nền tảng bất động sản hàng đầu Việt Nam.

NHIỆM VỤ:
- Tư vấn về các dự án bất động sản (căn hộ, nhà phố, đất nền).
- Giải đáp thắc mắc về giá cả, vị trí, pháp lý.
- Hỗ trợ tìm kiếm bất động sản phù hợp bằng công cụ searchProperties.
- Lưu thông tin khách hàng bằng công cụ createLead khi khách hàng cung cấp tên và số điện thoại.

QUY TẮC ĐƯỜNG DẪN (QUAN TRỌNG):
- Khi tìm thấy bất động sản, BẮT BUỘC phải cung cấp đường dẫn dưới dạng Markdown Link: [Tiêu đề BĐS](url).
- Ví dụ: "Tôi tìm thấy [Căn hộ 2PN Vinhomes](/nha-dat/can-ho-2pn) phù hợp với bạn."
- KHÔNG được hiển thị URL trần (như https://...).

PHONG CÁCH:
- Thân thiện, lịch sự, chuyên nghiệp.
- Trả lời ngắn gọn, súc tích.
- Sử dụng emoji phù hợp 🏠💰✨.
- Luôn hỏi thông tin cụ thể để tư vấn tốt hơn.`

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

            // Create a new messages array with the assistant's tool call message
            const newMessages = [
                { role: 'system', content: systemPrompt },
                ...messages,
                responseMessage
            ]

            // Execute tools
            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments)
                let functionResult = ''

                if (functionName === 'searchProperties') {
                    functionResult = await searchProperties(functionArgs.query)
                } else if (functionName === 'createLead') {
                    functionResult = await createLead(functionArgs.name, functionArgs.phone, functionArgs.message)
                }

                newMessages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResult,
                })
            }

            // Second call to model with tool results
            const secondResponse = await openai.chat.completions.create({
                model: 'google/gemini-2.5-flash',
                stream: true,
                messages: newMessages as any,
            })

            const stream = OpenAIStream(secondResponse as any)
            return new StreamingTextResponse(stream)
        }

        // If no tool calls, just stream the response (but we need to stream it, the first response was not streamed)
        // So we need to make a streaming call if there were no tool calls.
        // Optimization: We could have started with stream: true, but handling tool calls in stream is harder with raw client.
        // Re-call with stream: true for the text response.

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
