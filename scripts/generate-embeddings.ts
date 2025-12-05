import { PrismaClient } from '@prisma/client'
import { vectorStore } from '../src/lib/ai/vector-store'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting embedding generation...')

    // 1. Process Projects
    const projects = await prisma.project.findMany({
        include: { amenities: { include: { amenity: true } } }
    })

    console.log(`Found ${projects.length} projects`)

    for (const project of projects) {
        const amenities = project.amenities.map(a => a.amenity.name).join(', ')
        const content = `Dự án: ${project.name}
        Loại hình: ${project.category}
        Vị trí: ${project.location} (${project.fullLocation || ''})
        Giá: ${project.priceRange}
        Trạng thái: ${project.status}
        Tiện ích: ${amenities}
        Mô tả: ${project.description}`

        await vectorStore.addDocument(content, {
            type: 'PROJECT',
            id: project.id,
            slug: project.slug,
            name: project.name,
            price: project.priceRange
        })
        console.log(`Processed project: ${project.name}`)
    }

    // 2. Process Listings
    const listings = await prisma.listing.findMany({
        where: { isActive: true },
        include: { amenities: { include: { amenity: true } } }
    })

    console.log(`Found ${listings.length} listings`)

    for (const listing of listings) {
        const amenities = listing.amenities.map(a => a.amenity.name).join(', ')
        const content = `Tin đăng: ${listing.title}
        Loại: ${listing.type}
        Giá: ${listing.price} tỷ
        Diện tích: ${listing.area} m2
        Phòng ngủ: ${listing.bedrooms}
        Phòng tắm: ${listing.bathrooms}
        Hướng: ${listing.direction || 'Không xác định'}
        Vị trí: ${listing.location} (${listing.fullLocation || ''})
        Tiện ích: ${amenities}
        Mô tả: ${listing.description}`

        await vectorStore.addDocument(content, {
            type: 'LISTING',
            id: listing.id,
            slug: listing.slug,
            title: listing.title,
            price: listing.price,
            area: listing.area
        })
        console.log(`Processed listing: ${listing.title}`)
    }

    console.log('✅ Embedding generation complete!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
