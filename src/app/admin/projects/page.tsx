import { Plus } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import ProjectsWithSearch from '@/components/admin/projects/projects-with-search'

async function getProjects() {
    const projects = await prisma.project.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    })
    return projects
}

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý dự án</h1>
                    <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">
                        Quản lý các dự án bất động sản của bạn
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 w-full sm:w-auto">
                    <Link href="/admin/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm dự án
                    </Link>
                </Button>
            </div>

            {/* Projects Table with Search */}
            <ProjectsWithSearch projects={projects} />
        </div>
    )
}

