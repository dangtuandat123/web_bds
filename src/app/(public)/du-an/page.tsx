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

    // Keyword search
    if (params.keyword) {
        where.OR = [
            { name: { contains: params.keyword } },
            { description: { contains: params.keyword } }
        ]
    }

    // Status filter
    if (params.status) {
        where.status = params.status
    }

    // Location
    if (params.location) {
        where.location = { contains: params.location }
    }

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
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                        Dự Án
                    </h1>
                    <p className="text-slate-600">
                        Tìm thấy <span className="font-bold text-amber-600">{total}</span> dự án
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                            <Suspense fallback={<div>Loading filters...</div>}>
                                <FilterSidebar type="project" />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
