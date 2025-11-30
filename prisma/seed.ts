import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.projectAmenity.deleteMany()
    await prisma.listingAmenity.deleteMany()
    await prisma.listing.deleteMany()
    await prisma.project.deleteMany()
    await prisma.amenity.deleteMany()
    await prisma.lead.deleteMany()
    await prisma.chatSession.deleteMany()
    await prisma.user.deleteMany()

    // Create Admin User
    console.log('👤 Creating admin user...')
    const admin = await prisma.user.create({
        data: {
            email: 'admin@happyland.net.vn',
            password: '$2b$10$XC4SJaUeGTGR6VWW5vOABeZoca0yXXPffF49kswAuNuymf60rOAQS', // admin123
            name: 'Admin Happy Land',
            role: 'ADMIN',
        },
    })
    console.log(`✅ Created admin: ${admin.email}`)

    // Create Amenities
    console.log('🏊 Creating amenities...')
    const amenities = await Promise.all([
        prisma.amenity.create({ data: { name: 'Hồ bơi', icon: '🏊' } }),
        prisma.amenity.create({ data: { name: 'Gym & Spa', icon: '💪' } }),
        prisma.amenity.create({ data: { name: 'Công viên', icon: '🌳' } }),
        prisma.amenity.create({ data: { name: 'An ninh 24/7', icon: '🛡️' } }),
        prisma.amenity.create({ data: { name: 'Khu BBQ', icon: '🍖' } }),
    ])
    console.log(`✅ Created ${amenities.length} amenities`)

    // Create Projects
    console.log('🏗️ Creating projects...')

    const project1 = await prisma.project.create({
        data: {
            name: 'CĂN HỘ MT EASTMARK CITY',
            slug: 'can-ho-mt-eastmark-city',
            category: 'APARTMENT',
            location: 'TP. Thủ Đức',
            fullLocation: 'Đường Vành Đai 3, TP. Thủ Đức, TP.HCM',
            description: 'Khu phức hợp căn hộ cao cấp ven sông, biểu tượng sống mới tại tâm điểm thành phố Thủ Đức.',
            content: 'Thông tin chi tiết về dự án MT Eastmark City. Vị trí đắc địa, kết nối thuận tiện. Quy mô dự án lớn với nhiều tiện ích nội khu như hồ bơi, công viên, trung tâm thương mại.',
            priceRange: '36 triệu/m²',
            status: 'SELLING',
            thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600596542815-2a4d9f10927c?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000'
            ],
            amenities: {
                create: [
                    { amenityId: amenities[0].id }, // Hồ bơi
                    { amenityId: amenities[1].id }, // Gym & Spa
                    { amenityId: amenities[2].id }, // Công viên
                    { amenityId: amenities[3].id }, // An ninh 24/7
                ]
            }
        },
    })

    const project2 = await prisma.project.create({
        data: {
            name: 'KHU BIỆT THỰ HAPPY HOME',
            slug: 'khu-biet-thu-happy-home',
            category: 'VILLA',
            location: 'Quận 9',
            fullLocation: 'Quận 9, TP. Thủ Đức',
            description: 'Không gian sống thượng lưu với thiết kế biệt thự đơn lập và song lập sang trọng.',
            content: 'Dự án biệt thự biệt lập với không gian xanh mát, mang lại sự riêng tư tuyệt đối cho gia chủ.',
            priceRange: '15 Tỷ/căn',
            status: 'SELLING',
            thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1000'
            ],
            amenities: {
                create: [
                    { amenityId: amenities[0].id }, // Hồ bơi
                    { amenityId: amenities[2].id }, // Công viên
                    { amenityId: amenities[3].id }, // An ninh 24/7
                ]
            }
        },
    })

    console.log(`✅ Created 2 projects`)

    // Create Listings
    console.log('🏠 Creating listings...')

    await prisma.listing.create({
        data: {
            title: 'Bán 2PN 73m2 tặng nội thất, block Hybrid chỉ 4.1 tỷ view sông',
            slug: 'ban-2pn-73m2-hybrid-view-song',
            description: 'Căn hộ 2 phòng ngủ view sông đẹp, tặng toàn bộ nội thất cao cấp',
            content: 'Cần bán nhanh căn hộ 2 phòng ngủ, diện tích 73m2. Tặng gói nội thất cao cấp. Vị trí Block Hybrid đắc địa, tầm nhìn trực diện sông thoáng mát. Giá bán chỉ 4.1 tỷ đồng. Liên hệ ngay để xem nhà.',
            price: 4.1,
            area: 73,
            bedrooms: 2,
            bathrooms: 2,
            direction: 'Đông Nam',
            location: 'TP. Thủ Đức',
            fullLocation: 'MT Eastmark City, TP. Thủ Đức',
            type: 'APARTMENT',
            thumbnailUrl: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1502005229766-3a2ebcea591b?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000'
            ],
            tags: ['Tặng nội thất', 'View sông', 'Block Hybrid'],
            isFeatured: true,
            projectId: project1.id,
            amenities: {
                create: [
                    { amenityId: amenities[0].id },
                    { amenityId: amenities[1].id },
                    { amenityId: amenities[4].id },
                ]
            }
        },
    })

    await prisma.listing.create({
        data: {
            title: 'Bán căn hộ Ricca Quận 9, 1PN+1 giá tốt',
            slug: 'ban-can-ho-ricca-quan-9',
            description: 'Căn hộ Ricca thiết kế thông minh 1PN+1, phù hợp gia đình trẻ',
            content: 'Căn hộ Ricca thiết kế thông minh 1PN+1, phù hợp gia đình trẻ. Tiện ích hồ bơi, BBQ, công viên.',
            price: 2.1,
            area: 56,
            bedrooms: 1,
            bathrooms: 1,
            direction: 'Tây Bắc',
            location: 'Quận 9',
            fullLocation: 'Đường Gò Cát, Phú Hữu, TP. Thủ Đức',
            type: 'APARTMENT',
            thumbnailUrl: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1556912172-4545a9310c97?auto=format&fit=crop&q=80&w=1000'
            ],
            tags: ['Giá tốt', 'Sổ hồng có sẵn'],
            isFeatured: false,
            projectId: project1.id,
            amenities: {
                create: [
                    { amenityId: amenities[0].id },
                    { amenityId: amenities[2].id },
                ]
            }
        },
    })

    await prisma.listing.create({
        data: {
            title: 'Đất nền Long Phước, sổ đỏ trao tay, xây dựng tự do',
            slug: 'dat-nen-long-phuoc',
            description: 'Đất nền thổ cư 100%, khu dân cư hiện hữu, đường nhựa 8m',
            content: 'Đất nền thổ cư 100%, khu dân cư hiện hữu, đường nhựa 8m. Thích hợp mua ở hoặc đầu tư lâu dài.',
            price: 3.5,
            area: 100,
            bedrooms: 0,
            bathrooms: 0,
            direction: 'Nam',
            location: 'Long Phước',
            fullLocation: 'Long Phước, TP. Thủ Đức',
            type: 'LAND',
            thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000'
            ],
            tags: ['Sổ đỏ', 'Xây tự do', 'Gần sông'],
            isFeatured: false,
            amenities: {
                create: []
            }
        },
    })

    await prisma.listing.create({
        data: {
            title: 'Cho thuê Studio Full nội thất Vinhomes Grand Park',
            slug: 'thue-studio-vinhomes',
            description: 'Cho thuê căn studio đầy đủ tiện nghi, dọn vào ở ngay',
            content: 'Cho thuê nhanh căn studio đầy đủ tiện nghi. Máy lạnh, tủ lạnh, máy giặt, bếp từ. Internet tốc độ cao.',
            price: 0.005, // 5 triệu/tháng converted to billions
            area: 30,
            bedrooms: 1,
            bathrooms: 1,
            direction: 'Đông',
            location: 'Quận 9',
            fullLocation: 'Vinhomes Grand Park, Quận 9',
            type: 'RENT',
            thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1000'
            ],
            tags: ['Full nội thất', 'Dọn vào ngay'],
            isFeatured: false,
            amenities: {
                create: [
                    { amenityId: amenities[1].id },
                ]
            }
        },
    })

    console.log(`✅ Created 4 listings`)

    // Create sample leads
    console.log('📞 Creating sample leads...')
    await prisma.lead.createMany({
        data: [
            {
                name: 'Nguyễn Văn A',
                phone: '0912345678',
                email: 'nguyenvana@example.com',
                message: 'Tôi quan tâm đến dự án MT Eastmark City',
                source: 'FORM',
                status: 'NEW',
            },
            {
                name: 'Trần Thị B',
                phone: '0987654321',
                email: 'tranthib@example.com',
                message: 'Muốn xem căn hộ 2PN view sông',
                source: 'CHATBOT',
                status: 'CONTACTED',
            },
        ],
    })
    console.log(`✅ Created 2 sample leads`)

    console.log('✅ Database seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
