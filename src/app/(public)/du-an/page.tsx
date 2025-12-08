import prisma from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import AdvancedSearch from '@/components/modules/search/advanced-search'
import ProjectCard from '@/components/modules/project-card'
import PagePagination from '@/components/modules/page-pagination'
import { Building } from 'lucide-react'

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
    status?: string
    location?: string
    priceMin?: string
    priceMax?: string
    areaMin?: string
    areaMax?: string
    page?: string
}

async function getProjects(params: SearchParams) {
    const where: any = {}

    if (params.keyword) {
        where.OR = [
            { name: { contains: params.keyword } },
            { description: { contains: params.keyword } }
        ]
    }

    if (params.type && params.type !== 'all') where.category = params.type
    if (params.status && params.status !== 'all') where.status = params.status
    if (params.location) where.location = { contains: params.location }

    // Note: priceRange is a String field (e.g., "5-10 tỷ"), cannot filter numerically

    const page = parseInt(params.page || '1')
    const perPage = 6

    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                status: true,
                priceRange: true,
                location: true,
                fullLocation: true,
                thumbnailUrl: true,
            },
        }),
        prisma.project.count({ where })
    ])

    return { projects, total, page, perPage }
}

const categoryMap: Record<string, string> = {
    APARTMENT: 'Căn hộ chung cư',
    HOUSE: 'Nhà phố - Biệt thự',
    LAND: 'Đất nền dự án',
    VILLA: 'Biệt thự',
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const resolvedParams = await searchParams
    const [{ projects, total, page, perPage }, locations, settings] = await Promise.all([
        getProjects(resolvedParams),
        getLocations(),
        getSiteSettings(),
    ])
    const totalPages = Math.ceil(total / perPage)

    // Build searchParams object for pagination
    const paginationParams: Record<string, string> = {}
    if (resolvedParams.keyword) paginationParams.keyword = resolvedParams.keyword
    if (resolvedParams.type) paginationParams.type = resolvedParams.type
    if (resolvedParams.status) paginationParams.status = resolvedParams.status
    if (resolvedParams.location) paginationParams.location = resolvedParams.location

    return (
        <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
            {/* Hero Header - Dark with Background Image (Reference Design) */}
            <div className="bg-slate-900 py-20 pb-32 px-4 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url('${settings.bgProjects || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000'}')` }}
                ></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-4">Dự Án Phân Phối</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Khám phá danh mục đầu tư đa dạng và chất lượng cao
                    </p>
                </div>
            </div>

            {/* AdvancedSearch Compact - Below Hero (Reference Design) */}
            <div className="container mx-auto px-4 -mt-16 relative z-20 mb-12">
                <AdvancedSearch isProjectSearch={true} locations={locations} />
            </div>

            {/* Results Grid - 3 columns (Reference Design) */}
            <div className="container mx-auto px-4 mt-12">
                {projects.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                    status={project.status}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <PagePagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/du-an"
                            searchParams={paginationParams}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <Building size={64} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">Không tìm thấy dự án phù hợp</h3>
                        <a href="/du-an" className="mt-4 inline-block text-amber-600 font-bold hover:underline">
                            Xóa bộ lọc & thử lại
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

