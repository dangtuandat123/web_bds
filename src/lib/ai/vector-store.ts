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

// In-memory storage
let memoryStore: Map<string, { content: string; metadata: string; embedding: string }> = new Map()
let lastLoadTime = 0

// Load data from file - checks if file changed
function loadFromFile() {
    try {
        const jsonFile = DB_FILE + '.json'  // embeddings.db.json

        if (!fs.existsSync(jsonFile)) {
            console.error(`[VectorStore] JSON file NOT found: ${jsonFile}`)
            return
        }

        // Check file modification time
        const stat = fs.statSync(jsonFile)
        const mtime = stat.mtimeMs

        // Only reload if file changed or never loaded
        if (mtime <= lastLoadTime && memoryStore.size > 0) {
            return  // No change, use cached data
        }

        console.error(`[VectorStore] Loading/reloading: ${jsonFile}`)
        const rawData = fs.readFileSync(jsonFile, 'utf-8')
        const data = JSON.parse(rawData)
        const entries = Object.entries(data)
        console.error(`[VectorStore] File contains ${entries.length} entries`)

        memoryStore.clear()
        for (const [id, doc] of entries) {
            memoryStore.set(id, doc as any)
        }
        lastLoadTime = mtime
        console.error(`[VectorStore] Loaded ${memoryStore.size} documents into store`)
    } catch (error) {
        console.error('[VectorStore] Could not load existing data:', error)
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
        console.error(`[VectorStore] Saved ${Object.keys(dataToSave).length} documents`)
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

            console.error(`[VectorStore] Search query: "${query}", Store size: ${memoryStore.size}`)

            if (memoryStore.size === 0) {
                console.warn('[VectorStore] Store is EMPTY! Need to run re-embed.')
                return []
            }

            const queryEmbedding = await generateEmbedding(query)
            const queryDim = queryEmbedding.length
            console.error(`[VectorStore] Query embedding dimension: ${queryDim}`)

            const results: Document[] = []
            let skippedDimMismatch = 0

            for (const [id, doc] of memoryStore.entries()) {
                try {
                    const embedding = JSON.parse(doc.embedding)

                    // Check dimension match
                    if (embedding.length !== queryDim) {
                        skippedDimMismatch++
                        continue // Skip mismatched dimensions
                    }

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

            if (skippedDimMismatch > 0) {
                console.warn(`[VectorStore] Skipped ${skippedDimMismatch} docs due to dimension mismatch (need ${queryDim})`)
            }

            console.error(`[VectorStore] Found ${results.length} matching documents`)

            results.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))

            if (results.length > 0) {
                console.error(`[VectorStore] Top result: similarity=${results[0].similarity?.toFixed(4)}, title=${results[0].metadata?.name || results[0].metadata?.title}`)
            }

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
            console.error(`[VectorStore] Deleted ${idsToDelete.length} documents for ${type} id=${id}`)
            return true
        } catch (error) {
            console.error('Failed to delete documents by metadata:', error)
            return false
        }
    }

    // Clear all embeddings - useful for re-embed
    clearAll() {
        memoryStore.clear()
        lastLoadTime = 0
        saveToFile()
        console.error('[VectorStore] All embeddings cleared')
    }
}

export const vectorStore = new VectorStore()
