import { OpenAI } from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

// Simple text-based embedding fallback using character codes
function simpleEmbedding(text: string): number[] {
    const normalized = text.toLowerCase().slice(0, 512)
    const embedding = new Array(384).fill(0)

    for (let i = 0; i < normalized.length; i++) {
        const charCode = normalized.charCodeAt(i)
        const idx = i % 384
        embedding[idx] = (embedding[idx] + charCode / 127) / 2
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'google/gemini-embedding-001',
            input: text,
        })

        if (response.data && response.data[0] && response.data[0].embedding) {
            return response.data[0].embedding
        }

        // Fallback to simple embedding if API returns unexpected format
        console.warn('Embedding API returned unexpected format, using fallback')
        return simpleEmbedding(text)
    } catch (error) {
        console.error('Error generating embedding, using fallback:', error)
        // Fallback to simple embedding on error
        return simpleEmbedding(text)
    }
}
