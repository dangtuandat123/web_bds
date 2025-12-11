import { OpenAI } from 'openai'
import { getSetting } from '@/app/actions/settings'

// Create OpenAI client with dynamic API key
async function getOpenAIClient(): Promise<OpenAI> {
    const apiKey = await getSetting('api_openrouter') || process.env.OPENROUTER_API_KEY || ''
    return new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
    })
}

// Simple text-based embedding fallback using character codes
// MUST match OpenRouter embedding dimensions (3072)
function simpleEmbedding(text: string): number[] {
    const EMBEDDING_DIM = 3072 // Match google/gemini-embedding-001 dimensions
    const normalized = text.toLowerCase().slice(0, 1024)
    const embedding = new Array(EMBEDDING_DIM).fill(0)

    for (let i = 0; i < normalized.length; i++) {
        const charCode = normalized.charCodeAt(i)
        const idx = i % EMBEDDING_DIM
        embedding[idx] = (embedding[idx] + charCode / 127) / 2
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const openai = await getOpenAIClient();
        const response = await openai.embeddings.create({
            model: 'google/gemini-embedding-001', // 3072 dimensions via OpenRouter
            input: text,
        });

        if (response.data && response.data[0] && response.data[0].embedding) {
            return response.data[0].embedding;
        }

        // Fallback to simple embedding if API returns unexpected format
        console.warn('Embedding API returned unexpected format, using fallback');
        return simpleEmbedding(text);
    } catch (error) {
        console.error('Error generating embedding, using fallback:', error);
        // Fallback to simple embedding on error
        return simpleEmbedding(text);
    }
}
