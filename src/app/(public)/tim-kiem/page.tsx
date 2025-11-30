import prisma from '@/lib/prisma'
import ProjectCard from '@/components/modules/project-card'
import ListingCard from '@/components/modules/listing-card'
import { Search as SearchIcon } from 'lucide-react'

interface SearchParams {
    keyword?: string
}

async function searchAll(keyword: string) {
    const [listings, projects] = await Promise.all([
        prisma.listing.findMany({
            where: {
                isActive: true,
                OR: [
                    { title: { contains: keyword } },
                    { description: { contains: keyword } }
                ]
            },
            take: 8,
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
        prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: keyword } },
                    { description: { contains: keyword } }
                ]
            },
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                priceRange: true,
                location: true,
                fullLocation: true,
                thumbnailUrl: true,
            },
        })
    ])

    return { listings, projects }
}

const categoryMap: Record<string, string> = {
    APARTMENT: 'Căn hộ chung cư',
    HOUSE: 'Nhà phố - Biệt thự',
    LAND: 'Đất nền dự án',
    VILLA: 'Biệt thự',
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
    const keyword = searchParams.keyword || ''
    const { listings, projects } = keyword ? await searchAll(keyword) : { listings: [], projects: [] }

    const getListingTags = (type: string) => {
        const tags: string[] = []
        if (type === 'APARTMENT') tags.push('Căn hộ')
        if (type === 'HOUSE') tags.push('Nhà riêng')
        if (type === 'LAND') tags.push('Đất nền')
        return tags
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - GRADIENT BACKGROUND like Hero */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Tìm Kiếm
                    </h1>
                    {keyword ? (
                        <p className="text-xl text-amber-50">
                            Kết quả cho: <span className="font-bold">"{keyword}"</span>
                        </p>
                    ) : (
                        <p className="text-lg text-amber-50">
                            Nhập từ khóa vào thanh tìm kiếm để bắt đầu
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content - EXACT SPACING from Homepage */}
            <div className="container mx-auto px-4 py-12">
                {!keyword ? (
                    <div className="text-center py-20">
                        <SearchIcon size={64} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            Nhập từ khóa để tìm kiếm
                        </h3>
                        <p className="text-slate-500">
                            Sử dụng thanh tìm kiếm ở header để bắt đầu
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Listings Results */}
                        {listings.length > 0 && (
                            <section className="mb-12">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                                        Bất Động Sản
                                        <span className="ml-2 text-lg font-semibold text-amber-600">({listings.length})</span>
                                    </h2>
                                    <a
                                        href={`/nha-dat?keyword=${keyword}`}
                                        className="text-amber-600 font-bold hover:text-amber-700 transition-colors flex items-center gap-1"
                                    >
                                        Xem tất cả →
                                    </a>
                                </div>
                                {/* Grid matches Homepage: gap-8 */}
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
                            </section>
                        )}

                        {/* Projects Results */}
                        {projects.length > 0 && (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                                        Dự Án
                                        <span className="ml-2 text-lg font-semibold text-amber-600">({projects.length})</span>
                                    </h2>
                                    <a
                                        href={`/du-an?keyword=${keyword}`}
                                        className="text-amber-600 font-bold hover:text-amber-700 transition-colors flex items-center gap-1"
                                    >
                                        Xem tất cả →
                                    </a>
                                </div>
                                {/* Grid matches Homepage: gap-8 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {projects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            id={project.id}
                                            title={project.name}
                                            category={categoryMap[project.category] || project.category}
                                            categoryId={project.category.toLowerCase()}
                                            price={project.priceRange}
                                            location={project.location}
                                            fullLocation={project.fullLocation || ''}
                                            image={project.thumbnailUrl}
                                            slug={project.slug}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* No Results */}
                        {listings.length === 0 && projects.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <SearchIcon size={64} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    Không tìm thấy kết quả cho "{keyword}"
                                </h3>
                                <p className="text-slate-500">
                                    Hãy thử tìm kiếm với từ khóa khác
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
