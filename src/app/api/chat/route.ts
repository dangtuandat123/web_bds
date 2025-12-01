import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Configure OpenRouter client (OpenAI-compatible)
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

// System prompt for Happy Land AI assistant
const systemPrompt = `Bạn là trợ lý ảo thông minh của Happy Land - nền tảng bất động sản hàng đầu Việt Nam.

NHIỆM VỤ:
- Tư vấn về các dự án bất động sản (căn hộ, nhà phố, đất nền)
- Giải đáp thắc mắc về giá cả, vị trí, pháp lý
- Hỗ trợ tìm kiếm bất động sản phù hợp
- Tư vấn phong thủy cơ bản
- Hướng dẫn quy trình mua bán

PHONG CÁCH:
- Thân thiện, lịch sự, chuyên nghiệp
- Trả lời ngắn gọn, súc tích (2-3 câu)
- Sử dụng emoji phù hợp 🏠💰✨
- Luôn hỏi thông tin cụ thể để tư vấn tốt hơn

LƯU Ý:
- Nếu không chắc chắn, hãy nói "Để tôi kiểm tra thông tin chính xác cho bạn"
- Khuyến khích khách hàng để lại số điện thoại để nhận tư vấn chi tiết
- Không đưa ra cam kết pháp lý cụ thể, chỉ thông tin tham khảo`

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // Validate API key
        if (!process.env.OPENROUTER_API_KEY) {
            return new Response('OpenRouter API key not configured', { status: 500 })
        }

        // Stream chat completion
        const result = streamText({
            model: openrouter('google/gemini-2.5-flash'),
            system: systemPrompt,
            messages,
            temperature: 0.7,
            maxTokens: 1000,
        })

        return result.toDataStreamResponse()
    } catch (error) {
        console.error('Chat API Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
