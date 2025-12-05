import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ListingForm from '@/components/admin/listings/listing-form'

async function getListing(id: number) {
    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            amenities: {
                select: {
                    amenityId: true,
                },
            },
        },
    })

    if (!listing) {
        notFound()
    }

    return listing
}

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

export default async function EditListingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    const [listing, { amenities, projects }] = await Promise.all([
        getListing(id),
        getFormData(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa listing</h1>
                <p className="text-slate-600 mt-2">
                    Cập nhật thông tin: {listing.title}
                </p>
            </div>

            <ListingForm
                initialData={listing}
                amenities={amenities}
                projects={projects}
            />
        </div>
    )
}
