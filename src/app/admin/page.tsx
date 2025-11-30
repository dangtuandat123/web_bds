import { Building, Home, Users } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'

async function getStats() {
    const [projectCount, listingCount, leadCount] = await Promise.all([
        prisma.project.count(),
        prisma.listing.count(),
        prisma.lead.count(),
    ])

    return {
        projects: projectCount,
        listings: listingCount,
        leads: leadCount,
    }
}

export default async function AdminDashboard() {
    const session = await getSession()
    const stats = await getStats()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
                <p className="text-slate-600 mt-2">
                    Xin chào, <span className="font-semibold">{session?.email}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Tổng dự án</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.projects}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Building className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Tin đăng</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.listings}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <Home className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Khách hàng</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.leads}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <Users className="text-amber-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Chào mừng đến với Admin Panel!</h2>
                <p className="text-amber-50">
                    Quản lý dự án, tin đăng và khách hàng của bạn một cách hiệu quả.
                </p>
            </div>
        </div>
    )
}
