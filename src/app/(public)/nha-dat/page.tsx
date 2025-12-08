import prisma from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import AdvancedSearch from '@/components/modules/search/advanced-search'
import ListingCard from '@/components/modules/listing-card'
import PagePagination from '@/components/modules/page-pagination'
import { Search } from 'lucide-react'

async function getLocations() {
    const locations = await prisma.location.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { name: true },
    })
    return locations.map(l => l.name)
}

interface SearchParams {
    keyword?: string
    type?: string
    priceMin?: string
    priceMax?: string
    areaMin?: string
    areaMax?: string
    beds?: string
    direction?: string
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

    if (params.type && params.type !== 'all') where.type = params.type
    if (params.location) where.location = { contains: params.location }

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

    if (params.beds && params.beds !== 'all') {
        const bedsNum = params.beds === '4+' ? 4 : parseInt(params.beds)
        where.bedrooms = params.beds === '4+' ? { gte: bedsNum } : bedsNum
    }

    if (params.direction && params.direction !== 'all') {
        where.direction = params.direction
    }

    const page = parseInt(params.page || '1')
    const perPage = 8

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

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const resolvedParams = await searchParams
    const [{ listings, total, page, perPage }, locations, settings] = await Promise.all([
        getListings(resolvedParams),
        getLocations(),
        getSiteSettings(),
    ])
    const totalPages = Math.ceil(total / perPage)

    // Build searchParams object for pagination
    const paginationParams: Record<string, string> = {}
    if (resolvedParams.keyword) paginationParams.keyword = resolvedParams.keyword
    if (resolvedParams.type) paginationParams.type = resolvedParams.type
    if (resolvedParams.location) paginationParams.location = resolvedParams.location
    if (resolvedParams.beds) paginationParams.beds = resolvedParams.beds
    if (resolvedParams.direction) paginationParams.direction = resolvedParams.direction

    const getListingTags = (type: string) => {
        const tags: string[] = []
        if (type === 'APARTMENT') tags.push('Căn hộ')
        if (type === 'HOUSE') tags.push('Nhà riêng')
        if (type === 'LAND') tags.push('Đất nền')
        return tags
    }

    return (
        <div className="bg-white min-h-screen pb-20 animate-fade-in">
            {/* Hero Header - Dark with Background Image (Reference Design) */}
            <div className="bg-slate-900 py-20 pb-32 px-4 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url('${settings.bgListings || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000'}')` }}
                ></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-4">Sàn Giao Dịch</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Tìm kiếm cơ hội đầu tư và an cư lý tưởng
                    </p>
                </div>
            </div>

            {/* AdvancedSearch Compact - Below Hero (Reference Design) */}
            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <AdvancedSearch locations={locations} />

                {/* Results Header with Count + Sort */}
                <div className="flex justify-between items-center mt-12 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        Kết quả tìm kiếm
                        <span className="ml-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                            {total}
                        </span>
                    </h2>
                    <div className="flex items-center text-sm text-slate-500">
                        <span className="mr-2">Sắp xếp:</span>
                        <select className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer">
                            <option>Mới nhất</option>
                            <option>Giá tăng dần</option>
                            <option>Giá giảm dần</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid - 4 columns on large screens (Reference Design) */}
                {listings.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                        <PagePagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/nha-dat"
                            searchParams={paginationParams}
                        />
                    </>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-300 mb-4 flex justify-center">
                            <Search size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600">Không tìm thấy kết quả phù hợp</h3>
                        <a href="/nha-dat" className="mt-4 inline-block text-amber-600 font-bold hover:underline">
                            Xóa bộ lọc & thử lại
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

