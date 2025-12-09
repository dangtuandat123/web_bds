'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building, Home, Users, Newspaper, Settings, LogOut, Sparkles, MapPin, MessageSquare, KeyRound } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Dự án', href: '/admin/projects', icon: Building },
    { name: 'Sàn giao dịch', href: '/admin/listings', icon: Home },
    { name: 'Tiện ích', href: '/admin/amenities', icon: Sparkles },
    { name: 'Khu vực', href: '/admin/locations', icon: MapPin },
    { name: 'Tin tức', href: '/admin/news', icon: Newspaper },
    { name: 'Chatbot AI', href: '/admin/chatbot', icon: MessageSquare },
    { name: 'Khách hàng', href: '/admin/leads', icon: Users },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
    siteName?: string
}

export default function AdminSidebar({ siteName = 'Happy Land' }: AdminSidebarProps) {
    const pathname = usePathname()

    return (
        <div className="sticky top-0 h-screen w-64 flex-col bg-slate-900 text-white overflow-y-auto">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                    <Building size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">{siteName}</span>
                    <span className="text-[10px] text-slate-400">Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    // For dashboard, exact match; for others, startsWith to match child routes
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)
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

            {/* Bottom Actions */}
            <div className="border-t border-slate-800 p-4 space-y-1">
                {/* Change Password */}
                <Link
                    href="/admin/change-password"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${pathname === '/admin/change-password'
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <KeyRound size={18} />
                    Đổi mật khẩu
                </Link>

                {/* Logout */}
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
