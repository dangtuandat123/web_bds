import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@prisma/client'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProjectCardProps {
    project: Project
}

const statusLabels = {
    UPCOMING: 'Sắp mở bán',
    SELLING: 'Đang bán',
    SOLD_OUT: 'Đã bán hết',
}

const statusStyles = {
    UPCOMING: 'bg-blue-500',
    SELLING: 'bg-green-500',
    SOLD_OUT: 'bg-slate-500',
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link
            href={`/du-an/${project.slug}`}
            className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative h-64 overflow-hidden">
                <Image
                    src={project.thumbnailUrl}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                    <Badge className={`${statusStyles[project.status]} text-white border-0`}>
                        {statusLabels[project.status]}
                    </Badge>
                </div>
            </div>

            <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {project.name}
                </h3>

                <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{project.location}</span>
                </div>

                <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Giá dự kiến:</p>
                    <p className="text-lg font-bold text-amber-600">{project.priceRange}</p>
                </div>
            </div>
        </Link>
    )
}
