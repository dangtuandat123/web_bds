import prisma from '@/lib/prisma'

export async function searchProperties(query: string) {
    try {
        // Search Listings
        const listings = await prisma.listing.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { location: { contains: query } },
                    { description: { contains: query } },
                ],
                isActive: true,
            },
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

        // Search Projects
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { location: { contains: query } },
                ],
                status: { not: 'SOLD_OUT' },
            },
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
            return "Không tìm thấy bất động sản nào phù hợp với yêu cầu của bạn."
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
