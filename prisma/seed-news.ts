import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to generate slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

const newsData = [
    {
        title: 'Thị trường BĐS TP.HCM quý 4/2024: Dấu hiệu phục hồi tích cực',
        slug: generateSlug('Thị trường BĐS TP.HCM quý 4/2024: Dấu hiệu phục hồi tích cực'),
        category: 'MARKET' as const,
        summary: 'Thị trường bất động sản TP.HCM ghi nhận nhiều tín hiệu tích cực trong qu 4/2024 với lượng giao dịch tăng 25% so với cùng kỳ năm trước.',
        content: `<h2>Dấu hiệu phục hồi mạnh mẽ</h2><p>Theo báo cáo từ các sàn giao dịch lớn, thị trường BĐS TP.HCM đang có những dấu hiệu phục hồi rõ rệt.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
        author: 'Nguyễn Văn A',
    },
    {
        title: 'Phong thủy nhà ở: 5 nguyên tắc vàng mang tài lộc vào nhà',
        slug: generateSlug('Phong thủy nhà ở: 5 nguyên tắc vàng mang tài lộc vào nhà'),
        category: 'FENG_SHUI' as const,
        summary: 'Khám phá 5 nguyên tắc phong thủy cơ bản giúp gia chủ thu hút tài lộc, sức khỏe và may mắn cho gia đình.',
        content: `<h2>5 Nguyên tắc phong thủy cần biết</h2><p>Hướng nhà phù hợp, cửa chính thoáng, phòng khách sáng sủa.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
        author: 'Phong Thủy Việt',
    },
    {
        title: 'Luật Đất đai 2024: Những thay đổi quan trọng người dân cần biết',
        slug: generateSlug('Luật Đất đai 2024: Những thay đổi quan trọng người dân cần biết'),
        category: 'LEGAL' as const,
        summary: 'Luật Đất đai 2024 có hiệu lực từ 01/01/2024 với nhiều thay đổi quan trọng về quyền sử dụng đất.',
        content: `<h2>Những điểm mới của Luật Đất đai 2024</h2><p>Thời hạn sử dụng đất, bảng giá đất mới, đơn giản hóa thủ tục.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000',
        author: 'Luật sư Trần B',
    },
    {
        title: 'Giá nhà tại Hà Nội tăng trung bình 8% trong 6 tháng đầu năm',
        slug: generateSlug('Giá nhà tại Hà Nội tăng trung bình 8% trong 6 tháng đầu năm'),
        category: 'MARKET' as const,
        summary: 'Thịtrường BĐS Hà Nội ghi nhận mức tăng giá ổn định, đặc biệt tại các quận nội thành.',
        content: `<h2>Tăng giá ổn định</h2><p>Cầu Giấy +12%, Hoàng Mai +10%, Hà Đông +9%.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000',
        author: 'Báo Kinh tế',
    },
    {
        title: 'Cách chọn hướng cửa chính theo tuổi gia chủ',
        slug: generateSlug('Cách chọn hướng cửa chính theo tuổi gia chủ'),
        category: 'FENG_SHUI' as const,
        summary: 'Hướng dẫn chi tiết cách chọn hướng cửa chính phù hợp với tuổi và mệnh của gia chủ.',
        content: `<h2>Nguyên tắc chọn hướng cửa</h2><p>Tính mệnh theo năm sinh. Kim: Tây, Mộc: Đông, Thủy: Bắc, Hỏa: Nam.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14f8d?auto=format&fit=crop&q=80&w=1000',
        author: 'Thầy Phong Thủy',
    },
    {
        title: 'Thủ tục sang tên sổ đỏ: Hướng dẫn từng bước chi tiết',
        slug: generateSlug('Thủ tục sang tên sổ đỏ: Hướng dẫn từng bước chi tiết'),
        category: 'LEGAL' as const,
        summary: 'Hướng dẫn đầy đủ các bước và giấy tờ cần thiết để thực hiện thủ tục sang tên sổ đỏ nhanh chóng.',
        content: `<h2>Các bước sang tên sổ đỏ</h2><p>Chuẩn bị hồ sơ, công chứng, nộp hồ sơ, nhận kết quả sau 10-15 ngày.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000',
        author: 'Luật Hoàng Phi',
    },
    {
        title: 'Dự báo xu hướng BĐS 2025: Phân khúc nào đáng đầu tư?',
        slug: generateSlug('Dự báo xu hướng BĐS 2025: Phân khúc nào đáng đầu tư?'),
        category: 'MARKET' as const,
        summary: 'Phân tích và dự báo các phân khúc BĐS tiềm năng trong năm 2025.',
        content: `<h2>Xu hướng đầu tư 2025</h2><p>Căn hộ tầm trung, đất nền vùng ven, shophouse đều tiềm năng.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
        author: 'Chuyên gia BĐS',
    },
    {
        title: 'Màu sơn nhà theo phong thủy: Chọn sao cho đúng?',
        slug: generateSlug('Màu sơn nhà theo phong thủy: Chọn sao cho đúng?'),
        category: 'FENG_SHUI' as const,
        summary: 'Hướng dẫn chọn màu sơn nhà phù hợp với mệnh gia chủ và hướng nhà.',
        content: `<h2>Màu sắc và phong thủy</h2><p>Kim: Trắng, Mộc: Xanh lá, Thủy: Xanh dương, Hỏa: Đỏ, Thổ: Vàng nâu.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=1000',
        author: 'Kiến trúc sư C',
    },
    {
        title: 'Quy định mới về xây dựng nhà ở riêng lẻ tại đô thị',
        slug: generateSlug('Quy định mới về xây dựng nhà ở riêng lẻ tại đô thị'),
        category: 'LEGAL' as const,
        summary: 'Tổng hợp các quy định mới nhất về cấp phép xây dựng, mật độ, tầng cao.',
        content: `<h2>Quy định xây dựng mới</h2><p>Nhà dưới 3 tầng không cần giấy phép, mật độ tối đa 60%, tầng cao 4-5 tầng.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1000',
        author: 'Bộ Xây dựng',
    },
    {
        title: 'Bí quyết đầu tư BĐS cho người mới bắt đầu',
        slug: generateSlug('Bí quyết đầu tư BĐS cho người mới bắt đầu'),
        category: 'MARKET' as const,
        summary: 'Chia sẻ kinh nghiệm và lời khuyên thiết thực cho những ai mới bước chân vào thị trường.',
        content: `<h2>Lời khuyên cho người mới</h2><p>Nghiên cứu kỹ thị trường, bắt đầu với sản phẩm nhỏ, tính toán tài chính, kiên nhẫn.</p>`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1000',
        author: 'Đầu tư thông minh',
    },
]

async function main() {
    console.log('🌱 Seeding news data...')

    for (const news of newsData) {
        const created = await prisma.news.create({
            data: news,
        })
        console.log(`✅ Created: ${created.title}`)
    }

    console.log('✨ Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
