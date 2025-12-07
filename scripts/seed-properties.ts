// Script to add sample property data to vector database
import 'dotenv/config'
import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { OpenAI } from 'openai'

const DB_FILE = 'embeddings.db'

// Initialize OpenAI for embeddings
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
})

async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'google/gemini-embedding-001',
        input: text,
    })
    return response.data[0].embedding
}

const sampleProperties = [
    // Căn hộ Thủ Đức - giá 1.5-3 tỷ
    {
        content: `Căn hộ 2PN Masteri An Phú - Vị trí trung tâm Thủ Đức. Giá: 2.5 tỷ. Diện tích: 65 m2. Phòng ngủ: 2. Vị trí: Masteri An Phú, Thảo Điền, TP. Thủ Đức. Đặc điểm: View hồ bơi, nội thất cao cấp, gần Metro.`,
        metadata: {
            type: 'LISTING',
            id: 101,
            slug: 'can-ho-masteri-an-phu-2pn-65m2',
            title: 'Căn hộ 2PN Masteri An Phú - Vị trí trung tâm Thủ Đức',
            price: 2.5,
            area: 65,
            location: 'Thảo Điền, TP. Thủ Đức'
        }
    },
    {
        content: `Căn hộ 1PN+1 Palm Heights giá tốt nhất thị trường. Giá: 1.8 tỷ. Diện tích: 50 m2. Vị trí: Palm Heights, An Phú, TP. Thủ Đức. Đặc điểm: Full nội thất, view sông, pháp lý đầy đủ.`,
        metadata: {
            type: 'LISTING',
            id: 102,
            slug: 'can-ho-palm-heights-1pn-50m2',
            title: 'Căn hộ 1PN+1 Palm Heights giá tốt nhất thị trường',
            price: 1.8,
            area: 50,
            location: 'An Phú, TP. Thủ Đức'
        }
    },
    {
        content: `Căn hộ 2PN The Sun Avenue - View sông Sài Gòn. Giá: 2.9 tỷ. Diện tích: 73 m2. Vị trí: The Sun Avenue, An Phú, TP. Thủ Đức. Đặc điểm: View trực diện sông, ban công rộng, tiện ích đầy đủ.`,
        metadata: {
            type: 'LISTING',
            id: 103,
            slug: 'can-ho-sun-avenue-2pn-73m2-view-song',
            title: 'Căn hộ 2PN The Sun Avenue - View sông Sài Gòn',
            price: 2.9,
            area: 73,
            location: 'An Phú, TP. Thủ Đức'
        }
    },
    {
        content: `Căn hộ Studio Vinhomes Grand Park - Chỉ 1.5 tỷ. Diện tích: 35 m2. Vị trí: Vinhomes Grand Park, Long Thạnh Mỹ, TP. Thủ Đức. Đặc điểm: Nội thất cơ bản, view công viên, gần hồ.`,
        metadata: {
            type: 'LISTING',
            id: 104,
            slug: 'can-ho-vinhomes-grand-park-studio-35m2',
            title: 'Căn hộ Studio Vinhomes Grand Park - Chỉ 1.5 tỷ',
            price: 1.5,
            area: 35,
            location: 'Long Thạnh Mỹ, TP. Thủ Đức'
        }
    },
    {
        content: `Căn hộ 2PN Safira Khang Điền - Thanh toán linh hoạt. Giá: 2.2 tỷ. Diện tích: 67 m2. Vị trí: Safira Khang Điền, Phú Hữu, TP. Thủ Đức. Đặc điểm: Bàn giao hoàn thiện, hỗ trợ vay 70%.`,
        metadata: {
            type: 'LISTING',
            id: 105,
            slug: 'can-ho-safira-khang-dien-2pn-67m2',
            title: 'Căn hộ 2PN Safira Khang Điền - Thanh toán linh hoạt',
            price: 2.2,
            area: 67,
            location: 'Phú Hữu, TP. Thủ Đức'
        }
    },
    // Dự án lớn
    {
        content: `Dự án VINHOMES GRAND PARK. Loại hình: APARTMENT. Vị trí: Long Thạnh Mỹ, TP. Thủ Đức. Giá: Từ 1.5 - 4.5 tỷ/căn. Tiện ích: Công viên 36ha, Vinmart, Vinschool, VinMec, Hồ bơi, Gym. Mô tả: Đại đô thị đẳng cấp bậc nhất phía Đông Sài Gòn.`,
        metadata: {
            type: 'PROJECT',
            id: 201,
            slug: 'vinhomes-grand-park',
            name: 'VINHOMES GRAND PARK',
            priceRange: 'Từ 1.5 - 4.5 tỷ/căn',
            location: 'Long Thạnh Mỹ, TP. Thủ Đức'
        }
    },
    {
        content: `Dự án MASTERI CENTRE POINT. Loại hình: APARTMENT. Vị trí: Vinhomes Grand Park, TP. Thủ Đức. Giá: Từ 2.8 - 6 tỷ/căn. Tiện ích: Smart Home, Hồ bơi vô cực, Sky Bar, Gym cao cấp. Mô tả: Căn hộ cao cấp với thiết kế hiện đại.`,
        metadata: {
            type: 'PROJECT',
            id: 202,
            slug: 'masteri-centre-point',
            name: 'MASTERI CENTRE POINT',
            priceRange: 'Từ 2.8 - 6 tỷ/căn',
            location: 'Vinhomes Grand Park, TP. Thủ Đức'
        }
    }
]

async function seedDatabase() {
    console.log('🚀 Starting to seed vector database...')
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? '✅ Found' : '❌ Missing')

    const db = new Database(DB_FILE)

    // Delete old sample data (IDs 101-202)
    db.exec(`DELETE FROM document_embeddings WHERE json_extract(metadata, '$.id') >= 101`)
    console.log('🗑️ Cleared old sample data')

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO document_embeddings (id, content, metadata, embedding)
        VALUES (?, ?, ?, ?)
    `)

    let success = 0
    for (const property of sampleProperties) {
        try {
            console.log(`📝 Processing: ${property.metadata.title || property.metadata.name}`)
            const embedding = await generateEmbedding(property.content)
            const id = uuidv4()
            stmt.run(id, property.content, JSON.stringify(property.metadata), JSON.stringify(embedding))
            console.log(`  ✅ Added with ID: ${id}`)
            success++
        } catch (error: any) {
            console.error(`  ❌ Failed:`, error.message)
        }
    }

    db.close()
    console.log(`\n✨ Seeding completed! Added ${success}/${sampleProperties.length} properties.`)
}

seedDatabase().catch(console.error)
