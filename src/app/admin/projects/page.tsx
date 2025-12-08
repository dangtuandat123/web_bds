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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Quản lý dự án</h1>
                    <p className="text-slate-600 mt-2">
                        Quản lý các dự án bất động sản của bạn
                    </p>
                </div>
                <Button asChild>
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

