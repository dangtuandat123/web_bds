import prisma from '@/lib/prisma'
import { vectorStore } from './vector-store'

type VectorResult = {
    id: string
    title: string
    price?: string | number
    area?: number
    location?: string
    url?: string
    thumbnailUrl?: string
    type?: string
    similarity?: number
    metadata?: Record<string, any>
}

export async function searchVectorDB(query: string, limit: number = 5) {
    try {
        const results = await vectorStore.similaritySearch(query, limit)

        if (results.length === 0) {
            return 'Không tìm thấy bất động sản phù hợp trong cơ sở dữ liệu.'
        }

        const mapped: VectorResult[] = results.map((r) => {
            const meta = r.metadata || {}
            const type = (meta.type as string | undefined) || ''
            const slug = meta.slug as string | undefined
            const path =
                type === 'PROJECT'
                    ? slug
                        ? `/du-an/${slug}`
                        : undefined
                    : type === 'LISTING'
                        ? slug
                            ? `/nha-dat/${slug}`
                            : undefined
                        : undefined

            return {
                id: r.id,
                title: meta.name || meta.title || meta.slug || 'Bat dong san',
                price: meta.price ?? meta.priceRange ?? '',
                area: meta.area,
                location: meta.fullLocation || meta.location || '',
                url: path,
                thumbnailUrl: meta.thumbnailUrl,
                type,
                similarity: r.similarity,
                metadata: meta,
            }
        })

        return JSON.stringify(mapped)
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
