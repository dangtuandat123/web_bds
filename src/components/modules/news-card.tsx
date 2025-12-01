import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye } from 'lucide-react'

interface NewsCardProps {
    id: number
    title: string
    category: string
    categoryLabel: string
    summary: string
    image: string
    slug: string
    date: Date
    views: number
}

export default function NewsCard({
    title,
    category,
    categoryLabel,
    summary,
    image,
    slug,
    date,
    views,
}: NewsCardProps) {
    const href = `/tin-tuc/${slug}`

    return (
        <Link href={href}>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100 h-full flex flex-col transform hover:-translate-y-2">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {/* Category Badge - Top Left */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                            {categoryLabel}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
                        {summary}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                                {new Intl.DateTimeFormat('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                }).format(new Date(date))}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{views} lượt xem</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
