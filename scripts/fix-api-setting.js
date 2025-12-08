// Script to ensure api_openrouter setting exists
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixApiSetting() {
    console.log('🔧 Fixing API settings...')

    try {
        const result = await prisma.setting.upsert({
            where: { key: 'api_openrouter' },
            update: {
                type: 'text',
                groupName: 'api'
            },
            create: {
                key: 'api_openrouter',
                value: '',
                type: 'text',
                groupName: 'api'
            }
        })

        console.log('✅ Upserted api_openrouter setting:', result)

        // Check if it exists now
        const check = await prisma.setting.findUnique({
            where: { key: 'api_openrouter' }
        })
        console.log('🔍 Verification:', check)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixApiSetting()
