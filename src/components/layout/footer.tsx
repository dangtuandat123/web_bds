import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">Happy Land</h3>
                        <p className="text-sm">
                            Hệ thống phân phối và giao dịch bất động sản uy tín hàng đầu tại TP. Thủ Đức
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Liên kết</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/du-an" className="hover:text-amber-500 transition-colors">
                                    Dự án
                                </Link>
                            </li>
                            <li>
                                <Link href="/mua-ban" className="hover:text-amber-500 transition-colors">
                                    Mua bán
                                </Link>
                            </li>
                            <li>
                                <Link href="/cho-thue" className="hover:text-amber-500 transition-colors">
                                    Cho thuê
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>TP. Thủ Đức, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <a href="tel:0123456789" className="hover:text-amber-500">
                                    0123 456 789
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <a href="mailto:contact@happyland.vn" className="hover:text-amber-500">
                                    contact@happyland.vn
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Theo dõi</h4>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 transition-colors"
                            >
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Happy Land Real Estate. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
