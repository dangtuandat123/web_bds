import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import { Search, X } from 'lucide-react'
import NewsCard from '@/components/modules/news-card'
import PagePagination from '@/components/modules/page-pagination'

export const metadata: Metadata = {
    title: 'Tin tức & Pháp lý | HAPPY LAND',
    description: 'Cập nhật tin tức thị trường, phong thủy, và pháp lý bất động sản',
}

const categoryConfig: Record<string, string> = {
    MARKET: 'Thị trường',
    FENG_SHUI: 'Phong thủy',
    LEGAL: 'Pháp lý',
}

interface PageProps {
    searchParams: Promise<{ category?: string; q?: string; page?: string }>
}

export default async function NewsPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams
    const category = resolvedSearchParams.category || 'all'
    const searchQuery = resolvedSearchParams.q || ''
    const page = parseInt(resolvedSearchParams.page || '1')
    const perPage = 6

    // Build where clause
    const where: any = {}
    if (category !== 'all') {
        where.category = category
    }
    if (searchQuery) {
        where.OR = [
            { title: { contains: searchQuery } },
            { summary: { contains: searchQuery } },
        ]
    }

    const [news, total] = await Promise.all([
        prisma.news.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: perPage,
            skip: (page - 1) * perPage,
        }),
        prisma.news.count({ where })
    ])

    const totalPages = Math.ceil(total / perPage)

    // Build searchParams object for pagination
    const paginationParams: Record<string, string> = {}
    if (category !== 'all') paginationParams.category = category
    if (searchQuery) paginationParams.q = searchQuery

    const categories = [
        { id: 'all', label: 'Tất cả' },
        { id: 'MARKET', label: 'Thị trường' },
        { id: 'FENG_SHUI', label: 'Phong thủy' },
        { id: 'LEGAL', label: 'Pháp lý' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative h-[40vh] flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
                        Tin tức & Pháp lý
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200">
                        Cập nhật mới nhất về thị trường BĐS
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Search & Filter Section */}
                <div className="bg-white/90 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl border border-white/50 -mt-24 mb-12 relative z-20 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <h3 className="text-slate-800 font-bold flex items-center uppercase text-sm tracking-wide">
                            <span className="bg-amber-100 text-amber-600 p-1.5 rounded mr-2">
                                <Search size={16} />
                            </span>
                            Tìm kiếm tin tức
                        </h3>
                        <span className="text-xs text-slate-400 italic hidden sm:inline">
                            Lọc theo danh mục hoặc từ khóa
                        </span>
                    </div>

                    <form method="GET" action="/tin-tuc">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                            {/* Search Input */}
                            <div className="md:col-span-6 lg:col-span-7">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                                    Từ khóa
                                </label>
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-3.5 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        name="q"
                                        defaultValue={searchQuery}
                                        placeholder="Nhập từ khóa tìm kiếm..."
                                        className="w-full h-11 pl-10 pr-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="md:col-span-4 lg:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                                    Danh mục
                                </label>
                                <select
                                    name="category"
                                    defaultValue={category}
                                    className="w-full h-11 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm font-medium transition-all cursor-pointer"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Button */}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-transparent uppercase mb-1">
                                    .
                                </label>
                                <button
                                    type="submit"
                                    className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <Search size={16} />
                                    <span className="hidden sm:inline">Tìm kiếm</span>
                                </button>
                            </div>
                        </div>

                        {/* Clear Button Row */}
                        <div className="flex justify-end">
                            <a
                                href="/tin-tuc"
                                className="text-slate-400 hover:text-amber-600 text-sm font-medium underline flex items-center gap-1 transition-colors"
                            >
                                <X size={14} />
                                Xóa bộ lọc
                            </a>
                        </div>
                    </form>

                    {/* Active Filters Display */}
                    {(searchQuery || category !== 'all') && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
                            <span className="text-slate-500 font-medium">Lọc theo:</span>
                            {searchQuery && (
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                    "{searchQuery}"
                                </span>
                            )}
                            {category !== 'all' && (
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {categories.find((c) => c.id === category)?.label}
                                </span>
                            )}
                            <a
                                href="/tin-tuc"
                                className="ml-auto text-slate-400 hover:text-amber-600 text-xs font-medium underline"
                            >
                                Xóa bộ lọc
                            </a>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-slate-600 font-medium">
                        Tìm thấy <span className="text-amber-600 font-bold">{total}</span> tin
                        tức
                    </p>
                </div>

                {/* News Grid */}
                {news.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => (
                                <NewsCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    category={item.category}
                                    categoryLabel={categoryConfig[item.category]}
                                    summary={item.summary}
                                    image={item.thumbnailUrl}
                                    slug={item.slug}
                                    date={item.createdAt}
                                    views={item.views}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <PagePagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/tin-tuc"
                            searchParams={paginationParams}
                        />
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                        <p className="text-slate-500 text-lg mb-2">Không tìm thấy tin tức nào</p>
                        <p className="text-slate-400 text-sm">
                            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
