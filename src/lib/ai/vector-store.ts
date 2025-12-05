import path from 'path'
import fs from 'fs'
import { open, Database } from 'sqlite'
import sqlite3 from 'sqlite3'
import OpenAI from 'openai'

type VectorRow = {
    id: string
    content: string
    metadata: string
    embedding: string
}

const dbPath = path.join(process.cwd(), 'vector_store.sqlite')
let dbPromise: Promise<Database> | null = null
let seeded = false

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
})

async function getDb() {
    if (!dbPromise) {
        // Ensure directory exists
        if (!fs.existsSync(path.dirname(dbPath))) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true })
        }
        dbPromise = open({
            filename: dbPath,
            driver: sqlite3.Database,
        })
        const db = await dbPromise
        await db.exec(`
            CREATE TABLE IF NOT EXISTS vectors (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                metadata TEXT,
                embedding TEXT NOT NULL
            );
        `)
    }
    return dbPromise
}

function cosineSimilarity(a: number[], b: number[]) {
    if (a.length !== b.length) return 0
    let dot = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10)
}

export async function embedText(text: string) {
    if (!openai.apiKey) return []
    const res = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    })
    return res.data[0].embedding as number[]
}

export async function upsertVectors(
    items: {
        id: string
        content: string
        metadata?: Record<string, unknown>
        embedding?: number[]
    }[]
) {
    const db = await getDb()
    for (const item of items) {
        const embedding = item.embedding || (await embedText(item.content))
        if (!embedding.length) continue
        await db.run(
            'INSERT OR REPLACE INTO vectors (id, content, metadata, embedding) VALUES (?, ?, ?, ?)',
            item.id,
            item.content,
            JSON.stringify(item.metadata || {}),
            JSON.stringify(embedding)
        )
    }
}

export async function similaritySearch(query: string, k = 3) {
    const db = await getDb()
    const queryEmbedding = await embedText(query)
    if (!queryEmbedding.length) return []

    const rows = await db.all<VectorRow[]>('SELECT id, content, metadata, embedding FROM vectors')
    const scored = rows
        .map((row) => {
            const emb = JSON.parse(row.embedding) as number[]
            const score = cosineSimilarity(queryEmbedding, emb)
            return {
                id: row.id,
                content: row.content,
                metadata: JSON.parse(row.metadata || '{}') as Record<string, unknown>,
                score,
            }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, k)

    return scored
}

export async function ensureSeedVectors(seedFn: () => Promise<void>) {
    if (seeded) return
    const db = await getDb()
    const row = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM vectors')
    if (row?.count && row.count > 0) {
        seeded = true
        return
    }
    await seedFn()
    seeded = true
}
