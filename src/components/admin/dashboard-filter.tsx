'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const months = [
    { value: 'all', label: 'Tất cả tháng' },
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
]

// Generate years from 2020 to current year
const currentYear = new Date().getFullYear()
const years = [
    { value: 'all', label: 'Tất cả năm' },
    ...Array.from({ length: currentYear - 2019 }, (_, i) => ({
        value: String(2020 + i),
        label: String(2020 + i),
    })).reverse(),
]

export default function DashboardFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const month = searchParams.get('month') || 'all'
    const year = searchParams.get('year') || 'all'

    const handleChange = (key: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push(pathname)
    }

    const hasFilters = month !== 'all' || year !== 'all'

    return (
        <div className="flex items-center gap-3">
            {/* Filter Container */}
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
                <Calendar size={18} className="text-amber-500" />

                {/* Month Select */}
                <Select value={month} onValueChange={(value) => handleChange('month', value)}>
                    <SelectTrigger className="w-[140px] border-slate-200">
                        <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Year Select */}
                <Select value={year} onValueChange={(value) => handleChange('year', value)}>
                    <SelectTrigger className="w-[130px] border-slate-200">
                        <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                                {y.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Clear Button */}
            {hasFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                >
                    <X size={14} className="mr-1" />
                    Xóa lọc
                </Button>
            )}
        </div>
    )
}
