import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@prisma/client'
import { Bed, Bath, Maximize, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatArea } from '@/lib/utils/format'

interface ListingCardProps {
    listing: Listing
}

const typeLabels = {
    APARTMENT: 'Căn hộ',
    HOUSE: 'Nhà riêng',
    LAND: 'Đất nền',
    RENT: 'Cho thuê',
}

export default function ListingCard({ listing }: ListingCardProps) {
    return (
        <Link
            href={`/listing/${listing.slug}`}
            className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        >
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={listing.thumbnailUrl}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className="bg-white/90 text-slate-900">
                        {typeLabels[listing.type]}
                    </Badge>
                    {listing.isFeatured && (
                        <Badge className="bg-amber-500 text-white border-0">
                            <Star className="h-3 w-3 mr-1" />
                            Nổi bật
                        </Badge>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 flex-1">
                        {listing.title}
                    </h3>
                </div>

                <p className="text-2xl font-bold text-amber-600">
                    {formatPrice(listing.price)}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" />
                        <span>{formatArea(listing.area)}</span>
                    </div>
                    {listing.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{listing.bedrooms} PN</span>
                        </div>
                    )}
                    {listing.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{listing.bathrooms} WC</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-slate-500 text-sm pt-2 border-t border-slate-100">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{listing.location}</span>
                </div>
            </div>
        </Link>
    )
}
