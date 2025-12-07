import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import NewsForm from '@/components/admin/news/news-form'

export const metadata: Metadata = {
    title: 'Tạo Tin tức mới | Admin',
    description: 'Tạo tin tức mới',
}

async function getCategories() {
    try {
        const categories = await prisma.newscategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, slug: true }
        })
        return categories
    } catch {
        return []
    }
}

export default async function NewNewsPage() {
    const categories = await getCategories()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tạo tin tức mới</h1>
                <p className="text-slate-600 mt-2">Thêm tin tức mới vào hệ thống</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <NewsForm categories={categories} />
            </div>
        </div>
    )
}
