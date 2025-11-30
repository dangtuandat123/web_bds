'use client'

import { Building } from 'lucide-react'
import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = await loginAction(formData)

            if (result.success) {
                router.push('/admin')
                router.refresh()
            } else if (result.error) {
                setError(result.error)
            }
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg mb-4">
                        <Building className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Happy Land Admin</h1>
                    <p className="text-slate-600 mt-2">Đăng nhập để quản lý hệ thống</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                defaultValue="admin@happyland.net.vn"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="admin@happyland.net.vn"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        <p>Tài khoản demo: admin@happyland.net.vn / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
