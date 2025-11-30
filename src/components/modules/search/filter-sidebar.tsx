'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Search } from 'lucide-react'

interface FilterSidebarProps {
    type: 'project' | 'listing'
}

export default function FilterSidebar({ type }: FilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        type: searchParams.get('type') || '',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        areaMin: searchParams.get('areaMin') || '',
        areaMax: searchParams.get('areaMax') || '',
        beds: searchParams.get('beds') || '',
        baths: searchParams.get('baths') || '',
        location: searchParams.get('location') || '',
        status: searchParams.get('status') || '',
    })

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value)
        })
        router.push(`?${params.toString()}`)
    }

    const resetFilters = () => {
        setFilters({
            keyword: '',
            type: '',
            priceMin: '',
            priceMax: '',
            areaMin: '',
            areaMax: '',
            beds: '',
            baths: '',
            location: '',
            status: '',
        })
        router.push(window.location.pathname)
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '')

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
            {/* Header - EXACT STYLE from reference */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Search className="mr-2 text-amber-500" size={20} />
                    Bộ lọc tìm kiếm
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

            {/* Keyword Search - NO accordion, always visible */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Từ khóa</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Nhập từ khóa tìm kiếm..."
                        value={filters.keyword}
                        onChange={(e) => updateFilter('keyword', e.target.value)}
                        className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                </div>
            </div>

            <Accordion type="multiple" defaultValue={['price', 'area']} className="w-full">
                {/* Price Range - REFERENCE STYLE */}
                <AccordionItem value="price" className="border-slate-100">
                    <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                        Mức giá
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Từ (tỷ)"
                                    value={filters.priceMin}
                                    onChange={(e) => updateFilter('priceMin', e.target.value)}
                                    className="border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                                <Input
                                    type="number"
                                    placeholder="Đến (tỷ)"
                                    value={filters.priceMax}
                                    onChange={(e) => updateFilter('priceMax', e.target.value)}
                                    className="border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['< 1', '1-3', '3-5', '5-10', '> 10'].map((range) => (
                                    <Button
                                        key={range}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const [min, max] = range.includes('-')
                                                ? range.split('-').map(v => v.trim())
                                                : range.startsWith('<')
                                                    ? ['', range.replace('< ', '')]
                                                    : [range.replace('> ', ''), '']
                                            updateFilter('priceMin', min ? (parseFloat(min) * 1000000000).toString() : '')
                                            updateFilter('priceMax', max ? (parseFloat(max) * 1000000000).toString() : '')
                                        }}
                                        className="text-xs border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                        {range} tỷ
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Area Range */}
                <AccordionItem value="area" className="border-slate-100">
                    <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                        Diện tích
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Từ (m²)"
                                    value={filters.areaMin}
                                    onChange={(e) => updateFilter('areaMin', e.target.value)}
                                    className="border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                                <Input
                                    type="number"
                                    placeholder="Đến (m²)"
                                    value={filters.areaMax}
                                    onChange={(e) => updateFilter('areaMax', e.target.value)}
                                    className="border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['< 50', '50-100', '100-200', '> 200'].map((range) => (
                                    <Button
                                        key={range}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const [min, max] = range.includes('-')
                                                ? range.split('-')
                                                : range.startsWith('<')
                                                    ? ['', range.replace('< ', '')]
                                                    : [range.replace('> ', ''), '']
                                            updateFilter('areaMin', min)
                                            updateFilter('areaMax', max)
                                        }}
                                        className="text-xs border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                        {range} m²
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Type (Listing only) */}
                {type === 'listing' && (
                    <AccordionItem value="type" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                            Loại hình
                        </AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={filters.type} onValueChange={(v) => updateFilter('type', v)} className="space-y-3 pt-2">
                                {[
                                    { value: '', label: 'Tất cả' },
                                    { value: 'APARTMENT', label: 'Căn hộ' },
                                    { value: 'HOUSE', label: 'Nhà riêng' },
                                    { value: 'LAND', label: 'Đất nền' },
                                ].map((opt) => (
                                    <div key={opt.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.value} id={`type-${opt.value}`} className="text-amber-500 border-slate-300" />
                                        <Label htmlFor={`type-${opt.value}`} className="text-sm text-slate-700 cursor-pointer">
                                            {opt.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Beds/Baths (Listing only) */}
                {type === 'listing' && (
                    <AccordionItem value="rooms" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                            Phòng ngủ & WC
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2">
                                <div>
                                    <Label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">Phòng ngủ</Label>
                                    <div className="flex gap-2">
                                        {['1', '2', '3', '4+'].map((num) => (
                                            <Button
                                                key={num}
                                                variant={filters.beds === num ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateFilter('beds', num === filters.beds ? '' : num)}
                                                className={`flex-1 ${filters.beds === num
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                                        : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700'
                                                    }`}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">WC</Label>
                                    <div className="flex gap-2">
                                        {['1', '2', '3+'].map((num) => (
                                            <Button
                                                key={num}
                                                variant={filters.baths === num ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateFilter('baths', num === filters.baths ? '' : num)}
                                                className={`flex-1 ${filters.baths === num
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                                        : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700'
                                                    }`}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Status (Project only) */}
                {type === 'project' && (
                    <AccordionItem value="status" className="border-slate-100">
                        <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                            Trạng thái
                        </AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={filters.status} onValueChange={(v) => updateFilter('status', v)} className="space-y-3 pt-2">
                                {[
                                    { value: '', label: 'Tất cả' },
                                    { value: 'SELLING', label: 'Đang mở bán' },
                                    { value: 'UPCOMING', label: 'Sắp mở bán' },
                                ].map((opt) => (
                                    <div key={opt.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.value} id={`status-${opt.value}`} className="text-amber-500 border-slate-300" />
                                        <Label htmlFor={`status-${opt.value}`} className="text-sm text-slate-700 cursor-pointer">
                                            {opt.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Location */}
                <AccordionItem value="location" className="border-slate-100">
                    <AccordionTrigger className="text-sm font-bold text-slate-700 hover:text-amber-600 hover:no-underline">
                        Khu vực
                    </AccordionTrigger>
                    <AccordionContent>
                        <Input
                            placeholder="Nhập khu vực..."
                            value={filters.location}
                            onChange={(e) => updateFilter('location', e.target.value)}
                            className="border-slate-200 focus:border-amber-500 focus:ring-amber-500 mt-2"
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Apply Button - EXACT GRADIENT from reference */}
            <Button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
                Áp dụng bộ lọc
            </Button>
        </div>
    )
}
