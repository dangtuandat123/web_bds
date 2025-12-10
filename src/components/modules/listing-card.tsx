import Link from 'next/link'
import { Home, Compass, MapPin, Bed } from 'lucide-react'
import { formatPrice, formatArea } from '@/lib/utils/format'

interface ListingCardProps {
    id: number
    title: string
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    direction?: string
    location: string
    fullLocation: string
    image: string
    tags?: string[]
    slug?: string
}

export default function ListingCard({
    id, title, price, area, bedrooms, bathrooms, direction, location, fullLocation, image, tags = [], slug
}: ListingCardProps) {
    const href = slug ? `/nha-dat/${slug}` : `/nha-dat/${id}`

    return (
        <Link href={href}>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden flex flex-col h-full group">
                {/* Image Section - EXACT h-56 (smaller than project) */}
                <div className="relative h-56 overflow-hidden">
                    <img src={image}
                        alt={title}
                        
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Area Badge - Bottom Left */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center shadow-sm">
                        <Home size={12} className="mr-1.5" /> {formatArea(area)}
                    </div>

                    {/* Direction Badge - Top Right */}
                    {direction && (
                        <div className="absolute top-3 right-3 bg-white/90 text-slate-800 px-2 py-1 text-[10px] font-bold rounded shadow-sm flex items-center border border-slate-100">
                            <Compass size={12} className="mr-1 text-amber-500" /> {direction}
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Title - EXACT min-h-[3rem] */}
                    <h3 className="text-base font-bold text-slate-800 mb-3 line-clamp-2 hover:text-amber-600 transition-colors min-h-[3rem] leading-snug">
                        {title}
                    </h3>

                    {/* Price & Specs */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-red-600 font-black text-xl">{formatPrice(price)}</span>
                        {bedrooms > 0 && (
                            <div className="flex space-x-2 text-xs text-slate-500 font-medium">
                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <Bed size={12} className="mr-1" /> {bedrooms}
                                </span>
                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <span className="font-bold mr-1">WC</span> {bathrooms}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="text-slate-500 text-xs flex items-center mb-4 flex-grow border-b border-slate-50 pb-4 border-dashed">
                        <MapPin size={14} className="mr-1.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{fullLocation}</span>
                    </div>

                    {/* Tags - EXACT amber colors */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.slice(0, 2).map((tag, idx) => (
                            <span
                                key={idx}
                                className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-1 rounded-md"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    )
}
