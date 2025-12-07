'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, Bed, Compass, ChevronDown, X } from 'lucide-react'
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

    const SelectBox = ({ label, value, onChange, options, icon: Icon }: any) => (
        <div className="group">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider group-focus-within:text-amber-500 transition-colors">
                {label}
            </label>
            <div className="relative">
                <select
                    className="w-full h-11 pl-3 pr-8 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 appearance-none text-sm font-medium transition-all cursor-pointer text-slate-700"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((opt: any, idx: number) => (
                        <option key={idx} value={opt.value !== undefined ? opt.value : (opt.id || opt)}>
                            {opt.label || opt.name || opt}
                        </option>
                    ))}
                </select>
                {Icon ? (
                    <Icon size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                ) : (
                    <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                )}
            </div>
        </div>
    )

    return (
        <div className="bg-white/90 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl border border-white/50 relative z-20 mx-auto -mt-24 max-w-6xl animate-fade-in-up">
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
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                            Từ khóa
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={isProjectSearch ? "Nhập tên dự án..." : "Nhập tên dự án, địa điểm..."}
                                className="w-full h-11 pl-10 pr-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm transition-all"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
                        </div>
                    </div>
                    <SelectBox
                        label="Loại hình"
                        value={type}
                        onChange={setType}
                        options={typeOptions}
                        icon={Home}
                    />
                    <SelectBox
                        label="Khu vực"
                        value={location}
                        onChange={setLocation}
                        options={allLocations}
                        icon={MapPin}
                    />
                </div>

                {/* Row 2: Price (listing only), Area (listing only), Beds, Direction, Buttons */}
                <div className={`grid gap-x-4 gap-y-4 items-end ${isProjectSearch ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                    {!isProjectSearch && (
                        <>
                            <div className="col-span-2 md:col-span-1">
                                <SelectBox
                                    label="Mức giá"
                                    value={priceIndex}
                                    onChange={(v: string) => setPriceIndex(Number(v))}
                                    options={PRICE_RANGES.map((r, i) => ({ value: i, label: r.label }))}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <SelectBox
                                    label="Diện tích"
                                    value={areaIndex}
                                    onChange={(v: string) => setAreaIndex(Number(v))}
                                    options={AREA_RANGES.map((r, i) => ({ value: i, label: r.label }))}
                                />
                            </div>
                            <div className="col-span-1">
                                <SelectBox
                                    label="Phòng ngủ"
                                    value={bedrooms}
                                    onChange={setBedrooms}
                                    options={BEDROOM_OPTIONS}
                                    icon={Bed}
                                />
                            </div>
                            <div className="col-span-1">
                                <SelectBox
                                    label="Hướng"
                                    value={direction}
                                    onChange={setDirection}
                                    options={DIRECTION_OPTIONS}
                                    icon={Compass}
                                />
                            </div>
                        </>
                    )}
                    <div className={`col-span-2 ${isProjectSearch ? 'md:col-span-1' : 'md:col-span-4 lg:col-span-1'}`}>
                        <button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                        >
                            Tìm Kiếm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
