import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import prisma from '@/lib/prisma'

// SECURITY: Only allow in development or with admin auth
const JWT_SECRET = process.env.JWT_SECRET
    ? new TextEncoder().encode(process.env.JWT_SECRET)
    : null

export async function GET() {
    // Block in production unless authenticated as admin
    if (process.env.NODE_ENV === 'production') {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value

        if (!token || !JWT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
            await jwtVerify(token, JWT_SECRET)
        } catch {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }
    }

    try {
        // Test database connection by counting records
        const stats = {
            users: await prisma.user.count(),
            projects: await prisma.project.count(),
            listings: await prisma.listing.count(),
            amenities: await prisma.amenity.count(),
            leads: await prisma.lead.count(),
        }

        // Get sample project data
        const sampleProject = await prisma.project.findFirst({
            include: {
                projectamenity: {
                    include: {
                        amenity: true
                    }
                }
            }
        })

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            stats,
            sampleProject
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Database connection failed'
        }, { status: 500 })
    }
}
