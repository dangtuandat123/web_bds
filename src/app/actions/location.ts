'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'

// Get all locations
export async function getLocations() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { sortOrder: 'asc' },
        })
        return { success: true, data: locations }
    } catch (error) {
        console.error('Get locations error:', error)
        return { success: false, error: 'Không thể tải danh sách khu vực' }
    }
}

// Get active locations only (for dropdowns)
export async function getActiveLocations() {
    try {
        const locations = await prisma.location.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        })
        return locations.map(loc => loc.name)
    } catch (error) {
        console.error('Get active locations error:', error)
        return []
    }
}

// Create location
export async function createLocation(data: { name: string }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const maxOrder = await prisma.location.findFirst({
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        })

        const location = await prisma.location.create({
            data: {
                name: data.name,
                sortOrder: (maxOrder?.sortOrder || 0) + 1,
            }
        })
        revalidatePath('/admin/locations')
        return { success: true, data: location, message: 'Tạo khu vực thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Khu vực này đã tồn tại' }
        }
        console.error('Create location error:', error)
        return { success: false, error: 'Không thể tạo khu vực' }
    }
}

// Update location
export async function updateLocation(id: number, data: { name: string; isActive: boolean }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const location = await prisma.location.update({
            where: { id },
            data: {
                name: data.name,
                isActive: data.isActive,
            }
        })
        revalidatePath('/admin/locations')
        return { success: true, data: location, message: 'Cập nhật khu vực thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Khu vực này đã tồn tại' }
        }
        console.error('Update location error:', error)
        return { success: false, error: 'Không thể cập nhật khu vực' }
    }
}

// Delete location
export async function deleteLocation(id: number) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await prisma.location.delete({
            where: { id }
        })
        revalidatePath('/admin/locations')
        return { success: true, message: 'Xóa khu vực thành công!' }
    } catch (error) {
        console.error('Delete location error:', error)
        return { success: false, error: 'Không thể xóa khu vực' }
    }
}

// Seed initial locations from constants
export async function seedLocations() {
    const INITIAL_LOCATIONS = [
        'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
        'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
        'Quận 11', 'Quận 12', 'Thủ Đức', 'Bình Thạnh', 'Gò Vấp',
        'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Bình Tân',
        'Nhà Bè', 'Hóc Môn', 'Củ Chi', 'Cần Giờ'
    ]

    try {
        for (let i = 0; i < INITIAL_LOCATIONS.length; i++) {
            await prisma.location.upsert({
                where: { name: INITIAL_LOCATIONS[i] },
                update: {},
                create: {
                    name: INITIAL_LOCATIONS[i],
                    sortOrder: i + 1,
                }
            })
        }
        revalidatePath('/admin/locations')
        return { success: true, message: `Đã tạo ${INITIAL_LOCATIONS.length} khu vực mặc định!` }
    } catch (error) {
        console.error('Seed locations error:', error)
        return { success: false, error: 'Không thể tạo khu vực mặc định' }
    }
}
