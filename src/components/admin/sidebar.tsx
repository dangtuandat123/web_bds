'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building, Home, Users, Settings, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Dự án', href: '/admin/projects', icon: Building },
    { name: 'Sàn giao dịch', href: '/admin/listings', icon: Home },
    { name: 'Khách hàng', href: '/admin/leads', icon: Users },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                    <Building size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Happy Land </span>
                    <span className="text-[10px] text-slate-400">Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? 'bg-amber-500 text-white shadow-lg'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-800 p-4">
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </form>
            </div>
        </div>
    )
}
