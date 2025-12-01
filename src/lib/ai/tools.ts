import prisma from '@/lib/prisma'

export async function searchProperties(
    query: string,
    minPrice?: number,
    maxPrice?: number,
    minArea?: number,
    direction?: string,
    district?: string,
    type?: string,
    limit?: number
) {
    try {
        // Smart Search: Clean query
        const keyword = query ? query.trim() : ''

        // Build dynamic filter for Listings
        const listingWhere: any = {
            isActive: true,
        }

        // Fuzzy Search Logic: OR condition for keyword in title, location, description
        if (keyword) {
            listingWhere.OR = [
                { title: { contains: keyword } },
                { location: { contains: keyword } },
                { description: { contains: keyword } },
                { fullLocation: { contains: keyword } }
            ]
        }

        // If district is provided, add it as a specific filter or part of search
        if (district) {
            // If we already have an OR from keyword, we need to combine it carefully.
            // Requirement says: "Allow flexible keyword" and "Fuzzy Search".
            // If district is explicit, we should enforce it.
            listingWhere.AND = [
                {
                    OR: [
                        { location: { contains: district } },
                        { fullLocation: { contains: district } }
                    ]
                }
            ]
        }

        if (minPrice !== undefined) listingWhere.price = { ...listingWhere.price, gte: minPrice }
        if (maxPrice !== undefined) listingWhere.price = { ...listingWhere.price, lte: maxPrice }
        if (minArea !== undefined) listingWhere.area = { ...listingWhere.area, gte: minArea }
        if (direction) listingWhere.direction = { contains: direction }

        // Filter by Type (APARTMENT, HOUSE, LAND, RENT)
        if (type) {
            listingWhere.type = type
        }

        // Search Listings
        const takeLimit = limit || 5
        const listings = await prisma.listing.findMany({
            where: listingWhere,
            take: takeLimit,
            select: {
                title: true,
                slug: true,
                price: true,
                area: true,
                location: true,
                type: true,
            },
        })

        // Search Projects
        let projects: any[] = []
        if (!type || type === 'APARTMENT' || type === 'LAND' || type === 'VILLA') {
            const projectWhere: any = {
                status: { not: 'SOLD_OUT' }
            }

            if (keyword) {
                projectWhere.OR = [
                    { name: { contains: keyword } },
                    { location: { contains: keyword } },
                    { description: { contains: keyword } }
                ]
            }

            if (district) {
                projectWhere.AND = [
                    {
                        OR: [
                            { location: { contains: district } },
                            { fullLocation: { contains: district } }
                        ]
                    }
                ]
            }

            // Map ListingType to ProjectCategory
            if (type === 'APARTMENT') projectWhere.category = 'APARTMENT'
            if (type === 'LAND') projectWhere.category = 'LAND'
            if (type === 'VILLA') projectWhere.category = 'VILLA'

            projects = await prisma.project.findMany({
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
        }

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
