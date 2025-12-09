import { Building, Home, Users, Newspaper, TrendingUp, Clock, Eye, MessageSquare, BarChart3, PieChart } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import Link from 'next/link'

async function getStats() {
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
    ] = await Promise.all([
        prisma.project.count(),
        prisma.listing.count(),
        prisma.lead.count(),
        prisma.news.count(),
        prisma.chatsession.count(),
        // Listing types
        prisma.listing.count({ where: { type: 'APARTMENT' } }),
        prisma.listing.count({ where: { type: 'HOUSE' } }),
        prisma.listing.count({ where: { type: 'LAND' } }),
        prisma.listing.count({ where: { type: 'RENT' } }),
        // Lead status
        prisma.lead.count({ where: { status: 'NEW' } }),
        prisma.lead.count({ where: { status: 'CONTACTED' } }),
        // Featured
        prisma.project.count({ where: { isFeatured: true } }),
        prisma.listing.count({ where: { isFeatured: true } }),
        // Recent leads (last 5)
        prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, phone: true, source: true, status: true, createdAt: true }
        }),
        // Recent listings (last 5)
        prisma.listing.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, type: true, price: true, slug: true }
        }),
        // Project status
        prisma.project.count({ where: { status: 'SELLING' } }),
        prisma.project.count({ where: { status: 'UPCOMING' } }),
        prisma.project.count({ where: { status: 'SOLD_OUT' } }),
    ])

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
        projectsByStatus: { selling: sellingProjects, upcoming: upcomingProjects, soldOut: soldOutProjects }
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

export default async function AdminDashboard() {
    const session = await getSession()
    const stats = await getStats()

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
                    <p className="text-slate-600 mt-2">
                        Xin chào, <span className="font-semibold">{session?.email}</span>
                    </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    <Clock size={14} className="inline mr-1" />
                    Cập nhật: {formatDate(new Date())}
                </div>
            </div>

            {/* Main Stats Cards - 5 columns */}
            <div className="grid gap-4 md:grid-cols-5">
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
