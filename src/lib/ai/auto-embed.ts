import { vectorStore } from './vector-store'

/**
 * Embed a project document for chatbot search
 */
export async function embedProject(project: {
    id: number
    name: string
    slug: string
    category: string
    location: string
    fullLocation?: string | null
    priceRange: string
    status: string
    description: string
    thumbnailUrl: string
    amenities?: string[]
}) {
    const amenityText = project.amenities?.join(', ') || ''

    const content = `Dự án: ${project.name}
Loại hình: ${project.category}
Vị trí: ${project.location} (${project.fullLocation || ''})
Giá: ${project.priceRange}
Trạng thái: ${project.status}
Tiện ích: ${amenityText}
Mô tả: ${project.description}`

    try {
        await vectorStore.addDocument(content, {
            type: 'PROJECT',
            id: project.id,
            slug: project.slug,
            name: project.name,
            priceRange: project.priceRange,
            location: project.location,
            fullLocation: project.fullLocation,
            thumbnailUrl: project.thumbnailUrl
        })
        console.log(`[Embedding] Project embedded: ${project.name}`)
        return true
    } catch (error) {
        console.error(`[Embedding] Failed to embed project ${project.name}:`, error)
        return false
    }
}

/**
 * Embed a listing document for chatbot search
 */
export async function embedListing(listing: {
    id: number
    title: string
    slug: string
    type: string
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    direction?: string | null
    location: string
    fullLocation?: string | null
    description: string
    thumbnailUrl: string
    amenities?: string[]
}) {
    const amenityText = listing.amenities?.join(', ') || ''

    const content = `Tin đăng: ${listing.title}
Loại: ${listing.type}
Giá: ${listing.price} VNĐ
Diện tích: ${listing.area} m2
Phòng ngủ: ${listing.bedrooms}
Phòng tắm: ${listing.bathrooms}
Hướng: ${listing.direction || 'Không xác định'}
Vị trí: ${listing.location} (${listing.fullLocation || ''})
Tiện ích: ${amenityText}
Mô tả: ${listing.description}`

    try {
        await vectorStore.addDocument(content, {
            type: 'LISTING',
            id: listing.id,
            slug: listing.slug,
            title: listing.title,
            price: listing.price,
            area: listing.area,
            location: listing.location,
            fullLocation: listing.fullLocation,
            thumbnailUrl: listing.thumbnailUrl
        })
        console.log(`[Embedding] Listing embedded: ${listing.title}`)
        return true
    } catch (error) {
        console.error(`[Embedding] Failed to embed listing ${listing.title}:`, error)
        return false
    }
}
