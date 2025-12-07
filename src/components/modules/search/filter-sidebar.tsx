'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Home, MapPin, Bed, Compass, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                    Từ khóa
                </label>
                <div className="relative">
                    <Input
                        placeholder={type === 'project' ? "Nhập tên dự án..." : "Nhập từ khóa..."}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
                </div>
            </div>

            {/* Type */}
            <SelectBox
                label="Loại hình"
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                icon={Home}
            />

            {/* Location */}
            <SelectBox
                label="Khu vực"
                value={location}
                onChange={setLocation}
                options={allLocations}
                icon={MapPin}
            />

            {/* Price */}
            <SelectBox
                label="Mức giá"
                value={priceIndex}
                onChange={(v: string) => setPriceIndex(Number(v))}
                options={PRICE_RANGES.map((r, i) => ({ value: i, label: r.label }))}
            />

            {/* Area */}
            <SelectBox
                label="Diện tích"
                value={areaIndex}
                onChange={(v: string) => setAreaIndex(Number(v))}
                options={AREA_RANGES.map((r, i) => ({ value: i, label: r.label }))}
            />

            {/* Beds & Direction for Listings */}
            {type === 'listing' && (
                <>
                    <SelectBox
                        label="Phòng ngủ"
                        value={bedrooms}
                        onChange={setBedrooms}
                        options={BEDROOM_OPTIONS}
                        icon={Bed}
                    />
                    <SelectBox
                        label="Hướng"
                        value={direction}
                        onChange={setDirection}
                        options={DIRECTION_OPTIONS}
                        icon={Compass}
                    />
                </>
            )}

            {/* Status for Projects */}
            {type === 'project' && (
                <SelectBox
                    label="Trạng thái"
                    value={status}
                    onChange={setStatus}
                    options={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'SELLING', label: 'Đang mở bán' },
                        { value: 'UPCOMING', label: 'Sắp mở bán' },
                    ]}
                />
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
