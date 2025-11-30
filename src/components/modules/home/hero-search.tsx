'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function HeroSearch() {
    const [keyword, setKeyword] = useState('')
    const [type, setType] = useState('')
    const [location, setLocation] = useState('')

    const handleSearch = () => {
        console.log({ keyword, type, location })
        // TODO: Navigate to search results page
    }

    return (
        <div className="relative h-[600px] flex items-center justify-center">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80)',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Tìm kiếm bất động sản<br />
                    <span className="text-amber-500">mơ ước của bạn</span>
                </h1>
                <p className="text-xl text-white/90 mb-12">
                    Hàng ngàn căn hộ, nhà đất chất lượng cao tại TP. HCM
                </p>

                {/* Search Box */}
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Tìm kiếm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="md:col-span-1"
                        />

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Loại hình" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APARTMENT">Căn hộ</SelectItem>
                                <SelectItem value="HOUSE">Nhà riêng</SelectItem>
                                <SelectItem value="LAND">Đất nền</SelectItem>
                                <SelectItem value="RENT">Cho thuê</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Khu vực" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="thu-duc">TP. Thủ Đức</SelectItem>
                                <SelectItem value="q1">Quận 1</SelectItem>
                                <SelectItem value="q2">Quận 2</SelectItem>
                                <SelectItem value="q7">Quận 7</SelectItem>
                                <SelectItem value="q9">Quận 9</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
