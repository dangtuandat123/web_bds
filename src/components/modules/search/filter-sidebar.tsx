'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Bộ lọc</h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <X size={16} className="mr-1" /> Xóa
                    </Button>
                )}
            </div>

            <Accordion type="multiple" defaultValue={['price', 'area', 'type']} className="w-full">
                {/* Keyword Search */}
                <div className="mb-4">
                    <Input
                        placeholder="Tìm kiếm..."
                        value={filters.keyword}
                        onChange={(e) => updateFilter('keyword', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger className="text-sm font-semibold">Mức giá</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Từ (tỷ)"
                                    value={filters.priceMin}
                                    onChange={(e) => updateFilter('priceMin', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Đến (tỷ)"
                                    value={filters.priceMax}
                                    onChange={(e) => updateFilter('priceMax', e.target.value)}
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
                                        className="text-xs"
                                    >
                                        {range} tỷ
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Area Range */}
                <AccordionItem value="area">
                    <AccordionTrigger className="text-sm font-semibold">Diện tích</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Từ (m²)"
                                    value={filters.areaMin}
                                    onChange={(e) => updateFilter('areaMin', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Đến (m²)"
                                    value={filters.areaMax}
                                    onChange={(e) => updateFilter('areaMax', e.target.value)}
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
                                        className="text-xs"
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
                    <AccordionItem value="type">
                        <AccordionTrigger className="text-sm font-semibold">Loại hình</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="" id="type-all" />
                                        <Label htmlFor="type-all">Tất cả</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="APARTMENT" id="type-apt" />
                                        <Label htmlFor="type-apt">Căn hộ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="HOUSE" id="type-house" />
                                        <Label htmlFor="type-house">Nhà riêng</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="LAND" id="type-land" />
                                        <Label htmlFor="type-land">Đất nền</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Beds/Baths (Listing only) */}
                {type === 'listing' && (
                    <AccordionItem value="rooms">
                        <AccordionTrigger className="text-sm font-semibold">Phòng ngủ & WC</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs text-slate-600 mb-2 block">Phòng ngủ</Label>
                                    <div className="flex gap-2">
                                        {['1', '2', '3', '4+'].map((num) => (
                                            <Button
                                                key={num}
                                                variant={filters.beds === num ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateFilter('beds', num === filters.beds ? '' : num)}
                                                className="flex-1"
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-600 mb-2 block">WC</Label>
                                    <div className="flex gap-2">
                                        {['1', '2', '3+'].map((num) => (
                                            <Button
                                                key={num}
                                                variant={filters.baths === num ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateFilter('baths', num === filters.baths ? '' : num)}
                                                className="flex-1"
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
                    <AccordionItem value="status">
                        <AccordionTrigger className="text-sm font-semibold">Trạng thái</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="" id="status-all" />
                                        <Label htmlFor="status-all">Tất cả</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SELLING" id="status-selling" />
                                        <Label htmlFor="status-selling">Đang mở bán</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="UPCOMING" id="status-upcoming" />
                                        <Label htmlFor="status-upcoming">Sắp mở bán</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Location */}
                <AccordionItem value="location">
                    <AccordionTrigger className="text-sm font-semibold">Khu vực</AccordionTrigger>
                    <AccordionContent>
                        <Input
                            placeholder="Nhập khu vực..."
                            value={filters.location}
                            onChange={(e) => updateFilter('location', e.target.value)}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Apply Button */}
            <Button
                onClick={applyFilters}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
                Áp dụng bộ lọc
            </Button>
        </div>
    )
}
