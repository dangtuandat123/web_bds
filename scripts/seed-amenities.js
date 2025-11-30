const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedAmenities() {
    const amenities = [
        { name: 'Hồ bơi', icon: '🏊' },
        { name: 'Gym', icon: '💪' },
        { name: 'Sân tennis', icon: '🎾' },
        { name: 'Khu vui chơi trẻ em', icon: '🎠' },
        { name: 'An ninh 24/7', icon: '🔒' },
        { name: 'Siêu thị', icon: '🛒' },
        { name: 'Công viên', icon: '🌳' },
        { name: 'Bãi đỗ xe', icon: '🚗' },
    ]

    for (const amenity of amenities) {
        await prisma.amenity.upsert({
            where: { name: amenity.name },
            update: {},
            create: amenity,
        })
    }

    console.log('✅ Seeded', amenities.length, 'amenities')

    const all = await prisma.amenity.findMany()
    console.log('Total amenities:', all.length)
    console.log(JSON.stringify(all, null, 2))
}

seedAmenities()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
