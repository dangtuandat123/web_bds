'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { changePasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

export default function ChangePasswordForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget // Save reference before async
        setIsLoading(true)

        const formData = new FormData(form)
        const result = await changePasswordAction(formData)

        if (result.error) {
            toast.error(result.error)
        } else if (result.success) {
            toast.success(result.message)
            // Reset form
            form.reset()
            // Redirect to dashboard after 1.5s
            setTimeout(() => {
                router.push('/admin')
            }, 1500)
        }

        setIsLoading(false)
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-sm text-slate-500 hover:text-amber-600 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Quay lại Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-white text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
                    <p className="text-amber-100 mt-2 text-sm">Bảo mật tài khoản của bạn</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                name="currentPassword"
                                placeholder="Nhập mật khẩu hiện tại"
                                className="pl-10 pr-10 h-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                name="newPassword"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                className="pl-10 pr-10 h-11"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Nhập lại mật khẩu mới"
                                className="pl-10 pr-10 h-11"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Đang xử lý...
                            </span>
                        ) : (
                            'Đổi mật khẩu'
                        )}
                    </Button>

                    {/* Tips */}
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2">💡 Lời khuyên bảo mật:</h4>
                        <ul className="text-xs text-amber-700 space-y-1">
                            <li>• Sử dụng mật khẩu có ít nhất 8 ký tự</li>
                            <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                            <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    )
}
