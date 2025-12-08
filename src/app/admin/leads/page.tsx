import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import LeadsWithSearch from '@/components/admin/leads/leads-with-search'

export const metadata: Metadata = {
    title: 'Quản lý Khách hàng | Admin',
    description: 'Quản lý khách hàng tiềm năng',
}

export default async function LeadsPage() {
    const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Khách hàng tiềm năng</h1>
                <p className="text-slate-600 mt-2">
                    Quản lý và theo dõi khách hàng liên hệ ({leads.length} khách hàng)
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase">Mới</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                        {leads.filter((l) => l.status === 'NEW').length}
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-yellow-600 uppercase">Đã liên hệ</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                        {leads.filter((l) => l.status === 'CONTACTED').length}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-green-600 uppercase">Tiềm năng</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                        {leads.filter((l) => l.status === 'QUALIFIED').length}
                    </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-purple-600 uppercase">Đã chốt</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                        {leads.filter((l) => l.status === 'CONVERTED').length}
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Thất bại</p>
                    <p className="text-2xl font-bold text-gray-700 mt-1">
                        {leads.filter((l) => l.status === 'LOST').length}
                    </p>
                </div>
            </div>

            {/* Table with Search */}
            <LeadsWithSearch leads={leads} />
        </div>
    )
}

