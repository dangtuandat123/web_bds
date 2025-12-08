// Script to reset admin password
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

async function resetAdminPassword() {
    const prisma = new PrismaClient()

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        const now = new Date()

        // Update or create admin user
        await prisma.user.upsert({
            where: { email: 'admin@happyland.net.vn' },
            update: {
                password: hashedPassword,
                updatedAt: now
            },
            create: {
                email: 'admin@happyland.net.vn',
                password: hashedPassword,
                name: 'Admin',
                role: 'ADMIN',
                createdAt: now,
                updatedAt: now
            }
        })

        console.log('✅ Admin password reset successfully!')
        console.log('Email: admin@happyland.net.vn')
        console.log('Password: admin123')
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAdminPassword()
