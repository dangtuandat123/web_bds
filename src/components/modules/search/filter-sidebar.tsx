'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Home, MapPin, Bed, Compass, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface FilterSidebarProps {
    type: 'project' | 'listing'
    locations: string[]
}

export default function FilterSidebar({ type, locations }: FilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const allLocations = ['Tất cả khu vực', ...locations]
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
    const [location, setLocation] = useState(searchParams.get('location') || allLocations[0])
    const [priceIndex, setPriceIndex] = useState(0)
    const [areaIndex, setAreaIndex] = useState(0)
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || (type === 'project' ? PROJECT_CATEGORIES[0].id : LISTING_TYPES[0].id))
    const [bedrooms, setBedrooms] = useState(searchParams.get('beds') || BEDROOM_OPTIONS[0].value)
    const [direction, setDirection] = useState(searchParams.get('direction') || DIRECTION_OPTIONS[0].value)
    const [status, setStatus] = useState(searchParams.get('status') || 'all')

    const typeOptions = type === 'project' ? PROJECT_CATEGORIES : LISTING_TYPES

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (keyword) params.set('keyword', keyword)
        if (location !== 'Tất cả khu vực') params.set('location', location)
        if (typeFilter !== 'all') params.set('type', typeFilter)

        const priceRange = PRICE_RANGES[priceIndex]
        if (priceRange.min) params.set('priceMin', priceRange.min.toString())
        if (priceRange.max) params.set('priceMax', priceRange.max.toString())

        const areaRange = AREA_RANGES[areaIndex]
        if (areaRange.min) params.set('areaMin', areaRange.min.toString())
        if (areaRange.max) params.set('areaMax', areaRange.max.toString())

        if (type === 'listing') {
            if (bedrooms !== 'all') params.set('beds', bedrooms)
            if (direction !== 'all') params.set('direction', direction)
        }

        if (type === 'project' && status !== 'all') {
            params.set('status', status)
        }

        router.push(`?${params.toString()}`)
    }

    const resetFilters = () => {
        setKeyword('')
        setLocation(allLocations[0])
        setPriceIndex(0)
        setAreaIndex(0)
        setTypeFilter(type === 'project' ? PROJECT_CATEGORIES[0].id : LISTING_TYPES[0].id)
        setBedrooms(BEDROOM_OPTIONS[0].value)
        setDirection(DIRECTION_OPTIONS[0].value)
        setStatus('all')
        router.push(window.location.pathname)
    }

    const hasActiveFilters = keyword || location !== allLocations[0] || priceIndex !== 0 || areaIndex !== 0 ||
        typeFilter !== (type === 'project' ? PROJECT_CATEGORIES[0].id : LISTING_TYPES[0].id) ||
        bedrooms !== BEDROOM_OPTIONS[0].value || direction !== DIRECTION_OPTIONS[0].value || status !== 'all'

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-slate-800 font-bold flex items-center uppercase text-sm tracking-wide">
                    <span className="bg-amber-100 text-amber-600 p-1.5 rounded mr-2">
                        <Search size={16} />
                    </span>
                    Tìm kiếm {type === 'project' ? 'dự án' : 'bất động sản'}
                </h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                    >
                        <X size={16} className="mr-1" /> Xóa
                    </Button>
                )}
            </div>

            {/* Keyword */}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Từ khóa
                </label>
                <div className="relative">
                    <Input
                        placeholder={type === 'project' ? "Nhập tên dự án..." : "Nhập từ khóa..."}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-10 border-slate-200"
                    />
                    <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                </div>
            </div>

            {/* Type */}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Loại hình
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
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

            {/* Location */}
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

            {/* Price */}
            <div>
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

            {/* Area */}
            <div>
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

            {/* Beds & Direction for Listings */}
            {type === 'listing' && (
                <>
                    <div>
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
                    <div>
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

            {/* Status for Projects */}
            {type === 'project' && (
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                        Trạng thái
                    </label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="SELLING">Đang mở bán</SelectItem>
                            <SelectItem value="UPCOMING">Sắp mở bán</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Apply Button */}
            <Button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
                Áp dụng bộ lọc
            </Button>
        </div>
    )
}
