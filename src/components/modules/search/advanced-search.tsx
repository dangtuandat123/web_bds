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

    // Consistent styling classes
    const labelClass = "block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider"
    const inputClass = "w-full h-11 px-4 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm transition-all placeholder:text-slate-400"
    const selectTriggerClass = "h-11 border-slate-200 bg-white hover:bg-slate-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"

    return (
        <div className="bg-white/95 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-200/50 relative z-20 mx-auto -mt-8 md:-mt-16 lg:-mt-24 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-slate-800 font-bold flex items-center uppercase text-sm tracking-wide">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">
                        <Search size={16} />
                    </span>
                    Tìm kiếm {isProjectSearch ? 'dự án' : 'bất động sản'}
                </h3>
                <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-amber-600 font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-50"
                >
                    <X size={14} />
                    <span>Xóa bộ lọc</span>
                </button>
            </div>

            <form onSubmit={handleSearch}>
                {/* Row 1: Keyword, Type, Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Keyword Input */}
                    <div className="lg:col-span-2">
                        <label className={labelClass}>Từ khóa</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder={isProjectSearch ? "Nhập tên dự án..." : "Nhập tên dự án, địa điểm..."}
                                className={`${inputClass} pl-11`}
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type Select */}
                    <div>
                        <label className={labelClass}>Loại hình</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className={selectTriggerClass}>
                                <div className="flex items-center gap-2">
                                    <Home size={14} className="text-slate-400 flex-shrink-0" />
                                    <SelectValue placeholder="Chọn loại hình" />
                                </div>
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
                        <label className={labelClass}>Khu vực</label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className={selectTriggerClass}>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                                    <SelectValue placeholder="Chọn khu vực" />
                                </div>
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

                {/* Row 2: Additional filters */}
                <div className={`grid gap-4 items-end ${isProjectSearch ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
                    {!isProjectSearch && (
                        <>
                            {/* Price Select */}
                            <div>
                                <label className={labelClass}>Mức giá</label>
                                <Select value={priceIndex.toString()} onValueChange={(v) => setPriceIndex(Number(v))}>
                                    <SelectTrigger className={selectTriggerClass}>
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
                            <div>
                                <label className={labelClass}>Diện tích</label>
                                <Select value={areaIndex.toString()} onValueChange={(v) => setAreaIndex(Number(v))}>
                                    <SelectTrigger className={selectTriggerClass}>
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
                            <div>
                                <label className={labelClass}>Phòng ngủ</label>
                                <Select value={bedrooms} onValueChange={setBedrooms}>
                                    <SelectTrigger className={selectTriggerClass}>
                                        <div className="flex items-center gap-2">
                                            <Bed size={14} className="text-slate-400 flex-shrink-0" />
                                            <SelectValue placeholder="Số phòng" />
                                        </div>
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
                            <div>
                                <label className={labelClass}>Hướng</label>
                                <Select value={direction} onValueChange={setDirection}>
                                    <SelectTrigger className={selectTriggerClass}>
                                        <div className="flex items-center gap-2">
                                            <Compass size={14} className="text-slate-400 flex-shrink-0" />
                                            <SelectValue placeholder="Chọn hướng" />
                                        </div>
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

                    {/* Search Button */}
                    <div className={isProjectSearch ? '' : ''}>
                        <label className={`${labelClass} invisible`}>Button</label>
                        <button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Search size={16} />
                            Tìm Kiếm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
