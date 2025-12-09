'use client'

import { useState, useTransition } from 'react'
import { Phone, User, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { submitLead } from '@/app/actions/lead'

interface ContactFormProps {
    title?: string
    price?: string
    referenceUrl?: string
}

export default function ContactForm({ title, price, referenceUrl }: ContactFormProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: `Tôi quan tâm đến: ${title || 'sản phẩm này'}`
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            const result = await submitLead({
                ...formData,
                referenceUrl
            })

            if (result.success) {
                toast.success(result.message)
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    message: `Tôi quan tâm đến: ${title || 'sản phẩm này'}`
                })
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 sticky top-24">
            {/* Price Display */}
            {price && (
                <div className="text-center mb-6 pb-6 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Giá tham khảo
                    </span>
                    <div className="text-3xl font-black text-red-600">{price}</div>
                </div>
            )}

            {/* Form Title */}
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-amber-500 mr-3 rounded-full"></span>
                Liên hệ tư vấn
            </h3>

            {/* Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
                {/* Name Input */}
                <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        required
                        disabled={isPending}
                        placeholder="Họ tên của bạn"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Phone Input */}
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input
                        type="tel"
                        required
                        disabled={isPending}
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Message Textarea */}
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <textarea
                        rows={4}
                        disabled={isPending}
                        placeholder="Nội dung tin nhắn..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-amber-500/30 transition-all transform hover:-translate-y-1 uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
                </button>

                {/* Call Button */}
                <button
                    type="button"
                    disabled={isPending}
                    className="w-full bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 transition-all flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Phone size={18} className="mr-2" /> 0912 345 678
                </button>
            </form>

            {/* Help Text */}
            <p className="text-xs text-slate-400 text-center mt-4">
                Hoặc gọi trực tiếp để được tư vấn ngay
            </p>
        </div>
    )
}
