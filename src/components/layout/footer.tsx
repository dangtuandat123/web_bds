'use client'

import Link from 'next/link'
import { Building, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react'

interface FooterProps {
    onRegister?: () => void
}

export default function Footer({ onRegister }: FooterProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onRegister) onRegister()
    }

    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 relative overflow-hidden">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
                {/* Company Info */}
                <div className="md:col-span-1">
                    <div className="flex flex-col text-white font-bold mb-6">
                        <div className="flex items-center text-2xl">
                            <Building className="text-amber-500 mr-2" /> HAPPY LAND
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] ml-8 uppercase mt-1">
                            Real Estate
                        </span>
                    </div>
                    <p className="mb-8 text-sm leading-relaxed text-slate-400 font-light">
                        Đối tác tin cậy cho mọi nhu cầu đầu tư và an cư. Chúng tôi cam kết mang đến những sản phẩm giá trị thực.
                    </p>
                    <div className="flex space-x-3">
                        {[Facebook, Instagram, Youtube].map((Icon, idx) => (
                            <div
                                key={idx}
                                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all cursor-pointer transform hover:-translate-y-1"
                            >
                                <Icon size={18} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="md:col-span-2 pl-0 md:pl-12">
                    <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-wide relative inline-block">
                        Thông tin liên hệ
                        <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-amber-500"></span>
                    </h4>
                    <ul className="space-y-6 text-sm">
                        <li className="flex items-start group">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                <MapPin size={16} className="text-amber-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="mt-1.5 text-slate-400 group-hover:text-slate-200 transition-colors">
                                Số 123 Đường Nguyễn Duy Trinh, P. Bình Trưng Tây, TP. Thủ Đức, TP.HCM
                            </span>
                        </li>
                        <li className="flex items-center group">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                <Phone size={16} className="text-amber-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold text-white text-xl group-hover:text-amber-500 transition-colors">
                                0912 345 678
                            </span>
                        </li>
                        <li className="flex items-center group">
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                                <Mail size={16} className="text-amber-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-slate-400 group-hover:text-white transition-colors">
                                info@happyland.net.vn
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-wide relative inline-block">
                        Đăng ký nhận tin
                        <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-amber-500"></span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                        Nhận thông tin dự án mới nhất và ưu đãi độc quyền.
                    </p>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            required
                            placeholder="Email của bạn"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                            type="submit"
                            className="w-full bg-amber-500 text-white py-3 rounded font-bold hover:bg-amber-600 transition-colors uppercase text-xs tracking-wider"
                        >
                            Đăng ký ngay
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-600 flex flex-col md:flex-row justify-between container mx-auto px-4">
                <span>© 2023 Happy Land Real Estate. All rights reserved.</span>
                <div className="space-x-4 mt-2 md:mt-0">
                    <span className="hover:text-white cursor-pointer">Điều khoản sử dụng</span>
                    <span className="hover:text-white cursor-pointer">Chính sách bảo mật</span>
                </div>
            </div>
        </footer>
    )
}
