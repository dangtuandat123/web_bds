'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AdminSearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function AdminSearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...'
}: AdminSearchInputProps) {
    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => onChange('')}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}
