import prisma from '@/lib/prisma'
import FilterSidebar from '@/components/modules/search/filter-sidebar'
import ListingCard from '@/components/modules/listing-card'
import { Suspense } from 'react'
import { Home } from 'lucide-react'

interface SearchParams {
    keyword?: string
    type?: string
    priceMin?: string
    priceMax?: string
    areaMin?: string
    areaMax?: string
    beds?: string
    baths?: string
    location?: string
    page?: string
}

async function getListings(params: SearchParams) {
    const where: any = { isActive: true }

    if (params.keyword) {
        where.OR = [
            { title: { contains: params.keyword } },
            { description: { contains: params.keyword } }
        ]
    }

    if (params.type) where.type = params.type

    if (params.priceMin || params.priceMax) {
        where.price = {}
        if (params.priceMin) where.price.gte = parseFloat(params.priceMin)
        if (params.priceMax) where.price.lte = parseFloat(params.priceMax)
    }

    if (params.areaMin || params.areaMax) {
        where.area = {}
        if (params.areaMin) where.area.gte = parseFloat(params.areaMin)
        if (params.areaMax) where.area.lte = parseFloat(params.areaMax)
    }

    if (params.beds) where.bedrooms = parseInt(params.beds)
    if (params.baths) where.bathrooms = parseInt(params.baths)
    if (params.location) where.location = { contains: params.location }

    const page = parseInt(params.page || '1')
    const perPage = 12

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where,
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                direction: true,
                location: true,
                fullLocation: true,
                thumbnailUrl: true,
                type: true,
            },
        }),
        prisma.listing.count({ where })
    ])

    return { listings, total, page, perPage }
}

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
    const { listings, total, page, perPage } = await getListings(searchParams)
    const totalPages = Math.ceil(total / perPage)

    const getListingTags = (type: string) => {
        const tags: string[] = []
        if (type === 'APARTMENT') tags.push('Căn hộ')
        if (type === 'HOUSE') tags.push('Nhà riêng')
        if (type === 'LAND') tags.push('Đất nền')
        if (type === 'RENT') tags.push('Cho thuê')
        return tags
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - GRADIENT TEXT like Homepage */}
            <div className="bg-white border-b border-slate-100 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black mb-3">
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                            Sàn Giao Dịch
                        </span>
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Tìm thấy <span className="font-bold text-amber-600">{total}</span> bất động sản phù hợp
                    </p>
                </div>
            </div>

            {/* Main Content - EXACT SPACING from Homepage */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Sidebar - Sticky */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Suspense fallback={<div className="bg-white p-6 rounded-2xl shadow-lg h-96 animate-pulse"></div>}>
                                <FilterSidebar type="listing" />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Results - EXACT GRID from Homepage */}
                    <div className="lg:col-span-3">
                        {listings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <Home size={64} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    Không tìm thấy kết quả phù hợp
                                </h3>
                                <p className="text-slate-500">
                                    Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Grid matches Homepage: gap-8 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                    {listings.map((listing) => (
                                        <ListingCard
                                            key={listing.id}
                                            id={listing.id}
                                            title={listing.title}
                                            price={listing.price}
                                            area={listing.area}
                                            bedrooms={listing.bedrooms}
                                            bathrooms={listing.bathrooms}
                                            direction={listing.direction || undefined}
                                            location={listing.location}
                                            fullLocation={listing.fullLocation || ''}
                                            image={listing.thumbnailUrl}
                                            tags={getListingTags(listing.type)}
                                            slug={listing.slug}
                                        />
                                    ))}
                                </div>

                                {/* Pagination - AMBER/SLATE style */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-3 items-center">
                                        {page > 1 && (
                                            <a
                                                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                                                className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all font-semibold text-slate-700 hover:text-amber-700 shadow-sm"
                                            >
                                                ← Trang trước
                                            </a>
                                        )}
                                        <span className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg">
                                            {page} / {totalPages}
                                        </span>
                                        {page < totalPages && (
                                            <a
                                                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                                                className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all font-semibold text-slate-700 hover:text-amber-700 shadow-sm"
                                            >
                                                Trang sau →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
