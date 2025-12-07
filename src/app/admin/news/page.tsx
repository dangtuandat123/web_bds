import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import NewsTable from '@/components/admin/news/news-table'
import NewsCategoryManager from '@/components/admin/news/news-category-manager'

export const metadata: Metadata = {
    title: 'Quản lý Tin tức | Admin',
    description: 'Quản lý tin tức và bài viết',
}

export default async function AdminNewsPage() {
    const [news, categories] = await Promise.all([
        prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
        }),
        prisma.newscategory.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { news: true }
                }
            }
        })
    ])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Quản lý Tin tức</h1>
                    <p className="text-slate-600 mt-2">
                        Tạo và quản lý tin tức ({news.length} bài viết)
                    </p>
                </div>
                <Link href="/admin/news/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo tin tức mới
                    </Button>
                </Link>
            </div>

            {/* Category Manager */}
            <NewsCategoryManager categories={categories} />

            {/* News Table */}
            <NewsTable news={news} />
        </div>
    )
}
