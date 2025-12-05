import prisma from '@/lib/prisma'

import { vectorStore } from './vector-store'

export async function searchVectorDB(query: string, limit: number = 5) {
    try {
        const results = await vectorStore.similaritySearch(query, limit)

        if (results.length === 0) {
            return 'Không tìm thấy bất động sản phù hợp trong cơ sở dữ liệu.'
        }

        return JSON.stringify(results.map(r => ({
            id: r.id,
            content: r.content,
            metadata: r.metadata,
            similarity: r.similarity
        })))
    } catch (error) {
        console.error('Vector Search Error:', error)
        return 'Đã có lỗi xảy ra khi tìm kiếm trong vector database.'
    }
}

export async function createLead(name: string, phone: string, message?: string) {
    try {
        await prisma.lead.create({
            data: {
                name,
                phone,
                message: message || 'Khach hang tu Chatbot',
                source: 'CHATBOT',
            },
        })
        return JSON.stringify({ success: true, message: 'Da luu thong tin lien he thanh cong.' })
    } catch (error) {
        console.error('Create Lead Error:', error)
        return JSON.stringify({ success: false, error: 'Khong the luu thong tin.' })
    }
}
