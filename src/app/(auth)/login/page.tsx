import { Building } from 'lucide-react'
import Image from 'next/image'
import { getSettings } from '@/app/actions/settings'
import LoginForm from '@/components/auth/login-form'

export default async function LoginPage() {
    const result = await getSettings()
    const settings = result.data || {}
    const siteName = settings.site_name || 'Admin Panel'
    const siteLogo = settings.site_logo

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 relative overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="max-w-md text-center">
                        {/* Large Icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 shadow-2xl">
                            <Building className="text-white" size={48} />
                        </div>

                        <h1 className="text-4xl font-bold mb-4">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-amber-100 text-lg leading-relaxed">
                            Quản lý dự án, listing và khách hàng của bạn một cách dễ dàng với hệ thống admin hiện đại.
                        </p>

                        {/* Features */}
                        <div className="mt-12 space-y-4 text-left">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Building size={16} />
                                </div>
                                <span>Quản lý dự án & bất động sản</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Building size={16} />
                                </div>
                                <span>Theo dõi khách hàng tiềm năng</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Building size={16} />
                                </div>
                                <span>Chatbot AI hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full" />
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-10">
                        {siteLogo && !siteLogo.includes('logo.png') ? (
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-6 overflow-hidden bg-white border border-slate-200">
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    width={80}
                                    height={80}
                                    className="object-contain p-2"
                                />
                            </div>
                        ) : (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg mb-6">
                                <Building className="text-white" size={40} />
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-slate-800">{siteName}</h1>
                        <p className="text-slate-500 mt-2">Đăng nhập để tiếp tục</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                        <LoginForm />
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-400 text-sm mt-8">
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
