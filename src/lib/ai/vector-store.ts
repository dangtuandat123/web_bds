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
        try {
            this.db = new Database(DB_FILE)
            this.init()
        } catch (error) {
            console.error('Failed to initialize VectorStore:', error)
            throw error
        }
    }

    private init() {
        try {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS document_embeddings (
                    id TEXT PRIMARY KEY,
                    content TEXT,
                    metadata TEXT,
                    embedding TEXT
                )
            `)
        } catch (error) {
            console.error('Failed to create tables:', error)
            throw error
        }
    }

    async addDocument(content: string, metadata: Record<string, any> = {}) {
        try {
            const embedding = await generateEmbedding(content)
            const id = uuidv4()

            const stmt = this.db.prepare(`
                INSERT INTO document_embeddings (id, content, metadata, embedding)
                VALUES (?, ?, ?, ?)
            `)

            stmt.run(id, content, JSON.stringify(metadata), JSON.stringify(embedding))
            return id
        } catch (error) {
            console.error('Failed to add document:', error)
            throw error
        }
    }

    async similaritySearch(query: string, limit: number = 5): Promise<Document[]> {
        try {
            const queryEmbedding = await generateEmbedding(query)

            const stmt = this.db.prepare('SELECT * FROM document_embeddings')
            const rows = stmt.all() as any[]

            const results = rows.map((row): Document | null => {
                try {
                    const embedding = JSON.parse(row.embedding)
                    const similarity = this.cosineSimilarity(queryEmbedding, embedding)
                    return {
                        id: row.id,
                        content: row.content,
                        metadata: JSON.parse(row.metadata),
                        embedding,
                        similarity
                    }
                } catch (parseError) {
                    console.warn(`Failed to parse row ${row.id}:`, parseError)
                    return null
                }
            }).filter((item): item is Document => item !== null)

            results.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
            return results.slice(0, limit)
        } catch (error) {
            console.error('Similarity search failed:', error)
            return []
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        try {
            const dotProduct = Number(math.dot(vecA, vecB))
            const normA = Number(math.norm(vecA))
            const normB = Number(math.norm(vecB))
            if (normA === 0 || normB === 0) return 0
            return dotProduct / (normA * normB)
        } catch (error) {
            console.error('Cosine similarity calculation failed:', error)
            return 0
        }
    }
}

export const vectorStore = new VectorStore()
