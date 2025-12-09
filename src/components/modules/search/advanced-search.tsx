'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, Bed, Compass, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    PRICE_RANGES,
    AREA_RANGES,
    LISTING_TYPES,
    PROJECT_CATEGORIES,
    BEDROOM_OPTIONS,
    DIRECTION_OPTIONS,
} from '@/lib/constants'

interface AdvancedSearchProps {
    isProjectSearch?: boolean
    locations: string[]
}

export default function AdvancedSearch({ isProjectSearch = false, locations }: AdvancedSearchProps) {
    const router = useRouter()
    const allLocations = ['Tất cả khu vực', ...locations]
    const [keyword, setKeyword] = useState('')
    const [location, setLocation] = useState(allLocations[0])
    const [priceIndex, setPriceIndex] = useState(0)
    const [areaIndex, setAreaIndex] = useState(0)
    const [type, setType] = useState(isProjectSearch ? PROJECT_CATEGORIES[0].id : LISTING_TYPES[0].id)
    const [bedrooms, setBedrooms] = useState(BEDROOM_OPTIONS[0].value)
    const [direction, setDirection] = useState(DIRECTION_OPTIONS[0].value)

    const typeOptions = isProjectSearch ? PROJECT_CATEGORIES : LISTING_TYPES

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams()
        if (keyword) params.set('keyword', keyword)
        if (location !== 'Tất cả khu vực') params.set('location', location)
        if (type !== 'all') params.set('type', type)

        const priceRange = PRICE_RANGES[priceIndex]
        if (priceRange.min) params.set('priceMin', priceRange.min.toString())
        if (priceRange.max) params.set('priceMax', priceRange.max.toString())

        // Only send area params for listings (not projects)
        if (!isProjectSearch) {
            const areaRange = AREA_RANGES[areaIndex]
            if (areaRange.min) params.set('areaMin', areaRange.min.toString())
            if (areaRange.max) params.set('areaMax', areaRange.max.toString())

            if (bedrooms !== 'all') params.set('beds', bedrooms)
            if (direction !== 'all') params.set('direction', direction)
        }

        const targetPage = isProjectSearch ? '/du-an' : '/nha-dat'
        router.push(`${targetPage}?${params.toString()}`)
    }

    const handleReset = () => {
        setKeyword('')
        setLocation(allLocations[0])
        setPriceIndex(0)
        setAreaIndex(0)
        setType(isProjectSearch ? PROJECT_CATEGORIES[0].id : LISTING_TYPES[0].id)
        setBedrooms(BEDROOM_OPTIONS[0].value)
        setDirection(DIRECTION_OPTIONS[0].value)
        const targetPage = isProjectSearch ? '/du-an' : '/nha-dat'
        router.push(targetPage)
    }

    return (
        <div className="bg-white/90 backdrop-blur-lg p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl border border-white/50 relative z-20 mx-auto -mt-8 md:-mt-16 lg:-mt-24 max-w-6xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-slate-800 font-bold flex items-center uppercase text-sm tracking-wide">
                    <span className="bg-amber-100 text-amber-600 p-1.5 rounded mr-2">
                        <Search size={16} />
                    </span>
                    Tìm kiếm {isProjectSearch ? 'dự án' : 'bất động sản'}
                </h3>
                <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-amber-600 font-medium transition-colors flex items-center gap-1 group"
                >
                    <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
                    <span className="hidden sm:inline">Xóa bộ lọc</span>
                </button>
            </div>

            <form onSubmit={handleSearch}>
                {/* Row 1: Keyword, Type, Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-4">
                    <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                            Từ khóa
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={isProjectSearch ? "Nhập tên dự án..." : "Nhập tên dự án, địa điểm..."}
                                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm transition-all"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        </div>
                    </div>

                    {/* Type Select */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                            Loại hình
                        </label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full">
                                <Home size={14} className="mr-2 text-slate-400" />
                                <SelectValue placeholder="Chọn loại hình" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Select */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                            Khu vực
                        </label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className="w-full">
                                <MapPin size={14} className="mr-2 text-slate-400" />
                                <SelectValue placeholder="Chọn khu vực" />
                            </SelectTrigger>
                            <SelectContent>
                                {allLocations.map((loc) => (
                                    <SelectItem key={loc} value={loc}>
                                        {loc}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Row 2: Price, Area, Beds, Direction, Buttons */}
                <div className={`grid gap-x-4 gap-y-4 items-end ${isProjectSearch ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                    {!isProjectSearch && (
                        <>
                            {/* Price Select */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                                    Mức giá
                                </label>
                                <Select value={priceIndex.toString()} onValueChange={(v) => setPriceIndex(Number(v))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn mức giá" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRICE_RANGES.map((r, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Area Select */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                                    Diện tích
                                </label>
                                <Select value={areaIndex.toString()} onValueChange={(v) => setAreaIndex(Number(v))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn diện tích" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AREA_RANGES.map((r, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bedrooms Select */}
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                                    Phòng ngủ
                                </label>
                                <Select value={bedrooms} onValueChange={setBedrooms}>
                                    <SelectTrigger className="w-full">
                                        <Bed size={14} className="mr-2 text-slate-400" />
                                        <SelectValue placeholder="Số phòng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BEDROOM_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Direction Select */}
                            <div className="col-span-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                                    Hướng
                                </label>
                                <Select value={direction} onValueChange={setDirection}>
                                    <SelectTrigger className="w-full">
                                        <Compass size={14} className="mr-2 text-slate-400" />
                                        <SelectValue placeholder="Chọn hướng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIRECTION_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    <div className={`col-span-2 ${isProjectSearch ? 'md:col-span-1' : 'md:col-span-4 lg:col-span-1'}`}>
                        <button
                            type="submit"
                            className="w-full h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-md font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                        >
                            Tìm Kiếm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
