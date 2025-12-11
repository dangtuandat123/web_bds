'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building, Home, Users, Newspaper, Settings, LogOut, Sparkles, MapPin, MessageSquare, KeyRound, Menu, X } from 'lucide-react'
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

export default function AdminSidebar({ siteName = 'Admin Panel' }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0">
                    <Building size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">{siteName}</span>
                    <span className="text-[10px] text-slate-400">Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    // Normalize pathname by removing trailing slash
                    const normalizedPath = pathname?.replace(/\/$/, '') || ''
                    const itemPath = item.href.replace(/\/$/, '')
                    const isActive = itemPath === '/admin'
                        ? normalizedPath === '/admin' || normalizedPath === ''
                        : normalizedPath.startsWith(itemPath)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                ? 'bg-amber-500 text-white shadow-lg'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
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
                    <KeyRound size={18} className="flex-shrink-0" />
                    <span className="truncate">Đổi mật khẩu</span>
                </Link>

                {/* Logout */}
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="truncate">Đăng xuất</span>
                    </button>
                </form>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                            <Building size={16} />
                        </div>
                        <span className="text-white text-sm font-bold truncate max-w-[150px]">{siteName}</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`
                lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-slate-900 text-white
                transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex sticky top-0 h-screen w-64 flex-col bg-slate-900 text-white">
                <SidebarContent />
            </div>
        </>
    )
}
