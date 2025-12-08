'use client'

import { useState, useMemo } from 'react'
import { news } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import AdminPagination from '@/components/admin/admin-pagination'
import NewsTable from '@/components/admin/news/news-table'

const ITEMS_PER_PAGE = 10

interface NewsWithSearchProps {
    news: news[]
}

export default function NewsWithSearch({ news }: NewsWithSearchProps) {
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredNews = useMemo(() => {
        if (!search.trim()) return news
        const query = search.toLowerCase()
        return news.filter(n =>
            n.title.toLowerCase().includes(query) ||
            (n.summary && n.summary.toLowerCase().includes(query)) ||
            (n.author && n.author.toLowerCase().includes(query))
        )
    }, [news, search])

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    // Pagination
    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
    const paginatedNews = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredNews.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredNews, currentPage])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={handleSearch}
                    placeholder="Tìm theo tiêu đề, tóm tắt, tác giả..."
                />
                <span className="text-sm text-slate-500">
                    {filteredNews.length} / {news.length} bài viết
                </span>
            </div>
            <NewsTable news={paginatedNews} />
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}

