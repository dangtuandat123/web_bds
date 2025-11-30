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

export default async function NewProjectPage() {
    const amenities = await getAmenities()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Thêm dự án mới</h1>
                <p className="text-slate-600 mt-2">
                    Tạo một dự án bất động sản mới
                </p>
            </div>

            <ProjectForm amenities={amenities} />
        </div>
    )
}
