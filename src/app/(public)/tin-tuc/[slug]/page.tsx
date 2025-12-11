import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Calendar, User, Eye } from 'lucide-react'
import prisma from '@/lib/prisma'
import { incrementNewsViews } from '@/app/actions/news'
import { getSiteSettings } from '@/lib/settings'
import { sanitizeHtml } from '@/lib/utils/sanitize'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const settings = await getSiteSettings()

    const news = await prisma.news.findUnique({
        where: { slug },
    })

    if (!news) {
        return { title: 'Không tìm thấy tin tức' }
    }

    return {
        title: `${news.title} | ${settings.siteName}`,
        description: news.summary,
    }
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { slug } = await params

    const news = await prisma.news.findUnique({
        where: { slug },
        include: {
            newsCategory: true
        }
    })

    if (!news) {
        notFound()
    }

    // Increment views (async, don't await)
    incrementNewsViews(slug)

    // Related news - by same category
    const relatedNews = await prisma.news.findMany({
        where: {
            categoryId: news.categoryId,
            NOT: { id: news.id },
            isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
            newsCategory: true
        }
    })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Image */}
            <div className="relative h-[50vh] w-full">
                <img src={news.thumbnailUrl}
                    alt={news.title}

                    className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            {/* Category Badge */}
                            <div className="mb-4">
                                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {news.newsCategory?.name || 'Tin tức'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">
                                {news.title}
                            </h1>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8 pb-8 border-b">
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>{news.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>
                                        {new Intl.DateTimeFormat('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        }).format(new Date(news.createdAt))}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye size={16} />
                                    <span>{news.views} lượt xem</span>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="text-lg text-slate-700 mb-8 font-medium bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                                {news.summary}
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }}
                            ></div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <span className="w-1 h-5 bg-amber-500 mr-3 rounded-full"></span>
                                Tin liên quan
                            </h3>

                            {relatedNews.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedNews.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`/tin-tuc/${item.slug}`}
                                            className="block group"
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={item.thumbnailUrl}
                                                        alt={item.title}

                                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Intl.DateTimeFormat('vi-VN').format(
                                                            new Date(item.createdAt)
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Không có tin liên quan</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
