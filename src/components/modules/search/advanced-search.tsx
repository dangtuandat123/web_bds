'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, MapPin, Bed, Compass, ChevronDown } from 'lucide-react'

interface AdvancedSearchProps {
    isProjectSearch?: boolean
}

const LOCATIONS = ['Tất cả khu vực', 'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 9', 'Thủ Đức', 'Bình Thạnh']
const PRICE_RANGES = [
    { label: 'Tất cả mức giá', min: null, max: null },
    { label: 'Dưới 1 tỷ', min: null, max: 1000000000 },
    { label: '1-3 tỷ', min: 1000000000, max: 3000000000 },
    { label: '3-5 tỷ', min: 3000000000, max: 5000000000 },
    { label: '5-10 tỷ', min: 5000000000, max: 10000000000 },
    { label: 'Trên 10 tỷ', min: 10000000000, max: null },
]
const AREA_RANGES = [
    { label: 'Tất cả diện tích', min: null, max: null },
    { label: 'Dưới 50m²', min: null, max: 50 },
    { label: '50-100m²', min: 50, max: 100 },
    { label: '100-200m²', min: 100, max: 200 },
    { label: 'Trên 200m²', min: 200, max: null },
]
const LISTING_TYPES = [
    { id: 'all', name: 'Tất cả loại hình' },
    { id: 'APARTMENT', name: 'Căn hộ' },
    { id: 'HOUSE', name: 'Nhà riêng' },
    { id: 'LAND', name: 'Đất nền' },
]
const PROJECT_CATEGORIES = [
    { id: 'all', name: 'Tất cả loại hình' },
    { id: 'APARTMENT', name: 'Căn hộ chung cư' },
    { id: 'HOUSE', name: 'Nhà phố - Biệt thự' },
    { id: 'LAND', name: 'Đất nền dự án' },
]
const BEDROOM_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: '1', label: '1 PN' },
    { value: '2', label: '2 PN' },
    { value: '3', label: '3 PN' },
    { value: '4+', label: '4+ PN' },
]
const DIRECTION_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Đông', label: 'Đông' },
    { value: 'Tây', label: 'Tây' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Bắc', label: 'Bắc' },
]

export default function AdvancedSearch({ isProjectSearch = false }: AdvancedSearchProps) {
    const router = useRouter()
    const [keyword, setKeyword] = useState('')
    const [location, setLocation] = useState(LOCATIONS[0])
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
        router.push(`${targetPage}?${params.toString()}`

        )
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
                <span className="text-xs text-slate-400 italic hidden sm:inline">
                    Lọc nhanh theo nhu cầu của bạn
                </span>
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
                        options={LOCATIONS}
                        icon={MapPin}
                    />
                </div>

                {/* Row 2: Price, Area (listing only), Beds, Direction, Button */}
                <div className={`grid gap-x-4 gap-y-4 items-end ${isProjectSearch ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                    <div className="col-span-2 md:col-span-1">
                        <SelectBox
                            label="Mức giá"
                            value={priceIndex}
                            onChange={(v: string) => setPriceIndex(Number(v))}
                            options={PRICE_RANGES.map((r, i) => ({ value: i, label: r.label }))}
                        />
                    </div>
                    {!isProjectSearch && (
                        <>
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
