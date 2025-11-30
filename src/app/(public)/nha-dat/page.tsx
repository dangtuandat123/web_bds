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

    // Keyword search
    if (params.keyword) {
        where.OR = [
            { title: { contains: params.keyword } },
            { description: { contains: params.keyword } }
        ]
    }

    // Type filter
    if (params.type) {
        where.type = params.type
    }

    // Price range
    if (params.priceMin || params.priceMax) {
        where.price = {}
        if (params.priceMin) where.price.gte = parseFloat(params.priceMin)
        if (params.priceMax) where.price.lte = parseFloat(params.priceMax)
    }

    // Area range
    if (params.areaMin || params.areaMax) {
        where.area = {}
        if (params.areaMin) where.area.gte = parseFloat(params.areaMin)
        if (params.areaMax) where.area.lte = parseFloat(params.areaMax)
    }

    // Bedrooms
    if (params.beds) {
        where.bedrooms = parseInt(params.beds)
    }

    // Bathrooms
    if (params.baths) {
        where.bathrooms = parseInt(params.baths)
    }

    // Location
    if (params.location) {
        where.location = { contains: params.location }
    }

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
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                        Sàn Giao Dịch
                    </h1>
                    <p className="text-slate-600">
                        Tìm thấy <span className="font-bold text-amber-600">{total}</span> bất động sản
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                            <Suspense fallback={<div>Loading filters...</div>}>
                                <FilterSidebar type="listing" />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {listings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2">
                                        {page > 1 && (
                                            <a
                                                href={`?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() })}`}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                ← Trang trước
                                            </a>
                                        )}
                                        <span className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold">
                                            {page} / {totalPages}
                                        </span>
                                        {page < totalPages && (
                                            <a
                                                href={`?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() })}`}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
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
