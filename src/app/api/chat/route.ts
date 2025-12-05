import { streamText, tool, stepCountIs } from 'ai'
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

// System prompt generator - concise sales persona with tool-first discipline
const getSystemPrompt = (host: string, date: string) => `
BAN LA: Chuyen gia BDS Happy Land (${host}), thoi gian: ${date}.
NGUYEN TAC:
- Luon dung \`searchVectorDB\` truoc khi tra loi ve BDS. Neu khong co ket qua, noi ro va de xuat phuong an gan nhat.
- Khong bia dat. Chi su dung du lieu tu cong cu. Neu chua ro, hoi lai de lam ro nhu cau.
- Giai thich ngan gon, uu tien 3 goi y phu hop (ten + gia/area + link).
- Luon moi khach de lai ten + SDT/Zalo. Neu khach da cung cap ten/SDT -> goi \`createLead\` de luu.
- Giong noi ban hang chu dong, nhac lai khu vuc, ngan sach, loai hinh de xac nhan.
`

export async function POST(req: Request) {
    try {
        const bodySchema = z.object({
            messages: z.any(),
            sessionId: z.string().optional(),
        })

        const { messages, sessionId: clientSessionId } = bodySchema.parse(await req.json())

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
                    description: 'Tim kiem bat dong san trong co so du lieu vector. Dung khi khach hoi ve mua ban/cho thue.',
                    parameters: z.object({
                        query: z.string().describe('Mo ta nhu cau tim kiem, vi du: "chung cu quan 9 gia 3 ty"'),
                        limit: z.number().optional().describe('So ket qua toi da (mac dinh 5)'),
                    }),
                    execute: async ({ query, limit }) => {
                        return await searchVectorDB(query, limit)
                    },
                }),
                createLead: tool({
                    description: 'Luu thong tin khach hang tiem nang sau khi da co ten + so dien thoai.',
                    parameters: z.object({
                        name: z.string().describe('Ten khach hang'),
                        phone: z.string().describe('So dien thoai khach hang'),
                        message: z.string().optional().describe('Nhu cau cu the'),
                    }),
                    execute: async ({ name, phone, message }) => {
                        return await createLead(name, phone, message)
                    },
                }),
            },
            onFinish: async ({ response }) => {
                // Save chat session to database
                try {
                    const responseMessages = response.messages
                    const lastMessage = responseMessages[responseMessages.length - 1]
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
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return new Response(message, { status: 500 })
    }
}

