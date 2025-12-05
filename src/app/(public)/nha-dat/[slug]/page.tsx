import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ImageGallery from '@/components/modules/detail/image-gallery'
import InfoGrid from '@/components/modules/detail/info-grid'
import ContactForm from '@/components/modules/detail/contact-form'
import AmenityList from '@/components/modules/detail/amenity-list'
import ListingCard from '@/components/modules/listing-card'
import { MapPin, Home, Bed, Maximize2, Compass, TrendingUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatArea } from '@/lib/utils/format'

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params

    const listing = await prisma.listing.findUnique({
        where: { slug },
        select: { title: true, description: true, thumbnailUrl: true, price: true, area: true }
    })

    if (!listing) {
        return { title: 'Tin đăng không tồn tại' }
    }

    return {
        title: `${listing.title} - Happy Land Real Estate`,
        description: `${listing.description} - Giá: ${formatPrice(listing.price)}, Diện tích: ${formatArea(listing.area)}`,
        openGraph: {
            title: listing.title,
            description: listing.description,
            images: [listing.thumbnailUrl],
        },
    }
}

async function getListing(slug: string) {
    const listing = await prisma.listing.findUnique({
        where: { slug },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            amenities: {
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
        },
    })

    if (!listing) {
        notFound()
    }

    return listing
}

async function getRelatedListings(listing: any) {
    const where: any = {
        id: { not: listing.id },
        isActive: true,
    }

    // Prioritize: same project > same type > same location
    if (listing.projectId) {
        where.projectId = listing.projectId
    } else {
        where.type = listing.type
    }

    const related = await prisma.listing.findMany({
        where,
        take: 3,
        orderBy: { createdAt: 'desc' },
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
    })

    return related
}

const typeLabels: Record<string, string> = {
    APARTMENT: 'Căn hộ',
    HOUSE: 'Nhà riêng',
    LAND: 'Đất nền',
    RENT: 'Cho thuê',
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const listing = await getListing(slug)
    const relatedListings = await getRelatedListings(listing)

    // Parse images from JSON
    const images = Array.isArray(listing.images)
        ? listing.images as string[]
        : [listing.thumbnailUrl]

    // Transform amenities
    const amenities = listing.amenities.map((la) => la.amenity)

    // Generate tags
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
                        <a href="/nha-dat" className="hover:text-amber-600 transition-colors">Nhà đất</a>
                        {listing.project && (
                            <>
                                <span className="mx-2">/</span>
                                <a href={`/du-an/${listing.project.slug}`} className="hover:text-amber-600 transition-colors">
                                    {listing.project.name}
                                </a>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-slate-800 font-medium truncate max-w-xs">{listing.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold uppercase tracking-wider">
                            {typeLabels[listing.type]}
                        </span>
                        {listing.isFeatured && (
                            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold uppercase tracking-wider">
                                Nổi bật
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight">
                        {listing.title}
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center text-slate-600 text-lg">
                            <MapPin size={20} className="text-amber-500 mr-2 flex-shrink-0" />
                            <span>{listing.fullLocation || listing.location}</span>
                        </div>
                        <div className="text-3xl font-black text-red-600">
                            {formatPrice(listing.price)}
                        </div>
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <ImageGallery images={images} title={listing.title} />

                        {/* Info Grid - Specs */}
                        <InfoGrid
                            items={[
                                {
                                    label: 'Diện tích',
                                    value: formatArea(listing.area),
                                    icon: <Maximize2 size={14} />,
                                },
                                {
                                    label: 'Phòng ngủ',
                                    value: listing.bedrooms > 0 ? `${listing.bedrooms} PN` : 'Liên hệ',
                                    icon: <Bed size={14} />,
                                },
                                {
                                    label: 'Phòng tắm',
                                    value: listing.bathrooms > 0 ? `${listing.bathrooms} WC` : 'Liên hệ',
                                    icon: <Home size={14} />,
                                },
                                {
                                    label: 'Hướng nhà',
                                    value: listing.direction || 'Chưa xác định',
                                    icon: <Compass size={14} />,
                                },
                                {
                                    label: 'Loại hình',
                                    value: typeLabels[listing.type],
                                    icon: <TrendingUp size={14} />,
                                },
                                ...(listing.project
                                    ? [{
                                        label: 'Dự án',
                                        value: listing.project.name,
                                        icon: <Home size={14} />,
                                    }]
                                    : []
                                ),
                            ]}
                        />

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>
                                Thông tin chi tiết
                            </h3>
                            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                                <p className="text-lg font-medium text-slate-700 mb-4">
                                    {listing.description}
                                </p>
                                {listing.content && (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: listing.content }}
                                        className="mt-4"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <>
                                <Separator />
                                <AmenityList amenities={amenities} title="Tiện ích & Đặc điểm" />
                            </>
                        )}

                        {/* Related Listings */}
                        {relatedListings.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                        <span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>
                                        Tin đăng tương tự
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {relatedListings.map((related) => (
                                            <ListingCard
                                                key={related.id}
                                                id={related.id}
                                                title={related.title}
                                                price={related.price}
                                                area={related.area}
                                                bedrooms={related.bedrooms}
                                                bathrooms={related.bathrooms}
                                                direction={related.direction || undefined}
                                                location={related.location}
                                                fullLocation={related.fullLocation || ''}
                                                image={related.thumbnailUrl}
                                                tags={getListingTags(related.type)}
                                                slug={related.slug}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="lg:col-span-1">
                        <ContactForm title={listing.title} price={formatPrice(listing.price)} />
                    </div>
                </div>
            </div>
        </div>
    )
}
