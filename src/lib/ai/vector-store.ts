import { v4 as uuidv4 } from 'uuid'
import * as math from 'mathjs'
import { generateEmbedding } from './embedding'
import * as fs from 'fs'
import * as path from 'path'

const DB_FILE = path.join(process.cwd(), 'embeddings.db')

export interface Document {
    id: string
    content: string
    metadata: Record<string, any>
    embedding: number[]
    similarity?: number
}

// In-memory storage as fallback when sql.js fails
let memoryStore: Map<string, { content: string; metadata: string; embedding: string }> = new Map()
let dbLoaded = false

// Try to load existing data from file
function loadFromFile() {
    if (dbLoaded) return
    dbLoaded = true

    try {
        if (fs.existsSync(DB_FILE)) {
            // Try to read as JSON backup
            const jsonFile = DB_FILE + '.json'
            if (fs.existsSync(jsonFile)) {
                const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))
                for (const [id, doc] of Object.entries(data)) {
                    memoryStore.set(id, doc as any)
                }
                console.log(`[VectorStore] Loaded ${memoryStore.size} documents from JSON backup`)
            }
        }
    } catch (error) {
        console.warn('[VectorStore] Could not load existing data:', error)
    }
}

// Save to JSON file - OVERWRITE with current memoryStore
function saveToFile() {
    try {
        const jsonFile = DB_FILE + '.json'

        // Convert memoryStore to object and save directly
        const dataToSave: Record<string, any> = {}
        for (const [id, doc] of memoryStore.entries()) {
            dataToSave[id] = doc
        }

        fs.writeFileSync(jsonFile, JSON.stringify(dataToSave, null, 2))
        console.log(`[VectorStore] Saved ${Object.keys(dataToSave).length} documents`)
    } catch (error) {
        console.error('[VectorStore] Failed to save:', error)
    }
}

export class VectorStore {
    constructor() {
        loadFromFile()
    }

    async addDocument(content: string, metadata: Record<string, any> = {}) {
        try {
            // UPSERT: Delete existing document with same type+id to prevent duplicates
            if (metadata.type && metadata.id) {
                await this.deleteByMetadata(metadata.type, metadata.id)
            }

            const embedding = await generateEmbedding(content)
            const id = uuidv4()

            memoryStore.set(id, {
                content,
                metadata: JSON.stringify(metadata),
                embedding: JSON.stringify(embedding)
            })

            saveToFile()
            return id
        } catch (error) {
            console.error('Failed to add document:', error)
            throw error
        }
    }

    async similaritySearch(query: string, limit: number = 5): Promise<Document[]> {
        try {
            loadFromFile()

            const queryEmbedding = await generateEmbedding(query)

            const results: Document[] = []

            for (const [id, doc] of memoryStore.entries()) {
                try {
                    const embedding = JSON.parse(doc.embedding)
                    const similarity = this.cosineSimilarity(queryEmbedding, embedding)
                    results.push({
                        id,
                        content: doc.content,
                        metadata: JSON.parse(doc.metadata),
                        embedding,
                        similarity
                    })
                } catch (parseError) {
                    console.warn(`Failed to parse document ${id}:`, parseError)
                }
            }

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

    async deleteByMetadata(type: string, id: number): Promise<boolean> {
        try {
            loadFromFile()

            const idsToDelete: string[] = []

            for (const [docId, doc] of memoryStore.entries()) {
                try {
                    const metadata = JSON.parse(doc.metadata)
                    if (metadata.type === type && metadata.id === id) {
                        idsToDelete.push(docId)
                    }
                } catch (e) {
                    // Skip invalid
                }
            }

            for (const docId of idsToDelete) {
                memoryStore.delete(docId)
            }

            saveToFile()
            console.log(`[Embedding] Deleted ${idsToDelete.length} documents for ${type} id=${id}`)
            return true
        } catch (error) {
            console.error('Failed to delete documents by metadata:', error)
            return false
        }
    }
}

export const vectorStore = new VectorStore()
