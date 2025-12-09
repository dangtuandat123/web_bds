import { Building, Home, Users, Newspaper, TrendingUp, Clock, Eye, MessageSquare, BarChart3, PieChart, Activity } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import Link from 'next/link'
import DashboardFilter from '@/components/admin/dashboard-filter'

// Helper to get date range for month/year filter
function getDateRange(month?: string, year?: string) {
    if (!month && !year) return undefined

    const now = new Date()
    const filterYear = year ? parseInt(year) : now.getFullYear()
    const filterMonth = month ? parseInt(month) - 1 : undefined // JS months are 0-indexed

    if (filterMonth !== undefined) {
        // Specific month
        const startDate = new Date(filterYear, filterMonth, 1)
        const endDate = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59) // Last day of month
        return { gte: startDate, lte: endDate }
    } else {
        // Entire year
        const startDate = new Date(filterYear, 0, 1)
        const endDate = new Date(filterYear, 11, 31, 23, 59, 59)
        return { gte: startDate, lte: endDate }
    }
}

async function getStats(month?: string, year?: string) {
    const dateRange = getDateRange(month, year)
    const dateFilter = dateRange ? { createdAt: dateRange } : {}

    const [
        projectCount,
        listingCount,
        leadCount,
        newsCount,
        chatSessionCount,
        // Listing breakdown by type
        apartmentCount,
        houseCount,
        landCount,
        rentCount,
        // Lead breakdown by status
        newLeads,
        contactedLeads,
        // Featured counts
        featuredProjects,
        featuredListings,
        // Recent data
        recentLeads,
        recentListings,
        // Project status
        sellingProjects,
        upcomingProjects,
        soldOutProjects,
        // Top viewed news
        topViewedNews,
        // Leads last 7 days (or filtered period)
        leadsLast7Days,
    ] = await Promise.all([
        prisma.project.count({ where: dateFilter }),
        prisma.listing.count({ where: dateFilter }),
        prisma.lead.count({ where: dateFilter }),
        prisma.news.count({ where: dateFilter }),
        prisma.chatsession.count({ where: dateFilter }),
        // Listing types
        prisma.listing.count({ where: { type: 'APARTMENT', ...dateFilter } }),
        prisma.listing.count({ where: { type: 'HOUSE', ...dateFilter } }),
        prisma.listing.count({ where: { type: 'LAND', ...dateFilter } }),
        prisma.listing.count({ where: { type: 'RENT', ...dateFilter } }),
        // Lead status
        prisma.lead.count({ where: { status: 'NEW', ...dateFilter } }),
        prisma.lead.count({ where: { status: 'CONTACTED', ...dateFilter } }),
        // Featured
        prisma.project.count({ where: { isFeatured: true, ...dateFilter } }),
        prisma.listing.count({ where: { isFeatured: true, ...dateFilter } }),
        // Recent leads (last 5)
        prisma.lead.findMany({
            take: 5,
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, phone: true, source: true, status: true, createdAt: true }
        }),
        // Recent listings (last 5)
        prisma.listing.findMany({
            take: 5,
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, type: true, price: true, slug: true }
        }),
        // Project status
        prisma.project.count({ where: { status: 'SELLING', ...dateFilter } }),
        prisma.project.count({ where: { status: 'UPCOMING', ...dateFilter } }),
        prisma.project.count({ where: { status: 'SOLD_OUT', ...dateFilter } }),
        // Top viewed news
        prisma.news.findMany({
            take: 5,
            where: dateFilter,
            orderBy: { views: 'desc' },
            select: { id: true, title: true, slug: true, views: true }
        }),
        // Leads in last 7 days (for line chart) - use date range if filtered
        prisma.lead.findMany({
            where: dateRange
                ? dateFilter
                : { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            select: { createdAt: true }
        }),
    ])

    // Group leads by day for line chart
    const leadsByDay: Record<string, number> = {}
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        leadsByDay[dateStr] = 0
        last7Days.push(dateStr)
    }
    leadsLast7Days.forEach(lead => {
        const dateStr = new Date(lead.createdAt).toISOString().split('T')[0]
        if (leadsByDay[dateStr] !== undefined) {
            leadsByDay[dateStr]++
        }
    })

    return {
        projects: projectCount,
        listings: listingCount,
        leads: leadCount,
        news: newsCount,
        chatSessions: chatSessionCount,
        listingsByType: { apartment: apartmentCount, house: houseCount, land: landCount, rent: rentCount },
        leadsByStatus: { new: newLeads, contacted: contactedLeads, other: leadCount - newLeads - contactedLeads },
        featured: { projects: featuredProjects, listings: featuredListings },
        recentLeads,
        recentListings,
        projectsByStatus: { selling: sellingProjects, upcoming: upcomingProjects, soldOut: soldOutProjects },
        topViewedNews,
        leadsByDay: last7Days.map(date => ({ date, count: leadsByDay[date] })),
    }
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date))
}

