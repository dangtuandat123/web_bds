import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import NewsForm from '@/components/admin/news/news-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export const metadata: Metadata = {
    title: 'Chỉnh sửa Tin tức | Admin',
    description: 'Chỉnh sửa tin tức',
}

export default async function EditNewsPage({ params }: PageProps) {
    const { id } = await params

    const news = await prisma.news.findUnique({
        where: { id: parseInt(id) },
    })

    if (!news) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa tin tức</h1>
                <p className="text-slate-600 mt-2">Cập nhận thông tin tin tức</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <NewsForm initialData={news} />
            </div>
        </div>
    )
}
