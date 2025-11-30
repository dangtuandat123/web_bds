'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'

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
                images: images,
                projectId: projectId || null,
                amenities: {
                    create: amenityIds.map((amenityId) => ({
                        amenity: { connect: { id: amenityId } },
                    })),
                },
            },
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
                images: images,
                projectId: projectId || null,
                amenities: {
                    deleteMany: {},
                    create: amenityIds.map((amenityId) => ({
                        amenity: { connect: { id: amenityId } },
                    })),
                },
            },
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

        revalidatePath('/admin/listings')
        return { success: true, message: 'Xóa listing thành công!' }
    } catch (error) {
        console.error('Delete listing error:', error)
        return { success: false, error: 'Có lỗi xảy ra khi xóa listing' }
    }
}