function formatPrice(price: number) {
    // Handle absolute values in billions (e.g., 4500000000 = 4.5 tỷ)
    if (price >= 1000000000) {
        const ty = price / 1000000000
        return `${ty.toFixed(1).replace('.0', '')} tỷ`
    }
    // Handle absolute values in millions (e.g., 15000000 = 15 triệu)
    if (price >= 1000000) {
        const trieu = price / 1000000
        return `${trieu.toFixed(0)} triệu`
    }
    // Handle values stored in "tỷ" units (e.g., 4.5 = 4.5 tỷ)
    if (price >= 1) return `${price} tỷ`
    // Handle values less than 1 tỷ (convert to triệu)
    if (price > 0) return `${Math.round(price * 1000)} triệu`
    return 'Liên hệ'
}

const listingTypeLabels: Record<string, string> = {
    APARTMENT: 'Căn hộ',
    HOUSE: 'Nhà phố',
    LAND: 'Đất nền',
    RENT: 'Cho thuê'
}

const leadStatusLabels: Record<string, { label: string; color: string }> = {
    NEW: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
    CONTACTED: { label: 'Đã liên hệ', color: 'bg-green-100 text-green-700' },
    QUALIFIED: { label: 'Tiềm năng', color: 'bg-amber-100 text-amber-700' },
    CONVERTED: { label: 'Chuyển đổi', color: 'bg-purple-100 text-purple-700' },
    LOST: { label: 'Mất', color: 'bg-red-100 text-red-700' }
}

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string }>
}) {
    const params = await searchParams
    const session = await getSession()
    const stats = await getStats(params.month, params.year)

    // Calculate percentages for charts
    const totalListings = stats.listings || 1
    const listingPercentages = {
        apartment: Math.round((stats.listingsByType.apartment / totalListings) * 100),
        house: Math.round((stats.listingsByType.house / totalListings) * 100),
        land: Math.round((stats.listingsByType.land / totalListings) * 100),
        rent: Math.round((stats.listingsByType.rent / totalListings) * 100),
    }

    const totalProjects = stats.projects || 1
    const projectPercentages = {
        selling: Math.round((stats.projectsByStatus.selling / totalProjects) * 100),
        upcoming: Math.round((stats.projectsByStatus.upcoming / totalProjects) * 100),
        soldOut: Math.round((stats.projectsByStatus.soldOut / totalProjects) * 100),
    }

    // Get filter label
    const filterLabel = params.month || params.year
        ? `${params.month ? `Tháng ${params.month}` : ''} ${params.year || ''}`.trim()
        : 'Tất cả thời gian'

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tổng quan</h1>
                    <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">
                        Xin chào, <span className="font-semibold">{session?.email}</span>
                        {filterLabel !== 'Tất cả thời gian' && (
                            <span className="ml-2 text-amber-600">• {filterLabel}</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <DashboardFilter />
                </div>
            </div>
            <div className="text-right text-xs md:text-sm text-slate-500">
                <Clock size={14} className="inline mr-1" />
                Cập nhật: {formatDate(new Date())}
            </div>

            {/* Main Stats Cards - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dự án</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.projects}</p>
                            <p className="text-xs text-amber-600 mt-1">{stats.featured.projects} nổi bật</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                            <Building className="text-blue-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tin đăng</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.listings}</p>
                            <p className="text-xs text-amber-600 mt-1">{stats.featured.listings} nổi bật</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                            <Home className="text-green-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Khách hàng</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.leads}</p>
                            <p className="text-xs text-green-600 mt-1">{stats.leadsByStatus.new} mới</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                            <Users className="text-amber-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tin tức</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.news}</p>
                            <p className="text-xs text-slate-400 mt-1">bài viết</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
                            <Newspaper className="text-purple-600" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Chat AI</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.chatSessions}</p>
                            <p className="text-xs text-slate-400 mt-1">phiên chat</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100">
                            <MessageSquare className="text-cyan-600" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Listing by Type Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-slate-400" size={20} />
                        <h3 className="font-semibold text-slate-900">Phân loại tin đăng</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Căn hộ</span>
                                <span className="font-medium">{stats.listingsByType.apartment} ({listingPercentages.apartment}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${listingPercentages.apartment}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Nhà phố</span>
                                <span className="font-medium">{stats.listingsByType.house} ({listingPercentages.house}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${listingPercentages.house}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Đất nền</span>
                                <span className="font-medium">{stats.listingsByType.land} ({listingPercentages.land}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${listingPercentages.land}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Cho thuê</span>
                                <span className="font-medium">{stats.listingsByType.rent} ({listingPercentages.rent}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${listingPercentages.rent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Status Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart className="text-slate-400" size={20} />
                        <h3 className="font-semibold text-slate-900">Trạng thái dự án</h3>
                    </div>
                    <div className="flex items-center justify-center gap-8">
                        {/* Simple Donut Chart */}
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="15.9" fill="none"
                                    stroke="#22c55e" strokeWidth="3"
                                    strokeDasharray={`${projectPercentages.selling} 100`}
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="18" cy="18" r="15.9" fill="none"
                                    stroke="#3b82f6" strokeWidth="3"
                                    strokeDasharray={`${projectPercentages.upcoming} 100`}
                                    strokeDashoffset={`-${projectPercentages.selling}`}
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="18" cy="18" r="15.9" fill="none"
                                    stroke="#94a3b8" strokeWidth="3"
                                    strokeDasharray={`${projectPercentages.soldOut} 100`}
                                    strokeDashoffset={`-${projectPercentages.selling + projectPercentages.upcoming}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-slate-900">{stats.projects}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-slate-600">Đang bán: {stats.projectsByStatus.selling}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-slate-600">Sắp mở: {stats.projectsByStatus.upcoming}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                                <span className="text-sm text-slate-600">Đã bán hết: {stats.projectsByStatus.soldOut}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Chart Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Leads Line Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="text-slate-400" size={20} />
                        <h3 className="font-semibold text-slate-900">Khách hàng 7 ngày qua</h3>
                    </div>
                    <div className="relative h-40">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400">
                            <span>{Math.max(...stats.leadsByDay.map(d => d.count), 5)}</span>
                            <span>{Math.round(Math.max(...stats.leadsByDay.map(d => d.count), 5) / 2)}</span>
                            <span>0</span>
                        </div>
                        {/* Chart area */}
                        <div className="ml-6 h-full flex items-end justify-between gap-1">
                            {stats.leadsByDay.map((day, i) => {
                                const maxCount = Math.max(...stats.leadsByDay.map(d => d.count), 1)
                                const height = (day.count / maxCount) * 100
                                const dayLabel = new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                                            <div
                                                className="w-full max-w-8 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all hover:from-amber-600 hover:to-amber-500"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                                title={`${day.count} khách hàng`}
                                            >
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500">{dayLabel}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="mt-2 text-center text-sm text-slate-500">
                        Tổng: <span className="font-semibold text-amber-600">{stats.leadsByDay.reduce((sum, d) => sum + d.count, 0)}</span> khách hàng trong 7 ngày
                    </div>
                </div>

                {/* Top Viewed News */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Eye className="text-slate-400" size={20} />
                            <h3 className="font-semibold text-slate-900">Tin tức xem nhiều nhất</h3>
                        </div>
                        <Link href="/admin/news" className="text-sm text-amber-600 hover:underline">Xem tất cả →</Link>
                    </div>
                    {stats.topViewedNews.length > 0 ? (
                        <div className="space-y-3">
                            {stats.topViewedNews.map((news, index) => (
                                <div key={news.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                        index === 1 ? 'bg-slate-200 text-slate-600' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/admin/news/${news.id}`} className="font-medium text-slate-900 hover:text-amber-600 truncate block">
                                            {news.title}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Eye size={14} />
                                        <span className="text-sm font-medium">{news.views.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Chưa có tin tức</p>
                    )}
                </div>
            </div>

            {/* Recent Data Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Leads */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Khách hàng mới nhất</h3>
                        <Link href="/admin/leads" className="text-sm text-amber-600 hover:underline">Xem tất cả →</Link>
                    </div>
                    {stats.recentLeads.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${leadStatusLabels[lead.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                                            {leadStatusLabels[lead.status]?.label || lead.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">{formatDate(lead.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Chưa có khách hàng</p>
                    )}
                </div>

                {/* Recent Listings */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Tin đăng mới nhất</h3>
                        <Link href="/admin/listings" className="text-sm text-amber-600 hover:underline">Xem tất cả →</Link>
                    </div>
                    {stats.recentListings.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentListings.map((listing) => (
                                <div key={listing.id} className="py-2 border-b border-slate-100 last:border-0">
                                    <Link href={`/admin/listings/${listing.id}`} className="font-medium text-slate-900 hover:text-amber-600 truncate block">
                                        {listing.title}
                                    </Link>
                                    <p className="text-xs text-slate-500">{listingTypeLabels[listing.type]}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Chưa có tin đăng</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Thao tác nhanh</h3>
                <div className="grid gap-3 md:grid-cols-4">
                    <Link href="/admin/projects/new" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors">
                        <Building size={18} />
                        <span>Thêm dự án</span>
                    </Link>
                    <Link href="/admin/listings/new" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors">
                        <Home size={18} />
                        <span>Thêm tin đăng</span>
                    </Link>
                    <Link href="/admin/news/new" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors">
                        <Newspaper size={18} />
                        <span>Viết tin tức</span>
                    </Link>
                    <Link href="/admin/leads" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 transition-colors">
                        <Users size={18} />
                        <span>Xem khách hàng</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
