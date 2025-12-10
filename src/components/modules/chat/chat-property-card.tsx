'use client'

import { MapPin, Ruler, BedDouble, Bath, Home } from 'lucide-react'

export interface ChatProperty {
    title: string
    price: string | number
    area?: number | string
    location?: string
    url: string
    thumbnailUrl?: string
    type?: string
    bedrooms?: number
    bathrooms?: number
}

interface ChatPropertyCardProps {
    property: ChatProperty
}

export default function ChatPropertyCard({ property }: ChatPropertyCardProps) {
    const normalizeHref = (value: string) => {
        if (!value) return '/'
        try {
            const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
            const url = new URL(value, base)
            if (value.startsWith('http') && url.origin === base) {
                return url.pathname + url.search + url.hash
            }
            if (!value.startsWith('http')) return value.startsWith('/') ? value : `/${value}`
            return url.href
        } catch {
            const stripped = value.replace(/^https?:\/\/[^/]+/i, '')
            return stripped.startsWith('/') ? stripped : `/${stripped}`
        }
    }

    const href = normalizeHref(property.url || '/')

    // Format price
    const formatPrice = (price: string | number) => {
        if (typeof price === 'number') {
            if (price >= 1000000000) {
                return `${(price / 1000000000).toFixed(1)} tỷ`
            } else if (price >= 1000000) {
                return `${(price / 1000000).toFixed(0)} triệu`
            }
            return price.toLocaleString('vi-VN') + ' VNĐ'
        }
        return price
    }

    // Generate a placeholder image based on property type
    const placeholderImage = property.type === 'Dự án'
        ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'

    const typeColor = property.type === 'Dự án'
        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
        : 'bg-gradient-to-r from-amber-500 to-orange-500'

    return (
        <a
            href={href}
            className="block w-full rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            target="_blank"
            rel="noopener noreferrer"
        >
            {/* Image - Full width */}
            <div className="relative w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200">
                <img src={property.thumbnailUrl || placeholderImage}
                    alt={property.title}
                    
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 400px) 100vw, 350px"
                />
                {/* Type Badge */}
                {property.type && (
                    <span className={`absolute top-2 left-2 ${typeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>
                        {property.type}
                    </span>
                )}
                {/* Price Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                        {formatPrice(property.price)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <h4 className="font-bold text-slate-800 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">
                    {property.title}
                </h4>

                {/* Property Details */}
                <div className="flex flex-wrap gap-2 text-xs">
                    {property.area && (
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            <Ruler size={12} />
                            {typeof property.area === 'number' ? `${property.area} m²` : property.area}
                        </span>
                    )}
                    {property.bedrooms !== undefined && property.bedrooms > 0 && (
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            <BedDouble size={12} />
                            {property.bedrooms} PN
                        </span>
                    )}
                    {property.bathrooms !== undefined && property.bathrooms > 0 && (
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            <Bath size={12} />
                            {property.bathrooms} WC
                        </span>
                    )}
                </div>

                {/* Location */}
                {property.location && (
                    <p className="flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{property.location}</span>
                    </p>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Xem chi tiết</span>
                    <div className="flex items-center text-amber-500 group-hover:translate-x-1 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    )
}
