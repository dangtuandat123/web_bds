import prisma from '@/lib/prisma'
import ListingForm from '@/components/admin/listings/listing-form'

async function getFormData() {
    const [amenities, projects] = await Promise.all([
        prisma.amenity.findMany({
            select: {
                id: true,
                name: true,
                icon: true,
            },
        }),
        prisma.project.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        }),
    ])

    return { amenities, projects }
}

export default async function NewListingPage() {
    const { amenities, projects } = await getFormData()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Thêm listing mới</h1>
                <p className="text-slate-600 mt-2">
                    Tạo một listing bất động sản mới
                </p>
            </div>

            <ListingForm amenities={amenities} projects={projects} />
        </div>
    )
}
