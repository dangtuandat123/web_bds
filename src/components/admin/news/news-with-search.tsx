'use client'

import { useState, useMemo } from 'react'
import { news } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import NewsTable from '@/components/admin/news/news-table'

interface NewsWithSearchProps {
    news: news[]
}

export default function NewsWithSearch({ news }: NewsWithSearchProps) {
    const [search, setSearch] = useState('')

    const filteredNews = useMemo(() => {
        if (!search.trim()) return news
        const query = search.toLowerCase()
        return news.filter(n =>
            n.title.toLowerCase().includes(query) ||
            (n.summary && n.summary.toLowerCase().includes(query)) ||
            (n.author && n.author.toLowerCase().includes(query))
        )
    }, [news, search])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Tìm theo tiêu đề, tóm tắt, tác giả..."
                />
                <span className="text-sm text-slate-500">
                    {filteredNews.length} / {news.length} bài viết
                </span>
            </div>
            <NewsTable news={filteredNews} />
        </div>
    )
}
