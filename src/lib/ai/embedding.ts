import { OpenAI } from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'google/gemini-embedding-001',
            input: text,
        })
        return response.data[0].embedding
    } catch (error) {
        console.error('Error generating embedding:', error)
        throw error
    }
}
