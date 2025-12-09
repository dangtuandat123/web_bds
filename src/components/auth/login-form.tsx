'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
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
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white"
                        placeholder="admin@example.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Mật khẩu
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        required
                        className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Đang đăng nhập...
                    </>
                ) : (
                    <>
                        Đăng nhập
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>
    )
}
