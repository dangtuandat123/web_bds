'use client'

import Image from 'next/image'

export interface ChatProperty {
    title: string
    price: string
    area?: string
    location?: string
    url: string
    thumbnailUrl?: string
    type?: string
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

    // Generate a placeholder image based on property type
    const placeholderImage = property.type === 'Dự án'
        ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop'
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=200&fit=crop'

    return (
        <a
            href={href}
            className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
            target="_blank"
            rel="noopener noreferrer"
        >
            {/* Thumbnail */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-amber-50">
                <Image
                    src={property.thumbnailUrl || placeholderImage}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
                {property.type && (
                    <span className="absolute bottom-1 left-1 rounded bg-amber-500 text-white text-[9px] font-bold px-1 py-0.5 shadow">
                        {property.type}
                    </span>
                )}
            </div>

            {/* Content - NO line clamp, show all info */}
            <div className="flex-1 min-w-0 flex flex-col justify-start gap-1">
                <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-amber-700 transition-colors">
                    {property.title}
                </h4>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-amber-600 font-bold">{property.price}</span>
                    {property.area && (
                        <span className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {property.area}
                        </span>
                    )}
                </div>

                {property.location && (
                    <p className="text-xs text-slate-500">
                        📍 {property.location}
                    </p>
                )}
            </div>

            {/* Arrow indicator */}
            <div className="flex items-center text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </a>
    )
}
