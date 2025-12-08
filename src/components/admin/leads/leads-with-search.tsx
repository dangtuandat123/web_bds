'use client'

import { useState, useMemo } from 'react'
import { lead } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import LeadTable from '@/components/admin/leads/lead-table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface LeadsWithSearchProps {
    leads: lead[]
}

const statusOptions = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'NEW', label: 'Mới' },
    { value: 'CONTACTED', label: 'Đã liên hệ' },
    { value: 'QUALIFIED', label: 'Tiềm năng' },
    { value: 'CONVERTED', label: 'Đã chốt' },
    { value: 'LOST', label: 'Thất bại' },
]

export default function LeadsWithSearch({ leads }: LeadsWithSearchProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const filteredLeads = useMemo(() => {
        let result = leads

        // Filter by status
        if (statusFilter !== 'ALL') {
            result = result.filter(l => l.status === statusFilter)
        }

        // Filter by search
        if (search.trim()) {
            const query = search.toLowerCase()
            result = result.filter(l =>
                l.name.toLowerCase().includes(query) ||
                l.phone.toLowerCase().includes(query) ||
                (l.email && l.email.toLowerCase().includes(query)) ||
                (l.message && l.message.toLowerCase().includes(query))
            )
        }

        return result
    }, [leads, search, statusFilter])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Tìm theo tên, SĐT, email..."
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-slate-500">
                    {filteredLeads.length} / {leads.length} khách hàng
                </span>
            </div>
            <LeadTable leads={filteredLeads} />
        </div>
    )
}
