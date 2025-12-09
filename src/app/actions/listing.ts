'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'
import { embedListing, deleteListingEmbedding } from '@/lib/ai/auto-embed'

type ListingFormData = {
    title: string
    slug: string
    description: string
    content?: string
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    direction?: string
    location: string
    fullLocation?: string
    type: 'APARTMENT' | 'HOUSE' | 'LAND' | 'RENT'
    projectId?: number | null
    images: string[]
    amenityIds: number[]
    isFeatured: boolean
    isActive: boolean
}

export async function createListing(data: ListingFormData) {
    const session = await getSession()

    if (!session) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { amenityIds, images, projectId, ...listingData } = data

        const listing = await prisma.listing.create({
            data: {
                ...listingData,
                thumbnailUrl: images[0],
                images: JSON.stringify(images),
                projectId: projectId || null,
                updatedAt: new Date(),
                listingamenity: {
                    create: amenityIds.map((amenityId) => ({
                        amenity: { connect: { id: amenityId } },
                    })),
                },
            },
            include: {
                listingamenity: {
                    include: { amenity: true }
                }
            }
        })

        // Auto-embed for chatbot
        const amenities = listing.listingamenity.map(la => la.amenity.name)
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
            amenities
        })

        revalidatePath('/admin/listings')
        return { success: true, message: 'Tạo listing thành công!', data: listing }
    } catch (error: any) {
        console.error('Create listing error:', error)

        if (error.code === 'P2002') {
            return { success: false, error: 'Slug đã tồn tại' }
        }

        return { success: false, error: 'Có lỗi xảy ra khi tạo listing' }
    }
}

export async function updateListing(id: number, data: ListingFormData) {
    const session = await getSession()

    if (!session) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { amenityIds, images, projectId, ...listingData } = data

        const listing = await prisma.listing.update({
            where: { id },
            data: {
                ...listingData,
                thumbnailUrl: images[0],
                images: JSON.stringify(images),
                projectId: projectId || null,
                listingamenity: {
                    deleteMany: {},
                    create: amenityIds.map((amenityId) => ({
                        amenity: { connect: { id: amenityId } },
                    })),
                },
            },
            include: {
                listingamenity: {
                    include: { amenity: true }
                }
            }
        })

        // Auto-embed for chatbot
        const amenities = listing.listingamenity.map(la => la.amenity.name)
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
            amenities
        })

        revalidatePath('/admin/listings')
        revalidatePath(`/admin/listings/${id}`)
        return { success: true, message: 'Cập nhật listing thành công!', data: listing }
    } catch (error: any) {
        console.error('Update listing error:', error)

        if (error.code === 'P2002') {
            return { success: false, error: 'Slug đã tồn tại' }
        }

        return { success: false, error: 'Có lỗi xảy ra khi cập nhật listing' }
    }
}

export async function deleteListing(id: number) {
    const session = await getSession()

    if (!session) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.listing.delete({
            where: { id },
        })

        // Delete embedding
        await deleteListingEmbedding(id)

        revalidatePath('/admin/listings')
        return { success: true, message: 'Xóa listing thành công!' }
    } catch (error) {
        console.error('Delete listing error:', error)
        return { success: false, error: 'Có lỗi xảy ra khi xóa listing' }
    }
}
