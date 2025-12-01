import { Metadata } from 'next'
import NewsForm from '@/components/admin/news/news-form'

export const metadata: Metadata = {
    title: 'Tạo Tin tức mới | Admin',
    description: 'Tạo tin tức mới',
}

export default function NewNewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tạo tin tức mới</h1>
                <p className="text-slate-600 mt-2">Thêm tin tức mới vào hệ thống</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <NewsForm />
            </div>
        </div>
    )
}
