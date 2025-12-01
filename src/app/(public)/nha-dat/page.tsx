import prisma from '@/lib/prisma'
import AdvancedSearch from '@/components/modules/search/advanced-search'
import ListingCard from '@/components/modules/listing-card'
import { Search } from 'lucide-react'

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
        return tags
    }

    return (
        <div className="bg-white min-h-screen pb-20 animate-fade-in">
            {/* Hero Header - Dark with Background Image (Reference Design) */}
            <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-4">Sàn Giao Dịch</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Tìm kiếm cơ hội đầu tư và an cư lý tưởng
                    </p>
                </div>
            </div>

            {/* AdvancedSearch Compact - Below Hero (Reference Design) */}
            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <AdvancedSearch />

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
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-3 items-center mt-12">
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
