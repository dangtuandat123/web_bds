'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'
import { embedProject, deleteProjectEmbedding } from '@/lib/ai/auto-embed'

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

        // Delete embedding
        await deleteProjectEmbedding(id)

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
        const project = await prisma.project.create({
            data: {
                ...projectData,
                thumbnailUrl: images[0] || '',
                images: JSON.stringify(images),
                updatedAt: new Date(),
                projectamenity: {
                    create: amenityIds.map((amenityId) => ({
                        amenity: {
                            connect: { id: amenityId },
                        },
                    })),
                },
            },
            include: {
                projectamenity: {
                    include: { amenity: true }
                }
            }
        })

        // Auto-embed for chatbot
        const amenities = project.projectamenity.map(pa => pa.amenity.name)
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
            amenities
        })

        revalidatePath('/admin/projects')

        return { success: true }
    } catch (error: any) {
        console.error('Create project error:', error)

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
        const project = await prisma.project.update({
            where: { id },
            data: {
                ...projectData,
                thumbnailUrl: images[0] || '',
                images: JSON.stringify(images),
                projectamenity: {
                    deleteMany: {},
                    create: amenityIds.map((amenityId) => ({
                        amenity: {
                            connect: { id: amenityId },
                        },
                    })),
                },
            },
            include: {
                projectamenity: {
                    include: { amenity: true }
                }
            }
        })

        // Auto-embed for chatbot
        const amenities = project.projectamenity.map(pa => pa.amenity.name)
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
            amenities
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
