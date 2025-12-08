// Script to seed fake data
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedData() {
    console.log('🌱 Seeding database...')

    const now = new Date()

    // project_category: APARTMENT, VILLA, LAND
    // project_status: UPCOMING, SELLING, SOLD_OUT
    const projects = [
        { name: 'Vinhomes Grand Park', slug: 'vinhomes-grand-park', location: 'Quận 9, TP.HCM', category: 'APARTMENT', status: 'SELLING', priceRange: '2.5 - 8 tỷ', description: 'Đại đô thị đẳng cấp Singapore và hơn thế nữa tại TP.HCM' },
        { name: 'Masteri Thảo Điền', slug: 'masteri-thao-dien', location: 'Quận 2, TP.HCM', category: 'APARTMENT', status: 'SOLD_OUT', priceRange: '4 - 12 tỷ', description: 'Căn hộ cao cấp tại trung tâm Thảo Điền' },
        { name: 'The Metropole', slug: 'the-metropole', location: 'Thủ Thiêm, TP.HCM', category: 'APARTMENT', status: 'SELLING', priceRange: '8 - 25 tỷ', description: 'Dự án cao cấp bậc nhất Thủ Thiêm' },
        { name: 'Ecopark Hưng Yên', slug: 'ecopark-hung-yen', location: 'Hưng Yên', category: 'VILLA', status: 'SELLING', priceRange: '3 - 15 tỷ', description: 'Khu đô thị xanh lớn nhất miền Bắc' },
        { name: 'Celadon City', slug: 'celadon-city', location: 'Tân Phú, TP.HCM', category: 'APARTMENT', status: 'SELLING', priceRange: '2.8 - 6 tỷ', description: 'Khu đô thị phong cách Singapore' },
        { name: 'Phú Mỹ Hưng', slug: 'phu-my-hung', location: 'Quận 7, TP.HCM', category: 'VILLA', status: 'SELLING', priceRange: '5 - 30 tỷ', description: 'Khu đô thị kiểu mẫu' },
        { name: 'Sunshine City', slug: 'sunshine-city', location: 'Hà Nội', category: 'APARTMENT', status: 'SELLING', priceRange: '4 - 10 tỷ', description: 'Căn hộ cao cấp sử dụng công nghệ 4.0' },
        { name: 'Aqua City', slug: 'aqua-city', location: 'Đồng Nai', category: 'VILLA', status: 'UPCOMING', priceRange: '6 - 20 tỷ', description: 'Đô thị sinh thái thông minh' },
        { name: 'The Global City', slug: 'the-global-city', location: 'Thủ Đức, TP.HCM', category: 'APARTMENT', status: 'UPCOMING', priceRange: '15 - 50 tỷ', description: 'Trung tâm mới của TP.HCM' },
        { name: 'Vạn Phúc City', slug: 'van-phuc-city', location: 'Thủ Đức, TP.HCM', category: 'VILLA', status: 'SELLING', priceRange: '12 - 40 tỷ', description: 'Khu đô thị đẳng cấp' },
        { name: 'Imperia Smart City', slug: 'imperia-smart-city', location: 'Hà Nội', category: 'APARTMENT', status: 'SELLING', priceRange: '2 - 5 tỷ', description: 'Căn hộ thông minh giá tốt' },
        { name: 'The Sun Avenue', slug: 'the-sun-avenue', location: 'Quận 2, TP.HCM', category: 'APARTMENT', status: 'SOLD_OUT', priceRange: '3 - 7 tỷ', description: 'Căn hộ view sông Sài Gòn' },
        { name: 'Diamond Island', slug: 'diamond-island', location: 'Quận 2, TP.HCM', category: 'APARTMENT', status: 'SOLD_OUT', priceRange: '5 - 15 tỷ', description: 'Đảo Kim Cương - nơi an cư đẳng cấp' },
        { name: 'Palm Heights', slug: 'palm-heights', location: 'Quận 2, TP.HCM', category: 'APARTMENT', status: 'SELLING', priceRange: '4.5 - 9 tỷ', description: 'Căn hộ nghỉ dưỡng giữa lòng thành phố' },
        { name: 'Eco Green Sài Gòn', slug: 'eco-green-sai-gon', location: 'Quận 7, TP.HCM', category: 'APARTMENT', status: 'SELLING', priceRange: '3 - 8 tỷ', description: 'Căn hộ xanh tiêu chuẩn LEED' },
        { name: 'Landmark 81', slug: 'landmark-81', location: 'Bình Thạnh, TP.HCM', category: 'APARTMENT', status: 'SOLD_OUT', priceRange: '8 - 50 tỷ', description: 'Tòa nhà cao nhất Việt Nam' },
        { name: 'Sky Park Residence', slug: 'sky-park-residence', location: 'Hà Nội', category: 'APARTMENT', status: 'SELLING', priceRange: '3.5 - 8 tỷ', description: 'Căn hộ view công viên' },
        { name: 'Đất nền Phú Quốc', slug: 'dat-nen-phu-quoc-2', location: 'Phú Quốc', category: 'LAND', status: 'SELLING', priceRange: '2 - 6 tỷ', description: 'Đất nền đẹp' },
        { name: 'Biệt thự Nha Trang', slug: 'biet-thu-nha-trang', location: 'Nha Trang', category: 'VILLA', status: 'SELLING', priceRange: '3 - 12 tỷ', description: 'Biệt thự view biển đẹp nhất' },
        { name: 'Đất nền Bình Dương', slug: 'dat-nen-binh-duong', location: 'Bình Dương', category: 'LAND', status: 'SELLING', priceRange: '1.5 - 5 tỷ', description: 'Đất nền giá tốt' }
    ]

    for (const p of projects) {
        await prisma.project.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                location: p.location,
                category: p.category,
                status: p.status,
                priceRange: p.priceRange,
                description: p.description,
                thumbnailUrl: `https://picsum.photos/seed/${p.slug}/800/600`,
                images: JSON.stringify([`https://picsum.photos/seed/${p.slug}1/800/600`]),
                isFeatured: Math.random() > 0.5,
                createdAt: now,
                updatedAt: now
            }
        })
    }
    console.log('✅ Created 20 projects')

    // listing_type: APARTMENT, HOUSE, LAND, RENT
    const listings = [
        { title: 'Căn hộ 2PN Vinhomes Central Park', slug: 'can-ho-2pn-vinhomes-central-park', type: 'APARTMENT', price: 4500000000, area: 80, bedrooms: 2, bathrooms: 2, location: 'Bình Thạnh' },
        { title: 'Nhà phố liền kề Quận 2', slug: 'nha-pho-lien-ke-quan-2', type: 'HOUSE', price: 12000000000, area: 120, bedrooms: 4, bathrooms: 4, location: 'Quận 2' },
        { title: 'Đất nền Long An 100m²', slug: 'dat-nen-long-an-100m2', type: 'LAND', price: 1500000000, area: 100, bedrooms: 0, bathrooms: 0, location: 'Long An' },
        { title: 'Cho thuê căn hộ Masteri', slug: 'cho-thue-can-ho-masteri', type: 'RENT', price: 15000000, area: 70, bedrooms: 2, bathrooms: 2, location: 'Quận 2' },
        { title: 'Biệt thự Phú Mỹ Hưng', slug: 'biet-thu-phu-my-hung', type: 'HOUSE', price: 35000000000, area: 400, bedrooms: 5, bathrooms: 6, location: 'Quận 7' },
        { title: 'Căn hộ 3PN The Metropole', slug: 'can-ho-3pn-the-metropole', type: 'APARTMENT', price: 12000000000, area: 120, bedrooms: 3, bathrooms: 2, location: 'Thủ Thiêm' },
        { title: 'Đất nền Nhơn Trạch', slug: 'dat-nen-nhon-trach', type: 'LAND', price: 800000000, area: 80, bedrooms: 0, bathrooms: 0, location: 'Đồng Nai' },
        { title: 'Cho thuê văn phòng Quận 1', slug: 'cho-thue-van-phong-quan-1', type: 'RENT', price: 25000000, area: 100, bedrooms: 0, bathrooms: 2, location: 'Quận 1' },
        { title: 'Căn hộ 1PN Landmark 81', slug: 'can-ho-1pn-landmark-81', type: 'APARTMENT', price: 8000000000, area: 60, bedrooms: 1, bathrooms: 1, location: 'Bình Thạnh' },
        { title: 'Nhà riêng Thủ Đức', slug: 'nha-rieng-thu-duc', type: 'HOUSE', price: 6500000000, area: 90, bedrooms: 3, bathrooms: 3, location: 'Thủ Đức' },
        { title: 'Đất vườn Củ Chi', slug: 'dat-vuon-cu-chi', type: 'LAND', price: 2000000000, area: 500, bedrooms: 0, bathrooms: 0, location: 'Củ Chi' },
        { title: 'Cho thuê shophouse Vinhomes', slug: 'cho-thue-shophouse-vinhomes', type: 'RENT', price: 50000000, area: 150, bedrooms: 0, bathrooms: 2, location: 'Quận 9' },
        { title: 'Căn hộ 2PN Diamond Island', slug: 'can-ho-2pn-diamond-island', type: 'APARTMENT', price: 7500000000, area: 85, bedrooms: 2, bathrooms: 2, location: 'Quận 2' },
        { title: 'Nhà mặt tiền Quận 10', slug: 'nha-mat-tien-quan-10', type: 'HOUSE', price: 18000000000, area: 80, bedrooms: 4, bathrooms: 4, location: 'Quận 10' },
        { title: 'Đất thổ cư Bình Dương', slug: 'dat-tho-cu-binh-duong', type: 'LAND', price: 1200000000, area: 100, bedrooms: 0, bathrooms: 0, location: 'Bình Dương' },
        { title: 'Cho thuê căn hộ Sun Avenue', slug: 'cho-thue-can-ho-sun-avenue', type: 'RENT', price: 12000000, area: 75, bedrooms: 2, bathrooms: 2, location: 'Quận 2' },
        { title: 'Penthouse Thảo Điền Pearl', slug: 'penthouse-thao-dien-pearl', type: 'APARTMENT', price: 25000000000, area: 300, bedrooms: 4, bathrooms: 4, location: 'Quận 2' },
        { title: 'Nhà phố Palm City', slug: 'nha-pho-palm-city', type: 'HOUSE', price: 15000000000, area: 150, bedrooms: 4, bathrooms: 5, location: 'Quận 2' },
        { title: 'Đất nền Phú Quốc', slug: 'dat-nen-phu-quoc', type: 'LAND', price: 5000000000, area: 200, bedrooms: 0, bathrooms: 0, location: 'Phú Quốc' },
        { title: 'Cho thuê villa Thảo Điền', slug: 'cho-thue-villa-thao-dien', type: 'RENT', price: 80000000, area: 350, bedrooms: 5, bathrooms: 6, location: 'Quận 2' }
    ]

    for (const l of listings) {
        await prisma.listing.upsert({
            where: { slug: l.slug },
            update: {},
            create: {
                title: l.title,
                slug: l.slug,
                type: l.type,
                price: l.price,
                area: l.area,
                bedrooms: l.bedrooms,
                bathrooms: l.bathrooms,
                location: l.location,
                description: `${l.title} - Vị trí đẹp, tiện ích đầy đủ, pháp lý hoàn chỉnh.`,
                thumbnailUrl: `https://picsum.photos/seed/${l.slug}/800/600`,
                images: JSON.stringify([`https://picsum.photos/seed/${l.slug}1/800/600`]),
                direction: ['Đông', 'Tây', 'Nam', 'Bắc'][Math.floor(Math.random() * 4)],
                isFeatured: Math.random() > 0.6,
                createdAt: now,
                updatedAt: now
            }
        })
    }
    console.log('✅ Created 20 listings')

    // news_category: MARKET, FENG_SHUI, LEGAL
    const newsItems = [
        { title: 'Thị trường BĐS 2024: Xu hướng và cơ hội', slug: 'thi-truong-bds-2024', category: 'MARKET' },
        { title: 'Lãi suất vay mua nhà giảm sâu', slug: 'lai-suat-vay-mua-nha', category: 'MARKET' },
        { title: 'Quy định mới về sổ đỏ, sổ hồng', slug: 'quy-dinh-moi-so-do', category: 'LEGAL' },
        { title: 'Cách chọn căn hộ phong thủy tốt', slug: 'cach-chon-can-ho-phong-thuy', category: 'FENG_SHUI' },
        { title: 'Hướng nhà hợp tuổi 2024', slug: 'huong-nha-hop-tuoi', category: 'FENG_SHUI' },
        { title: 'Thuế và phí khi mua bất động sản', slug: 'thue-phi-bds', category: 'LEGAL' },
        { title: 'So sánh giá BĐS các quận TP.HCM', slug: 'so-sanh-gia-bds', category: 'MARKET' },
        { title: 'Phong thủy phòng khách căn hộ', slug: 'phong-thuy-phong-khach', category: 'FENG_SHUI' },
        { title: 'Thủ tục sang tên sổ đỏ', slug: 'thu-tuc-sang-ten', category: 'LEGAL' },
        { title: 'Dự báo giá BĐS năm 2025', slug: 'du-bao-gia-bds-2025', category: 'MARKET' }
    ]

    for (const n of newsItems) {
        await prisma.news.upsert({
            where: { slug: n.slug },
            update: {},
            create: {
                title: n.title,
                slug: n.slug,
                category: n.category,
                content: `<h2>${n.title}</h2><p>Nội dung chi tiết về ${n.title.toLowerCase()}. Lorem ipsum dolor sit amet.</p>`,
                summary: `Tìm hiểu về ${n.title.toLowerCase()}.`,
                thumbnailUrl: `https://picsum.photos/seed/${n.slug}/800/400`,
                author: 'Happy Land',
                isFeatured: Math.random() > 0.7,
                createdAt: now,
                updatedAt: now
            }
        })
    }
    console.log('✅ Created 10 news articles')

    // Seed Leads (20 leads)
    const names = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
        'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hương', 'Ngô Văn Inh', 'Đỗ Thị Kim',
        'Lý Văn Long', 'Trương Thị Mai', 'Phan Văn Nam', 'Đinh Thị Oanh', 'Lương Văn Phúc',
        'Tạ Thị Quỳnh', 'Hồ Văn Rồng', 'Võ Thị Sen', 'Chu Văn Tài', 'Đoàn Thị Uyên']
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
    const sources = ['FORM', 'CHATBOT']

    for (let i = 0; i < 20; i++) {
        await prisma.lead.create({
            data: {
                name: names[i],
                phone: `090123456${(i + 1).toString().padStart(2, '0')}`,
                email: `user${i + 1}@gmail.com`,
                message: 'Tôi quan tâm đến bất động sản. Vui lòng liên hệ tư vấn.',
                status: statuses[Math.floor(Math.random() * statuses.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: now
            }
        })
    }
    console.log('✅ Created 20 leads')

    console.log('🎉 Database seeded successfully!')
}

seedData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
