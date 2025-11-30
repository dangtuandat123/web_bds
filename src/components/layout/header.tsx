'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, Menu, X, Building, ArrowRight, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Header() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { label: 'Trang chủ', href: '/' },
        { label: 'Dự án', href: '/du-an' },
        { label: 'Sàn giao dịch', href: '/nha-dat' },
        { label: 'Tin tức & Pháp lý', href: '/tin-tuc' }
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname?.startsWith(href)
    }

    return (
        <>
            {/* Top Bar */}
            <div className="bg-slate-900 text-slate-300 py-2 text-xs sm:text-sm relative z-50">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <span className="flex items-center hover:text-amber-500 transition-colors cursor-pointer">
                            <Phone size={14} className="mr-2 text-amber-500" /> 0912 345 678
                        </span>
                        <span className="flex items-center hidden sm:flex hover:text-amber-500 transition-colors cursor-pointer">
                            <Mail size={14} className="mr-2 text-amber-500" /> info@happyland.net.vn
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500 hidden md:inline">Kết nối với chúng tôi:</span>
                        <Facebook size={14} className="cursor-pointer hover:text-blue-500 transition-colors" />
                        <Instagram size={14} className="cursor-pointer hover:text-pink-500 transition-colors" />
                        <Youtube size={14} className="cursor-pointer hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="group flex items-center cursor-pointer">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:scale-105 transition-transform">
                                <Building className="text-white" size={20} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight">HAPPY LAND</span>
                                <span className="text-[10px] font-bold text-amber-600 tracking-[0.3em] uppercase mt-1">Real Estate</span>
                                {/* Mobile Menu Button */}
                                <button
                                    className="lg:hidden text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </div>
                    </div>
                    )
}
