import prisma from '@/lib/prisma'
import ProjectForm from '@/components/admin/projects/project-form'

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

export default async function NewProjectPage() {
    const [amenities, locations] = await Promise.all([
        getAmenities(),
        getLocations(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Thêm dự án mới</h1>
                <p className="text-slate-600 mt-2">
                    Tạo một dự án bất động sản mới
                </p>
            </div>

            <ProjectForm amenities={amenities} locations={locations} />
        </div>
    )
}

