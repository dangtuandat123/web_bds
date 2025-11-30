import { CheckCircle } from 'lucide-react'

interface AmenityListProps {
    amenities: Array<{
        id: number
        name: string
        icon?: string
    }>
    title?: string
}

export default function AmenityList({ amenities, title = 'Tiện ích' }: AmenityListProps) {
    if (!amenities || amenities.length === 0) return null

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                    <div
                        key={amenity.id}
                        className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-amber-200 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3 group-hover:bg-green-100 transition-colors">
                            {amenity.icon ? (
                                <span className="text-xl">{amenity.icon}</span>
                            ) : (
                                <CheckCircle size={20} className="text-green-500" />
                            )}
                        </div>
                        <span className="text-slate-700 font-medium">{amenity.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
