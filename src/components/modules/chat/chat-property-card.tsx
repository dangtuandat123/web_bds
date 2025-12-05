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
    const isExternal = href.startsWith('http')

    return (
        <a
            href={href}
            className="snap-start w-64 flex-shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all"
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
        >
            <div className="relative h-36 bg-slate-100">
                {property.thumbnailUrl ? (
                    <Image
                        src={property.thumbnailUrl}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="256px"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                        Không có ảnh
                    </div>
                )}
                {property.type && (
                    <span className="absolute top-2 left-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1">
                        {property.type}
                    </span>
                )}
            </div>
            <div className="p-3 space-y-2">
                <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                    {property.title}
                </h4>
                <div className="text-red-600 font-bold text-base">{property.price}</div>
                {property.area && (
                    <p className="text-xs text-slate-500">
                        Diện tích: <span className="font-semibold text-slate-700">{property.area}</span>
                    </p>
                )}
                {property.location && (
                    <p className="text-xs text-slate-500 line-clamp-1">{property.location}</p>
                )}
            </div>
        </a>
    )
}
