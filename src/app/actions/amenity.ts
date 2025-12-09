'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'

// Get all amenities
export async function getAmenities() {
    try {
        const amenities = await prisma.amenity.findMany({
            orderBy: { name: 'asc' },
        })

        // Get counts separately
        const amenitiesWithCounts = await Promise.all(
            amenities.map(async (amenity) => {
                const projectCount = await prisma.projectamenity.count({
                    where: { amenityId: amenity.id }
                })
                const listingCount = await prisma.listingamenity.count({
                    where: { amenityId: amenity.id }
                })
                return {
                    ...amenity,
                    _count: { projectamenity: projectCount, listingamenity: listingCount }
                }
            })
        )

        return { success: true, data: amenitiesWithCounts }
    } catch (error) {
        console.error('Get amenities error:', error)
        return { success: false, error: 'Không thể tải danh sách tiện ích' }
    }
}

// Create amenity
export async function createAmenity(data: { name: string; icon: string }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const amenity = await prisma.amenity.create({
            data: {
                name: data.name,
                icon: data.icon,
            }
        })
        revalidatePath('/admin/amenities')
        return { success: true, data: amenity, message: 'Tạo tiện ích thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Tiện ích này đã tồn tại' }
        }
        console.error('Create amenity error:', error)
        return { success: false, error: 'Không thể tạo tiện ích' }
    }
}

// Update amenity
export async function updateAmenity(id: number, data: { name: string; icon: string }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const amenity = await prisma.amenity.update({
            where: { id },
            data: {
                name: data.name,
                icon: data.icon,
            }
        })
        revalidatePath('/admin/amenities')
        return { success: true, data: amenity, message: 'Cập nhật tiện ích thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Tiện ích này đã tồn tại' }
        }
        console.error('Update amenity error:', error)
        return { success: false, error: 'Không thể cập nhật tiện ích' }
    }
}

// Delete amenity
export async function deleteAmenity(id: number) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.amenity.delete({
            where: { id }
        })
        revalidatePath('/admin/amenities')
        return { success: true, message: 'Xóa tiện ích thành công!' }
    } catch (error) {
        console.error('Delete amenity error:', error)
        return { success: false, error: 'Không thể xóa tiện ích. Có thể đang được sử dụng.' }
    }
}
