import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProjectForm from '@/components/admin/projects/project-form'

async function getProject(id: number) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            projectamenity: {
                select: {
                    amenityId: true,
                },
            },
        },
    })

    if (!project) {
        notFound()
    }

    return project
}

async function getAmenities() {
    const amenities = await prisma.amenity.findMany({
        select: {
            id: true,
            name: true,
            icon: true,
        },
    })
    return amenities
}

async function getLocations() {
    const locations = await prisma.location.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { name: true },
    })
    return locations.map(l => l.name)
}

export default async function EditProjectPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    const [project, amenities, locations] = await Promise.all([
        getProject(id),
        getAmenities(),
        getLocations(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa dự án</h1>
                <p className="text-slate-600 mt-2">
                    Cập nhật thông tin dự án: {project.name}
                </p>
            </div>

            <ProjectForm initialData={project} amenities={amenities} locations={locations} />
        </div>
    )
}
