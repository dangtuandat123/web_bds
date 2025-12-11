import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Health check endpoint for keep-alive pings
 * Use with cron job: curl https://canhohanghieu.com/api/health
 */
export async function GET() {
    try {
        // Quick DB check to keep connection warm
        await prisma.$queryRaw`SELECT 1`

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
