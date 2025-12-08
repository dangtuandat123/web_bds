import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Reusable thumbnails
const thumbnails = {
    apartments: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
    ],
    villas: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000',
    ],
    land: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1440581572325-0bea30075d9d?auto=format&fit=crop&q=80&w=1000',
    ],
    news: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1600596542815-2a4d9f10927c?auto=format&fit=crop&q=80&w=1000',
    ]
}

const locations = ['TP. Thủ Đức', 'Quận 9', 'Quận 2', 'An Phú', 'Thảo Điền', 'Long Phước', 'Cát Lái', 'Phú Hữu']
const directions = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc']

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

async function main() {
    console.log('🌱 Starting BULK seeding...')

    // Get existing amenities
    const amenities = await prisma.amenity.findMany()
    const amenityIds = amenities.map(a => a.id)

    // ============ SEED PROJECTS (40) ============
    console.log('🏗️ Creating 40 projects...')
    const projectNames = [
        'Căn hộ Sunrise City', 'Vinhomes Central Park', 'Masteri Thảo Điền', 'The Manor', 'Estella Heights',
        'Gateway Thảo Điền', 'Feliz En Vista', 'D\'Edge Thảo Điền', 'Palm Heights', 'The Ascent',
        'Saigon Pearl', 'The Nassim', 'The Vista An Phú', 'Empire City', 'Metropole Thủ Thiêm',
        'River Panorama', 'Sky Garden', 'Palm City', 'Diamond Island', 'Waterina Suites',
        'Q2 Thảo Điền', 'Millenium Masteri', 'Opal Boulevard', 'Centum Wealth', 'Jamila Khang Điền',
        'Safira Khang Điền', 'Lovera Vista', 'Sapphire Khang Điền', 'Merita Khang Điền', 'Flora Kikyo',
        'Hausneo', 'De La Sol', 'Park Vista', 'Green Valley', 'Urban Hill',
        'The Sun Avenue', 'La Astoria', 'One Verandah', 'Thủ Thiêm Zeit', 'Grand Marina'
    ]

    for (let i = 0; i < 40; i++) {
        const name = projectNames[i] || `Dự án ${i + 1}`
        const categoryArr = ['VILLA', 'LAND', 'APARTMENT'] as const
        const statusArr = ['UPCOMING', 'SOLD_OUT', 'SELLING'] as const
        const category = categoryArr[i % 3]
        const status = statusArr[i % 3]
        const thumb = category === 'VILLA' ? randomItem(thumbnails.villas) : randomItem(thumbnails.apartments)

        await prisma.project.create({
            data: {
                name,
                slug: generateSlug(name) + '-' + i,
                category,
                location: randomItem(locations),
                fullLocation: `Đường ${randomNumber(1, 50)}, ${randomItem(locations)}, TP.HCM`,
                description: `${name} - Dự án cao cấp với nhiều tiện ích hiện đại.`,
                content: `${name} là dự án được phát triển bởi chủ đầu tư uy tín, mang đến không gian sống đẳng cấp.`,
                priceRange: `${randomNumber(20, 80)} triệu/m²`,
                status,
                thumbnailUrl: thumb,
                images: JSON.stringify([thumb]),
                updatedAt: new Date(),
            }
        })
    }
    console.log('✅ Created 40 projects')

    // Get project IDs for listings
    const projects = await prisma.project.findMany({ select: { id: true } })
    const projectIds = projects.map(p => p.id)

    // ============ SEED LISTINGS (40) ============
    console.log('🏠 Creating 40 listings...')
    const listingTitles = [
        'Bán căn hộ 2PN view sông thoáng mát',
        'Căn hộ 3PN nội thất cao cấp giá tốt',
        'Căn góc 2PN+1 ban công rộng view công viên',
        'Penthouse thông tầng full nội thất',
        'Căn 1PN giá rẻ phù hợp đầu tư cho thuê',
        'Căn hộ studio full nội thất dọn vào ở ngay',
        'Bán gấp căn 2PN giá dưới thị trường',
        'Căn hộ cao cấp view landmark 81',
        'Căn 3PN diện tích lớn phù hợp gia đình',
        'Duplex thông tầng thiết kế độc đáo',
    ]

    const listingTypes = ['RENT', 'LAND', 'HOUSE', 'APARTMENT', 'APARTMENT'] as const

    for (let i = 0; i < 40; i++) {
        const titleBase = listingTitles[i % listingTitles.length]
        const title = `${titleBase} - ${randomItem(locations)}`
        const bedrooms = randomNumber(1, 4)
        const area = randomNumber(30, 150)
        const price = parseFloat((randomNumber(15, 120) / 10).toFixed(1))
        const type = listingTypes[i % 5]
        const thumb = type === 'LAND' ? randomItem(thumbnails.land) : randomItem(thumbnails.apartments)

        await prisma.listing.create({
            data: {
                title,
                slug: generateSlug(title) + '-' + i,
                description: `${title}. Giá chỉ ${price} tỷ. Diện tích ${area}m².`,
                content: `Thông tin chi tiết về ${title}. Căn hộ có ${bedrooms} phòng ngủ, diện tích ${area}m².`,
                price: type === 'RENT' ? price / 100 : price,
                area,
                bedrooms: type === 'LAND' ? 0 : bedrooms,
                bathrooms: type === 'LAND' ? 0 : randomNumber(1, 3),
                direction: randomItem(directions),
                location: randomItem(locations),
                fullLocation: `Dự án ${randomItem(locations)}`,
                type,
                thumbnailUrl: thumb,
                images: JSON.stringify([thumb]),
                tags: JSON.stringify(i % 2 === 0 ? ['Hot', 'Giá tốt'] : ['Mới', 'View đẹp']),
                isFeatured: i < 10,
                projectId: projectIds.length > 0 ? randomItem(projectIds) : null,
                updatedAt: new Date(),
            }
        })
    }
    console.log('✅ Created 40 listings')

    // ============ SEED NEWS (40) ============
    console.log('📰 Creating 40 news articles...')
    const newsTitles = [
        'Thị trường bất động sản TP.HCM tăng trưởng mạnh trong quý IV',
        'Xu hướng căn hộ xanh lên ngôi trong năm 2024',
        'Giá đất nền khu Đông tiếp tục leo thang',
        'Dự án Metro số 1 tác động tích cực đến BĐS Thủ Đức',
        'Top 5 dự án căn hộ đáng mua nhất TP.HCM',
        'Lãi suất cho vay mua nhà giảm về mức thấp kỷ lục',
        'Phân khúc cao cấp dẫn dắt thị trường BĐS',
        'Các chính sách hỗ trợ người mua nhà lần đầu',
        'Biệt thự ven sông - Xu hướng sống mới của giới thượng lưu',
        'Cập nhật tình hình giá BĐS các quận vùng ven',
        'Phong thủy khi chọn hướng nhà năm 2024',
        'Những điều cần biết về thuế khi mua bán BĐS',
        'Hướng dẫn thủ tục sang tên sổ hồng chi tiết',
        'Kinh nghiệm đàm phán giá với chủ nhà',
        'Dấu hiệu nhận biết dự án uy tín',
    ]

    const categories = ['MARKET', 'FENG_SHUI', 'LEGAL'] as const

    for (let i = 0; i < 40; i++) {
        const titleBase = newsTitles[i % newsTitles.length]
        const title = i < 15 ? titleBase : `${titleBase} - Phần ${Math.floor(i / 15) + 1}`

        await prisma.news.create({
            data: {
                title,
                slug: generateSlug(title) + '-' + i,
                summary: `Tóm tắt: ${title}. Cập nhật thông tin mới nhất về thị trường bất động sản.`,
                content: `<p>${title}</p><p>Đây là bài viết chia sẻ thông tin hữu ích về thị trường bất động sản.</p>`,
                category: categories[i % 3],
                thumbnailUrl: randomItem(thumbnails.news),
                author: 'Happy Land',
                views: randomNumber(100, 5000),
                updatedAt: new Date(),
            }
        })
    }
    console.log('✅ Created 40 news articles')

    console.log('🎉 BULK seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
