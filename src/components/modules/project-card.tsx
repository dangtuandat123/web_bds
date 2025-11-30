import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowRight, Heart } from 'lucide-react'

interface ProjectCardProps {
    id: number
    title: string
    category: string
    categoryId: string
    price: string
    location: string
    fullLocation: string
    image: string
    slug?: string
}

export default function ProjectCard({
    id, title, category, categoryId, price, location, fullLocation, image, slug
}: ProjectCardProps) {
    const href = slug ? `/projects/${slug}` : `/projects/${id}`

    return (
        <Link href={href}>
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100 h-full flex flex-col transform hover:-translate-y-2">
                {/* Image Section - EXACT h-72 */}
                <div className="relative h-72 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {/* Top Left Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                            {categoryId === 'can-ho' ? 'Đang mở bán' : 'Hot'}
                        </span>
                    </div>

                    {/* Heart Button - Top Right */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button className="bg-white p-2 rounded-full shadow-lg hover:text-red-500">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow relative">
                    {/* Category Badge - EXACT -mt-10 overlap */}
                    <div className="-mt-10 mb-4 relative z-10">
                        <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wide border-2 border-white">
                            {category}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start text-slate-500 text-sm mb-6 flex-grow">
                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                        <span className="line-clamp-2 text-slate-600">{fullLocation}</span>
                    </div>

                    {/* Price & Arrow */}
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Giá tham khảo
                            </span>
                            <span className="text-red-600 font-black text-lg">{price}</span>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
