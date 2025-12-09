'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'

// Helper function to generate slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

// Create News
export async function createNews(data: {
    title: string
    categoryId: number
    summary: string
    content: string
    thumbnailUrl: string
    author?: string
    isFeatured: boolean
    isActive: boolean
}) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        const slug = generateSlug(data.title)

        // Check slug uniqueness
        const existing = await prisma.news.findUnique({ where: { slug } })
        if (existing) {
            return { success: false, message: 'Tiêu đề đã tồn tại. Vui lòng chọn tiêu đề khác.' }
        }

        const news = await prisma.news.create({
            data: {
                title: data.title,
                slug,
                category: 'MARKET', // Default value for backward compatibility
                categoryId: data.categoryId,
                summary: data.summary,
                content: data.content,
                thumbnailUrl: data.thumbnailUrl,
                author: data.author || 'Admin',
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                updatedAt: new Date(),
            },
        })

        revalidatePath('/admin/news')
        revalidatePath('/tin-tuc')

        return { success: true, message: 'Đã tạo tin tức thành công', data: news }
    } catch (error) {
        console.error('Error creating news:', error)
        return { success: false, message: 'Không thể tạo tin tức. Vui lòng thử lại.' }
    }
}

// Update News
export async function updateNews(
    id: number,
    data: {
        title: string
        categoryId: number
        summary: string
        content: string
        thumbnailUrl: string
        author?: string
        isFeatured: boolean
        isActive: boolean
    }
) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        const slug = generateSlug(data.title)

        // Check slug uniqueness (excluding current news)
        const existing = await prisma.news.findFirst({
            where: { AND: [{ slug }, { NOT: { id } }] },
        })
        if (existing) {
            return { success: false, message: 'Tiêu đề đã tồn tại. Vui lòng chọn tiêu đề khác.' }
        }

        const news = await prisma.news.update({
            where: { id },
            data: {
                title: data.title,
                slug,
                categoryId: data.categoryId,
                summary: data.summary,
                content: data.content,
                thumbnailUrl: data.thumbnailUrl,
                author: data.author || 'Admin',
                isFeatured: data.isFeatured,
                isActive: data.isActive,
            },
        })

        revalidatePath('/admin/news')
        revalidatePath('/tin-tuc')
        revalidatePath(`/tin-tuc/${slug}`)

        return { success: true, message: 'Đã cập nhật tin tức thành công', data: news }
    } catch (error) {
        console.error('Error updating news:', error)
        return { success: false, message: 'Không thể cập nhật tin tức. Vui lòng thử lại.' }
    }
}

// Delete News
export async function deleteNews(id: number) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        await prisma.news.delete({ where: { id } })

        revalidatePath('/admin/news')
        revalidatePath('/tin-tuc')

        return { success: true, message: 'Đã xóa tin tức thành công' }
    } catch (error) {
        console.error('Error deleting news:', error)
        return { success: false, message: 'Không thể xóa tin tức. Vui lòng thử lại.' }
    }
}

// Increment views
export async function incrementNewsViews(slug: string) {
    try {
        await prisma.news.update({
            where: { slug },
            data: { views: { increment: 1 } },
        })
    } catch (error) {
        console.error('Error incrementing views:', error)
    }
}
