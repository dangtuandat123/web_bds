'use client'

import { useState, useMemo } from 'react'
import { project } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import ProjectTable from '@/components/admin/projects/project-table'

interface ProjectsWithSearchProps {
    projects: project[]
}

export default function ProjectsWithSearch({ projects }: ProjectsWithSearchProps) {
    const [search, setSearch] = useState('')

    const filteredProjects = useMemo(() => {
        if (!search.trim()) return projects
        const query = search.toLowerCase()
        return projects.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.location.toLowerCase().includes(query) ||
            (p.priceRange && p.priceRange.toLowerCase().includes(query))
        )
    }, [projects, search])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Tìm theo tên, vị trí..."
                />
                <span className="text-sm text-slate-500">
                    {filteredProjects.length} / {projects.length} dự án
                </span>
            </div>
            <ProjectTable projects={filteredProjects} />
        </div>
    )
}
