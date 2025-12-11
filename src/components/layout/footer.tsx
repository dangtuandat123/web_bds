'use client'

import Link from 'next/link'
import { Building, MapPin, Phone, Mail, Facebook, Youtube, ArrowRight } from 'lucide-react'
import { SiteSettings } from '@/lib/settings'

interface FooterProps {
    settings: SiteSettings
}

export default function Footer({ settings }: FooterProps) {
    const quickLinks = [
        { label: 'Trang chủ', href: '/' },
        { label: 'Dự án', href: '/du-an' },
        { label: 'Sàn giao dịch', href: '/nha-dat' },
        { label: 'Tin tức', href: '/tin-tuc' },
        { label: 'Liên hệ', href: '/lien-he' },
    ]

    return (
        <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 relative overflow-hidden">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

                    {/* Column 1: Company Info */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-6">
                            {settings.siteLogo ? (
                                <>
                                    <img src={settings.siteLogo}
                                        alt={settings.siteName}
                                        width={50}
                                        height={50}
                                        className="h-12 w-auto object-contain mr-3"
                                    />
                                    <div>
                                        <span className="text-white font-bold text-lg block">{settings.siteName.toUpperCase()}</span>
                                        <span className="text-[10px] text-amber-500 tracking-widest uppercase">Real Estate</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mr-3">
                                        <Building className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold text-lg block">{settings.siteName.toUpperCase()}</span>
                                        <span className="text-[10px] text-amber-500 tracking-widest uppercase">Real Estate</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            {settings.siteDescription}
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {settings.socialFacebook && (
                                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 bg-slate-800/50 backdrop-blur rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all hover:scale-110">
                                    <Facebook size={18} />
                                </a>
                            )}
                            {settings.socialZalo && (
                                <a href={settings.socialZalo.startsWith('http') ? settings.socialZalo : `https://zalo.me/${settings.socialZalo}`} target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 bg-slate-800/50 backdrop-blur rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all hover:scale-110">
                                    <span className="text-xs font-bold">Zalo</span>
                                </a>
                            )}
                            {settings.socialYoutube && (
                                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer"
                                    className="w-10 h-10 bg-slate-800/50 backdrop-blur rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all hover:scale-110">
                                    <Youtube size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center">
                            <span className="w-8 h-0.5 bg-amber-500 mr-3"></span>
                            Liên kết nhanh
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                                        <ArrowRight size={14} className="mr-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6 flex items-center">
                            <span className="w-8 h-0.5 bg-amber-500 mr-3"></span>
                            Thông tin liên hệ
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start group">
                                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                    <MapPin size={18} className="text-amber-500 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                                    {settings.contactAddress}
                                </span>
                            </li>
                            <li className="flex items-center group">
                                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                    <Phone size={18} className="text-amber-500 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Hotline</span>
                                    <span className="font-bold text-white text-lg group-hover:text-amber-500 transition-colors">
                                        {settings.contactPhone}
                                    </span>
                                </div>
                            </li>
                            <li className="flex items-center group">
                                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                    <Mail size={18} className="text-amber-500 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Email</span>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                        {settings.contactEmail}
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800/50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                        <span>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</span>
                        <div className="flex items-center gap-6">
                            <Link href="/dieu-khoan-su-dung" className="hover:text-amber-500 transition-colors">
                                Điều khoản sử dụng
                            </Link>
                            <Link href="/chinh-sach-bao-mat" className="hover:text-amber-500 transition-colors">
                                Chính sách bảo mật
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
