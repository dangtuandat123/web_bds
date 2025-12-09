import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
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
