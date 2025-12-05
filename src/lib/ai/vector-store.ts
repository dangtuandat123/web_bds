import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import * as math from 'mathjs'
import { generateEmbedding } from './embedding'

const DB_FILE = 'embeddings.db'

export interface Document {
    id: string
    content: string
    metadata: Record<string, any>
    embedding: number[]
    similarity?: number
}

export class VectorStore {
    private db: Database.Database

    constructor() {
        this.db = new Database(DB_FILE)
        this.init()
    }

    private init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS document_embeddings (
                id TEXT PRIMARY KEY,
                content TEXT,
                metadata TEXT,
                embedding TEXT
            )
        `)
    }

    async addDocument(content: string, metadata: Record<string, any> = {}) {
        const embedding = await generateEmbedding(content)
        const id = uuidv4()

        const stmt = this.db.prepare(`
            INSERT INTO document_embeddings (id, content, metadata, embedding)
            VALUES (?, ?, ?, ?)
        `)

        stmt.run(id, content, JSON.stringify(metadata), JSON.stringify(embedding))
        return id
    }

    async similaritySearch(query: string, limit: number = 5): Promise<Document[]> {
        const queryEmbedding = await generateEmbedding(query)

        const stmt = this.db.prepare('SELECT * FROM document_embeddings')
        const rows = stmt.all() as any[]

        const results = rows.map(row => {
            const embedding = JSON.parse(row.embedding)
            const similarity = this.cosineSimilarity(queryEmbedding, embedding)
            return {
                id: row.id,
                content: row.content,
                metadata: JSON.parse(row.metadata),
                embedding,
                similarity
            }
        })

        results.sort((a, b) => b.similarity - a.similarity)
        return results.slice(0, limit)
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = Number(math.dot(vecA, vecB))
        const normA = Number(math.norm(vecA))
        const normB = Number(math.norm(vecB))
        if (normA === 0 || normB === 0) return 0
        return dotProduct / (normA * normB)
    }
}

export const vectorStore = new VectorStore()
