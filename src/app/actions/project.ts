'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'

export async function deleteProject(id: number) {
    // Validate session
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.project.delete({
            where: { id },
        })

        revalidatePath('/admin/projects')

        return { success: true }
    } catch (error) {
        console.error('Delete project error:', error)
        return { error: 'Không thể xóa dự án' }
    }
}

interface ProjectData {
    name: string
    slug: string
    category: 'APARTMENT' | 'VILLA' | 'LAND'
    location: string
    fullLocation?: string
    description: string
    content?: string
    priceRange: string
    status: 'UPCOMING' | 'SELLING' | 'SOLD_OUT'
    images: string[]
    amenityIds: number[]
    isFeatured: boolean
    isActive: boolean
}

export async function createProject(data: ProjectData) {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const { amenityIds, images, ...projectData } = data

        // Create project with amenities
        await prisma.project.create({
            data: {
                ...projectData,
                thumbnailUrl: images[0] || '', // Use first image as thumbnail
                images: JSON.stringify(images), // Store as JSON string
                updatedAt: new Date(),
                projectamenity: {
                    create: amenityIds.map((amenityId) => ({
                        amenity: {
                            connect: { id: amenityId },
                        },
                    })),
                },
            },
        })

        revalidatePath('/admin/projects')

        return { success: true }
    } catch (error: any) {
        console.error('Create project error:', error)

        // Handle unique constraint error
        if (error.code === 'P2002') {
            return { error: 'Slug đã tồn tại, vui lòng chọn slug khác' }
        }

        return { error: 'Không thể tạo dự án' }
    }
}

export async function updateProject(id: number, data: ProjectData) {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        const { amenityIds, images, ...projectData } = data

        // Update project and replace amenities
        await prisma.project.update({
            where: { id },
            data: {
                ...projectData,
                thumbnailUrl: images[0] || '',
                images: JSON.stringify(images),
                projectamenity: {
                    // Delete existing and create new
                    deleteMany: {},
                    create: amenityIds.map((amenityId) => ({
                        amenity: {
                            connect: { id: amenityId },
                        },
                    })),
                },
            },
        })

        revalidatePath('/admin/projects')
        revalidatePath(`/admin/projects/${id}`)

        return { success: true }
    } catch (error: any) {
        console.error('Update project error:', error)

        if (error.code === 'P2002') {
            return { error: 'Slug đã tồn tại, vui lòng chọn slug khác' }
        }

        return { error: 'Không thể cập nhật dự án' }
    }
}
