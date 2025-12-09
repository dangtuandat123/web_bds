import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ImageGallery from '@/components/modules/detail/image-gallery'
import InfoGrid from '@/components/modules/detail/info-grid'
import ContactForm from '@/components/modules/detail/contact-form'
import AmenityList from '@/components/modules/detail/amenity-list'
import ListingCard from '@/components/modules/listing-card'
import { MapPin, Building2, TrendingUp, Home } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    const project = await prisma.project.findUnique({
        where: { slug },
        select: { name: true, description: true, thumbnailUrl: true }
    })

    if (!project) {
        return { title: 'Dự án không tồn tại' }
    }

    return {
        title: `${project.name} - Happy Land Real Estate`,
        description: project.description,
        openGraph: {
            title: project.name,
            description: project.description,
            images: [project.thumbnailUrl],
        },
    }
}

async function getProject(slug: string) {
    const project = await prisma.project.findUnique({
        where: { slug },
        include: {
            projectamenity: {
                include: {
                    amenity: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                        },
                    },
                },
            },
            listing: {
                where: { isActive: true },
                take: 6,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    area: true,
                    bedrooms: true,
                    bathrooms: true,
                    direction: true,
                    location: true,
                    fullLocation: true,
                    thumbnailUrl: true,
                    type: true,
                },
            },
        },
    })

    if (!project) {
        notFound()
    }

    return project
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const project = await getProject(slug)

    // Parse images from JSON string
    let images: string[] = []
    try {
        if (typeof project.images === 'string') {
            images = JSON.parse(project.images)
        } else if (Array.isArray(project.images)) {
            images = project.images as string[]
        }
    } catch {
        images = []
    }

    // Fallback to thumbnailUrl if no images
    if (images.length === 0 && project.thumbnailUrl) {
        images = [project.thumbnailUrl]
    }

    // Transform amenities
    const amenities = project.projectamenity.map((pa) => pa.amenity)

    // Generate tags for listings
    const getListingTags = (type: string) => {
        const tags: string[] = []
        if (type === 'APARTMENT') tags.push('Căn hộ')
        if (type === 'HOUSE') tags.push('Nhà riêng')
        if (type === 'LAND') tags.push('Đất nền')
        if (type === 'RENT') tags.push('Cho thuê')
        return tags
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-slate-500">
                        <a href="/" className="hover:text-amber-600 transition-colors">Trang chủ</a>
                        <span className="mx-2">/</span>
                        <a href="/du-an" className="hover:text-amber-600 transition-colors">Dự án</a>
                        <span className="mx-2">/</span>
                        <span className="text-slate-800 font-medium">{project.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                        {project.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 leading-tight">
                        {project.name}
                    </h1>
                    <div className="flex items-center text-slate-600 text-lg">
                        <MapPin size={20} className="text-amber-500 mr-2" />
                        {project.fullLocation || project.location}
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <ImageGallery images={images} title={project.name} />

                        {/* Info Grid */}
                        <InfoGrid
                            items={[
                                {
                                    label: 'Phân loại',
                                    value: project.category,
                                    icon: <Building2 size={14} />,
                                },
                                {
                                    label: 'Giá tham khảo',
                                    value: project.priceRange,
                                    icon: <TrendingUp size={14} />,
                                },
                                {
                                    label: 'Trạng thái',
                                    value: project.status === 'SELLING' ? 'Đang mở bán' : 'Sắp mở bán',
                                    icon: <Home size={14} />,
                                },
                            ]}
                        />

                        <Separator />

                        {/* Amenities - Move above description */}
                        {amenities.length > 0 && (
                            <>
                                <AmenityList amenities={amenities} title="Tiện ích dự án" />
                                <Separator />
                            </>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>
                                Tổng quan dự án
                            </h3>
                            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                                <p className="text-lg font-medium text-slate-700 mb-4">
                                    {project.description}
                                </p>
                                {project.content && (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: project.content }}
                                        className="mt-4"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Listings in Project */}
                        {project.listing.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>
                                        Sản phẩm trong dự án
                                        <span className="ml-3 bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full">
                                            {project.listing.length}
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.listing.map((listing) => (
                                            <ListingCard
                                                key={listing.id}
                                                id={listing.id}
                                                title={listing.title}
                                                price={listing.price}
                                                area={listing.area}
                                                bedrooms={listing.bedrooms}
                                                bathrooms={listing.bathrooms}
                                                direction={listing.direction || undefined}
                                                location={listing.location}
                                                fullLocation={listing.fullLocation || ''}
                                                image={listing.thumbnailUrl}
                                                tags={getListingTags(listing.type)}
                                                slug={listing.slug}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="lg:col-span-1">
                        <ContactForm title={project.name} price={project.priceRange} referenceUrl={`/du-an/${project.slug}`} />
                    </div>
                </div>
            </div>
        </div>
    )
}
