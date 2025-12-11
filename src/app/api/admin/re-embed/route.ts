import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import prisma from '@/lib/prisma'
import { embedProject, embedListing } from '@/lib/ai/auto-embed'
import { vectorStore } from '@/lib/ai/vector-store'

// SECURITY: Only admin can trigger re-embed
const JWT_SECRET = process.env.JWT_SECRET
    ? new TextEncoder().encode(process.env.JWT_SECRET)
    : null

/**
 * Re-embed all projects and listings
 * Call this when embedding data is missing or corrupted
 */
export async function POST() {
    console.error('[Re-embed] API called')

    // Auth check
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value

    if (!token || !JWT_SECRET) {
        console.error('[Re-embed] Unauthorized - no token or secret')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await jwtVerify(token, JWT_SECRET)
    } catch {
        console.error('[Re-embed] Invalid session')
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    try {
        const results = {
            projects: { total: 0, success: 0, failed: 0 },
            listings: { total: 0, success: 0, failed: 0 }
        }

        // Clear existing embeddings first
        console.error('[Re-embed] Clearing existing embeddings...')
        vectorStore.clearAll()

        // Re-embed all projects
        const projects = await prisma.project.findMany({
            include: {
                projectamenity: {
                    include: { amenity: true }
                }
            }
        })

        console.error(`[Re-embed] Found ${projects.length} projects to embed`)
        results.projects.total = projects.length

        for (const project of projects) {
            try {
                await embedProject({
                    id: project.id,
                    name: project.name,
                    slug: project.slug,
                    category: project.category,
                    location: project.location,
                    fullLocation: project.fullLocation,
                    priceRange: project.priceRange,
                    status: project.status,
                    description: project.description,
                    thumbnailUrl: project.thumbnailUrl,
                    amenities: project.projectamenity.map(pa => pa.amenity.name)
                })
                results.projects.success++
            } catch (err) {
                console.error(`[Re-embed] Failed project ${project.id}:`, err)
                results.projects.failed++
            }
        }

        // Re-embed all listings
        const listings = await prisma.listing.findMany({
            include: {
                listingamenity: {
                    include: { amenity: true }
                }
            }
        })

        console.error(`[Re-embed] Found ${listings.length} listings to embed`)
        results.listings.total = listings.length

        for (const listing of listings) {
            try {
                await embedListing({
                    id: listing.id,
                    title: listing.title,
                    slug: listing.slug,
                    type: listing.type,
                    price: listing.price,
                    area: listing.area,
                    bedrooms: listing.bedrooms,
                    bathrooms: listing.bathrooms,
                    direction: listing.direction,
                    location: listing.location,
                    fullLocation: listing.fullLocation,
                    description: listing.description,
                    thumbnailUrl: listing.thumbnailUrl,
                    amenities: listing.listingamenity.map(la => la.amenity.name)
                })
                results.listings.success++
            } catch (err) {
                console.error(`[Re-embed] Failed listing ${listing.id}:`, err)
                results.listings.failed++
            }
        }

        console.error(`[Re-embed] Completed! Projects: ${results.projects.success}/${results.projects.total}, Listings: ${results.listings.success}/${results.listings.total}`)

        return NextResponse.json({
            success: true,
            message: 'Re-embed completed',
            results
        })
    } catch (error) {
        console.error('[Re-embed] Error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Re-embed failed'
        }, { status: 500 })
    }
}
