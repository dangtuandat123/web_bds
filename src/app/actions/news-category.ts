'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from './auth'

// Helper function to generate slug
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// Get all news categories
export async function getNewsCategories() {
    try {
        const categories = await prisma.newscategory.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { news: true }
                }
            }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error('Get news categories error:', error)
        return { success: false, error: 'Không thể tải danh sách danh mục' }
    }
}

// Get active news categories (for dropdowns)
export async function getActiveNewsCategories() {
    try {
        const categories = await prisma.newscategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, slug: true }
        })
        return categories
    } catch (error) {
        console.error('Get active news categories error:', error)
        return []
    }
}

// Create news category
export async function createNewsCategory(data: { name: string }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const slug = generateSlug(data.name)

        // Get max sortOrder
        const maxOrder = await prisma.newscategory.findFirst({
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        })

        const category = await prisma.newscategory.create({
            data: {
                name: data.name,
                slug,
                sortOrder: (maxOrder?.sortOrder || 0) + 1
            }
        })

        revalidatePath('/admin/news')
        return { success: true, data: category, message: 'Tạo danh mục thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Danh mục này đã tồn tại' }
        }
        console.error('Create news category error:', error)
        return { success: false, error: 'Không thể tạo danh mục' }
    }
}

// Update news category
export async function updateNewsCategory(id: number, data: { name: string; isActive?: boolean }) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const slug = generateSlug(data.name)

        const category = await prisma.newscategory.update({
            where: { id },
            data: {
                name: data.name,
                slug,
                isActive: data.isActive
            }
        })

        revalidatePath('/admin/news')
        return { success: true, data: category, message: 'Cập nhật danh mục thành công!' }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Danh mục này đã tồn tại' }
        }
        console.error('Update news category error:', error)
        return { success: false, error: 'Không thể cập nhật danh mục' }
    }
}

// Delete news category
export async function deleteNewsCategory(id: number) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Check if category has news
        const newsCount = await prisma.news.count({
            where: { categoryId: id }
        })

        if (newsCount > 0) {
            return { success: false, error: `Không thể xóa. Danh mục này có ${newsCount} bài viết.` }
        }

        await prisma.newscategory.delete({
            where: { id }
        })

        revalidatePath('/admin/news')
        return { success: true, message: 'Xóa danh mục thành công!' }
    } catch (error) {
        console.error('Delete news category error:', error)
        return { success: false, error: 'Không thể xóa danh mục' }
    }
}

// Seed default categories
export async function seedNewsCategories() {
    try {
        const defaultCategories = [
            { name: 'Thị trường', slug: 'thi-truong', sortOrder: 1 },
            { name: 'Phong thủy', slug: 'phong-thuy', sortOrder: 2 },
            { name: 'Pháp lý', slug: 'phap-ly', sortOrder: 3 },
        ]

        let created = 0
        for (const cat of defaultCategories) {
            const exists = await prisma.newscategory.findUnique({
                where: { slug: cat.slug }
            })

            if (!exists) {
                await prisma.newscategory.create({ data: cat })
                created++
            }
        }

        revalidatePath('/admin/news')
        return {
            success: true,
            message: created > 0
                ? `Đã tạo ${created} danh mục mẫu!`
                : 'Các danh mục mẫu đã tồn tại.'
        }
    } catch (error) {
        console.error('Seed news categories error:', error)
        return { success: false, error: 'Không thể tạo danh mục mẫu' }
    }
}
