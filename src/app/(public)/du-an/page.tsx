import prisma from '@/lib/prisma'
import FilterSidebar from '@/components/modules/search/filter-sidebar'
import ProjectCard from '@/components/modules/project-card'
import { Suspense } from 'react'
import { Building } from 'lucide-react'

interface SearchParams {
    keyword?: string
    status?: string
    location?: string
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
    if (params.location) where.location = { contains: params.location }

    const page = parseInt(params.page || '1')
    const perPage = 12

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
        <div className="min-h-screen bg-slate-50">
            {/* Header - GRADIENT TEXT like Homepage */}
            <div className="bg-white border-b border-slate-100 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black mb-3">
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                            Dự Án
                        </span>
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Tìm thấy <span className="font-bold text-amber-600">{total}</span> dự án phù hợp
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
                                <FilterSidebar type="project" />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Results - EXACT GRID from Homepage */}
                    <div className="lg:col-span-3">
                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <Building size={64} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    Không tìm thấy dự án phù hợp
                                </h3>
                                <p className="text-slate-500">
                                    Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Grid matches Homepage: gap-8 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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
