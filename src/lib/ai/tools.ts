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
        const keyword = query ? query.trim() : ''

        // Heuristic: derive maxPrice from free text if none provided (e.g., "3 ty" -> 3e9 VND)
        let derivedMaxPrice: number | undefined
        if (!maxPrice) {
            const numberMatch = keyword.match(/(\d+(?:[.,]\d+)?)/)
            if (numberMatch) {
                const raw = parseFloat(numberMatch[1].replace(',', '.'))
                derivedMaxPrice = raw * 1_000_000_000
            }
        }

        // Build dynamic filter for Listings
        const listingWhere: any = {
            isActive: true,
        }

        if (keyword) {
            listingWhere.OR = [
                { title: { contains: keyword } },
                { location: { contains: keyword } },
                { description: { contains: keyword } },
                { fullLocation: { contains: keyword } },
            ]
        }

        if (district) {
            listingWhere.AND = [
                {
                    OR: [
                        { location: { contains: district } },
                        { fullLocation: { contains: district } },
                    ],
                },
            ]
        }

        const appliedMinPrice = minPrice
        const appliedMaxPrice = maxPrice ?? derivedMaxPrice

        if (appliedMinPrice !== undefined) listingWhere.price = { ...listingWhere.price, gte: appliedMinPrice }
        if (appliedMaxPrice !== undefined) listingWhere.price = { ...listingWhere.price, lte: appliedMaxPrice }
        if (minArea !== undefined) listingWhere.area = { ...listingWhere.area, gte: minArea }
        if (direction) listingWhere.direction = { contains: direction }

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
                thumbnailUrl: true,
                location: true,
                type: true,
            },
        })

        // Search Projects
        let projects: any[] = []
        if (!type || type === 'APARTMENT' || type === 'LAND' || type === 'VILLA') {
            const projectWhere: any = {
                status: { not: 'SOLD_OUT' },
            }

            if (keyword) {
                projectWhere.OR = [
                    { name: { contains: keyword } },
                    { location: { contains: keyword } },
                    { description: { contains: keyword } },
                ]
            }

            if (district) {
                projectWhere.AND = [
                    {
                        OR: [
                            { location: { contains: district } },
                            { fullLocation: { contains: district } },
                        ],
                    },
                ]
            }

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
                    thumbnailUrl: true,
                    category: true,
                },
            })
        }

        // Format results
        const formattedListings = listings.map((l) => {
            const priceBn =
                l.price >= 1_000_000_000 ? (l.price / 1_000_000_000).toFixed(1).replace(/\.0$/, '') : l.price.toString()
            return {
                title: l.title,
                price: `${priceBn} ty`,
                area: `${l.area} m2`,
                location: l.location,
                url: `/nha-dat/${l.slug}`,
                type: 'Ban le',
                thumbnailUrl: l.thumbnailUrl,
            }
        })

        const formattedProjects = projects.map((p) => ({
            title: p.name,
            price: p.priceRange,
            area: 'Du an',
            location: p.location,
            url: `/du-an/${p.slug}`,
            type: 'Du an',
            thumbnailUrl: p.thumbnailUrl,
        }))

        const results = [...formattedListings, ...formattedProjects]

        if (results.length === 0) {
            return 'Khong tim thay bat dong san phu hop. Hay thu tu khoa khac hoac giam bot dieu kien loc.'
        }

        return JSON.stringify(results)
    } catch (error) {
        console.error('Search Error:', error)
        return 'Da co loi xay ra khi tim kiem.'
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
