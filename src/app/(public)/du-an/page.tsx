import prisma from '@/lib/prisma'
import AdvancedSearch from '@/components/modules/search/advanced-search'
import ProjectCard from '@/components/modules/project-card'
import { Suspense } from 'react'
import { Building } from 'lucide-react'

interface SearchParams {
    keyword?: string
    status?: string
    location?: string
    type?: string
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

    if (params.status) where.status = params.status
    if (params.type) where.category = params.type
    if (params.location) where.location = { contains: params.location }

    if (params.priceMin || params.priceMax) {
        where.priceRange = {}
        if (params.priceMin) where.priceRange.gte = parseFloat(params.priceMin)
        if (params.priceMax) where.priceRange.lte = parseFloat(params.priceMax)
    }

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

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
    const { projects, total, page, perPage } = await getProjects(searchParams)
    const totalPages = Math.ceil(total / perPage)

    return (
        <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
            {/* Dark Hero Header - EXACT match reference */}
            <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-4">Dự Án Phân Phối</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Khám phá danh mục đầu tư đa dạng và chất lượng cao
                    </p>
                </div>
            </div>

            {/* Compact AdvancedSearch - EXACT -mt-8 from reference */}
            <div className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
                <Suspense fallback={<div className="bg-white/90 p-8 rounded-2xl shadow-2xl h-48 animate-pulse"></div>}>
                    <AdvancedSearch isProjectSearch={true} />
                </Suspense>
            </div>

            {/* Results Grid - 3 columns like reference */}
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
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-600">Không tìm thấy dự án phù hợp</h3>
                        <a href="/du-an" className="mt-4 text-amber-600 font-bold hover:underline inline-block">
                            Xóa bộ lọc & thử lại
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

                                </div >

    {/* Pagination - AMBER/SLATE style */ }
{
    totalPages > 1 && (
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
    )
}
                            </>
                        )}
                    </div >
                </div >
            </div >
        </div >
    )
}
