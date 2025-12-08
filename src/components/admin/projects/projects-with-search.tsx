'use client'

import { useState, useMemo } from 'react'
import { project } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import AdminPagination from '@/components/admin/admin-pagination'
import ProjectTable from '@/components/admin/projects/project-table'

const ITEMS_PER_PAGE = 10

interface ProjectsWithSearchProps {
    projects: project[]
}

export default function ProjectsWithSearch({ projects }: ProjectsWithSearchProps) {
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredProjects = useMemo(() => {
        if (!search.trim()) return projects
        const query = search.toLowerCase()
        return projects.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.location.toLowerCase().includes(query) ||
            (p.priceRange && p.priceRange.toLowerCase().includes(query))
        )
    }, [projects, search])

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    // Pagination
    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
    const paginatedProjects = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredProjects.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredProjects, currentPage])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={handleSearch}
                    placeholder="Tìm theo tên, vị trí..."
                />
                <span className="text-sm text-slate-500">
                    {filteredProjects.length} / {projects.length} dự án
                </span>
            </div>
            <ProjectTable projects={paginatedProjects} />
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
