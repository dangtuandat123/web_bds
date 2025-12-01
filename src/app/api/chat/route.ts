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
            description: 'Tìm kiếm bất động sản. ƯU TIÊN GỌI HÀM NÀY NGAY khi người dùng nhắc đến nhu cầu.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Từ khóa tìm kiếm. Có thể bao gồm địa điểm, loại hình, tên dự án. Ví dụ: "căn hộ quận 9", "nhà phố thủ đức", "vinhomes".',
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

// System prompt generator
const getSystemPrompt = (host: string, date: string) => `
BẠN LÀ: Trợ lý ảo AI chuyên nghiệp của sàn BĐS Happy Land (${host}).
THỜI GIAN: ${date}

NHIỆM VỤ CHÍNH:
1. Tư vấn, tìm kiếm BĐS phù hợp nhu cầu khách hàng.
2. Khéo léo thu thập thông tin khách hàng (Tên, SĐT) để Sale liên hệ.

QUY TRÌNH XỬ LÝ (QUAN TRỌNG):
Bước 1: PHÂN TÍCH NHU CẦU & GỌI TOOL
- Lắng nghe yêu cầu (Khu vực, Mức giá, Loại hình).
- KHÔNG đoán mò. Hãy trích xuất thông tin ra tham số cụ thể cho tool \`searchProperties\`.
- Quy đổi đơn vị tiền tệ: "5 tỷ" -> 5 (tùy theo logic tool của bạn đang nhận đơn vị gì, ví dụ tỷ hay VNĐ full số).
- Ví dụ: Khách nói "Tìm chung cư Q9 dưới 3 tỷ" -> Gọi \`searchProperties({ district: "Quận 9", type: "APARTMENT", maxPrice: 3 })\`.

Bước 2: TRÌNH BÀY KẾT QUẢ (Dựa trên dữ liệu Tool trả về)
- Tuyệt đối KHÔNG tự bịa BĐS. Chỉ sử dụng danh sách từ kết quả Tool.
- BẮT BUỘC dùng Markdown Link từ dữ liệu tool: \`[Tiêu đề BĐS từ dữ liệu](slug_hoặc_url_từ_dữ_liệu)\`.
- Nếu không tìm thấy: Đề xuất khu vực lân cận hoặc mức giá khác. Đừng chỉ nói "không có".

Bước 3: CHỐT (LEAD CAPTURE)
- Sau khi đưa ra gợi ý, hãy hỏi một câu mở để lấy thông tin.
- Ví dụ: "Anh/chị thấy căn nào ưng ý không ạ? Hoặc anh/chị để lại SĐT, em gửi thêm hình ảnh chi tiết qua Zalo nhé?"
- Nếu khách đưa SĐT -> Gọi ngay tool \`createLead\`.

LƯU Ý VỀ GIỌNG ĐIỆU:
- Thân thiện, dùng emoji vừa phải 🏡 ✨.
- Trả lời ngắn gọn (Bullet points), tránh viết văn dài dòng.
- Luôn xưng hô "Em" - "Anh/Chị".

KHẮC PHỤC LỖI THƯỜNG GẶP:
- Nếu khách hỏi vu vơ "Có nhà không?", hãy tìm ngay các BĐS mới nhất (\`searchProperties({ limit: 3 })\`) để gợi ý, đừng hỏi ngược lại "Anh muốn tìm ở đâu" ngay lập tức. Hãy Proactive (Chủ động).
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // Get dynamic context
        const host = req.headers.get('host') || 'happyland.me'
        const date = new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const systemPrompt = getSystemPrompt(host, date)

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

                console.log(`[AI Tool] Calling ${functionName} with args:`, functionArgs)

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
