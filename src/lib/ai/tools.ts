import prisma from '@/lib/prisma'

export async function searchProperties(
    query: string,
    minPrice?: number,
    maxPrice?: number,
    minArea?: number,
    direction?: string
) {
    try {
        // Smart Search: Split query into keywords and require ALL keywords to match (AND logic)
        // This mimics "semantic" search better than a simple exact phrase match.
        const terms = query.trim().split(/\s+/).filter(t => t.length > 0)

        // Build dynamic filter for Listings
        const listingWhere: any = {
            isActive: true,
        }

        // If there are terms, add AND condition for each term
        if (terms.length > 0) {
            listingWhere.AND = terms.map(term => ({
                OR: [
                    { title: { contains: term } },
                    { location: { contains: term } },
                    { description: { contains: term } },
                    // Also search in fullLocation if available
                    { fullLocation: { contains: term } }
                ]
            }))
        }

        if (minPrice !== undefined) listingWhere.price = { ...listingWhere.price, gte: minPrice }
        if (maxPrice !== undefined) listingWhere.price = { ...listingWhere.price, lte: maxPrice }
        if (minArea !== undefined) listingWhere.area = { ...listingWhere.area, gte: minArea }
        if (direction) listingWhere.direction = { contains: direction }

        // Search Listings
        const listings = await prisma.listing.findMany({
            where: listingWhere,
            take: 5,
            select: {
                title: true,
                slug: true,
                price: true,
                area: true,
                location: true,
                type: true,
            },
        })

        // Search Projects (Simple text search for now)
        // For projects, we also try to match all terms if possible, or just fallback to simple OR if complex
        // To keep it simple for now, we'll use OR for projects but try to match name or location
        const projectWhere: any = {
            status: { not: 'SOLD_OUT' }
        }

        if (terms.length > 0) {
            projectWhere.AND = terms.map(term => ({
                OR: [
                    { name: { contains: term } },
                    { location: { contains: term } },
                ]
            }))
        }

        const projects = await prisma.project.findMany({
            where: projectWhere,
            take: 3,
            select: {
                name: true,
                slug: true,
                priceRange: true,
                location: true,
                category: true,
            },
        })

        // Format results
        const formattedListings = listings.map(l => ({
            title: l.title,
            price: `${l.price} tỷ`,
            area: `${l.area}m²`,
            location: l.location,
            url: `/nha-dat/${l.slug}`,
            type: 'Bán lẻ'
        }))

        const formattedProjects = projects.map(p => ({
            title: p.name,
            price: p.priceRange,
            area: 'Dự án',
            location: p.location,
            url: `/du-an/${p.slug}`,
            type: 'Dự án'
        }))

        const results = [...formattedListings, ...formattedProjects]

        if (results.length === 0) {
            return "Không tìm thấy bất động sản nào phù hợp với yêu cầu của bạn. Hãy thử tìm kiếm chung chung hơn."
        }

        return JSON.stringify(results)
    } catch (error) {
        console.error('Search Error:', error)
        return "Đã có lỗi xảy ra khi tìm kiếm."
    }
}

export async function createLead(name: string, phone: string, message?: string) {
    try {
        const lead = await prisma.lead.create({
            data: {
                name,
                phone,
                message: message || 'Khách hàng từ Chatbot',
                source: 'CHATBOT',
            },
        })
        return JSON.stringify({ success: true, message: "Đã lưu thông tin liên hệ thành công." })
    } catch (error) {
        console.error('Create Lead Error:', error)
        return JSON.stringify({ success: false, error: "Không thể lưu thông tin." })
    }
}
