'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, Menu, X, Building, ArrowRight, Facebook, Youtube } from 'lucide-react'
import { SiteSettings } from '@/lib/settings'

interface HeaderProps {
    settings: SiteSettings
}

export default function Header({ settings }: HeaderProps) {
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
                            <Phone size={14} className="mr-2 text-amber-500" /> {settings.contactPhone}
                        </span>
                        <span className="flex items-center hidden sm:flex hover:text-amber-500 transition-colors cursor-pointer">
                            <Mail size={14} className="mr-2 text-amber-500" /> {settings.contactEmail}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500 hidden md:inline">Kết nối với chúng tôi:</span>
                        {settings.socialFacebook && (
                            <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
                                <Facebook size={14} className="cursor-pointer hover:text-blue-500 transition-colors" />
                            </a>
                        )}
                        {settings.socialZalo && (
                            <a href={settings.socialZalo.startsWith('http') ? settings.socialZalo : `https://zalo.me/${settings.socialZalo}`} target="_blank" rel="noopener noreferrer">
                                <span className="text-xs font-bold cursor-pointer hover:text-blue-500 transition-colors">Zalo</span>
                            </a>
                        )}
                        {settings.socialYoutube && (
                            <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer">
                                <Youtube size={14} className="cursor-pointer hover:text-red-500 transition-colors" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="group flex items-center cursor-pointer">
                            {settings.siteLogo ? (
                                <Image
                                    src={settings.siteLogo}
                                    alt={settings.siteName}
                                    width={160}
                                    height={50}
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:scale-105 transition-transform">
                                        <Building className="text-white" size={20} />
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xl font-extrabold text-slate-800 tracking-tight">{settings.siteName.toUpperCase()}</span>
                                        <span className="text-[10px] font-bold text-amber-600 tracking-[0.3em] uppercase mt-1">Real Estate</span>
                                    </div>
                                </>
                            )}
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-8 items-center">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-sm font-bold uppercase tracking-wide transition-all duration-300 relative px-2 py-1 rounded hover:bg-slate-50 ${isActive(item.href) ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                                        }`}
                                >
                                    {item.label}
                                    <span
                                        className={`absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-amber-500 transform -translate-x-1/2 transition-transform duration-300 ${isActive(item.href) ? 'scale-x-100' : 'scale-x-0'
                                            }`}
                                    ></span>
                                </Link>
                            ))}
                            <Link
                                href="/lien-he"
                                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-xl hover:scale-105 active:scale-95 border border-slate-700"
                            >
                                Liên hệ tư vấn
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl animate-fade-in-up">
                        <div className="flex flex-col px-6 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`py-3 text-left font-bold border-b border-slate-50 last:border-0 hover:text-amber-600 transition-colors flex items-center justify-between ${isActive(item.href) ? 'text-amber-600' : 'text-slate-600'
                                        }`}
                                >
                                    {item.label}
                                    <ArrowRight size={16} className="opacity-50" />
                                </Link>
                            ))}
                            {/* Contact Button for Mobile */}
                            <Link
                                href="/lien-he"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-center transition-all hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Phone size={18} />
                                Liên hệ tư vấn
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    )
}
