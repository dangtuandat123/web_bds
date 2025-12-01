import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import NewsCard from '@/components/modules/news-card'

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
    searchParams: { category?: string }
}

export default async function NewsPage({ searchParams }: PageProps) {
    const category = searchParams.category || 'all'

    const where = category !== 'all' ? { category: category as any } : {}

    const news = await prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 12,
    })

    const categories = [
        { id: 'all', label: 'Tất cả' },
        { id: 'MARKET', label: 'Thị trường' },
        { id: 'FENG_SHUI', label: 'Phong thủy' },
        { id: 'LEGAL', label: 'Pháp lý' },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div
                className="relative h-[40vh] flex items-center justify-center text-white bg-cover bg-center"
                style={{ backgroundImage: "url('/images/news-hero.jpg')" }}
            >
                <div className="absolute inset-0 bg-slate-900/70"></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Tin tức & Pháp lý</h1>
                    <p className="text-lg md:text-xl text-slate-200">
                        Cập nhật mới nhất về thị trường BĐS
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Category Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <a
                            key={cat.id}
                            href={cat.id === 'all' ? '/tin-tuc' : `/tin-tuc?category=${cat.id}`}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${category === cat.id
                                    ? 'bg-amber-500 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-600 border border-slate-200'
                                }`}
                        >
                            {cat.label}
                        </a>
                    ))}
                </div>

                {/* News Grid */}
                {news.length > 0 ? (
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
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Chưa có tin tức nào</p>
                    </div>
                )}
            </div>
        </div>
    )
}
