'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createLead } from '@/app/actions/lead'

interface ContactFormProps {
    settings: {
        siteName: string
        contactPhone: string
        contactEmail: string
        contactAddress: string
        contactWorkingHours?: string
        socialFacebook?: string
        socialZalo?: string
    }
}

export default function ContactForm({ settings }: ContactFormProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.phone) {
            toast.error('Vui lòng nhập họ tên và số điện thoại')
            return
        }

        startTransition(async () => {
            const form = new FormData()
            form.append('name', formData.name)
            form.append('phone', formData.phone)
            form.append('email', formData.email)
            form.append('message', formData.message)
            form.append('source', 'CONTACT_PAGE')

            const result = await createLead(form)

            if (result.success) {
                toast.success('Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.')
                setFormData({ name: '', phone: '', email: '', message: '' })
            } else {
                toast.error(result.error || 'Có lỗi xảy ra, vui lòng thử lại')
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white/20 rounded-full">
                            <MessageCircle className="h-12 w-12" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ tư vấn</h1>
                    <p className="text-amber-100 text-lg max-w-2xl mx-auto">
                        Nhóm chuyên gia {settings.siteName} sẵn sàng tư vấn miễn phí 24/7.
                        Hãy để lại thông tin, chúng tôi sẽ liên hệ ngay!
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin liên hệ</h2>
                            <p className="text-slate-600 mb-8">
                                Đội ngũ tư vấn viên giàu kinh nghiệm của chúng tôi luôn sẵn sàng hỗ trợ bạn
                                tìm kiếm bất động sản phù hợp nhất.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Phone className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Hotline tư vấn</h3>
                                    <p className="text-2xl font-bold text-amber-600">{settings.contactPhone}</p>
                                    <p className="text-sm text-slate-500">Miễn phí cuộc gọi</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Mail className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Email</h3>
                                    <p className="text-slate-600">{settings.contactEmail}</p>
                                    <p className="text-sm text-slate-500">Phản hồi trong 24h</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <MapPin className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Văn phòng</h3>
                                    <p className="text-slate-600">{settings.contactAddress}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Giờ làm việc</h3>
                                    <p className="text-slate-600">{settings.contactWorkingHours || 'Thứ 2 - Chủ nhật: 8:00 - 21:00'}</p>
                                    <p className="text-sm text-slate-500">Hỗ trợ online 24/7</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(settings.socialFacebook || settings.socialZalo) && (
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-4">Kết nối với chúng tôi</h3>
                                <div className="flex gap-3">
                                    {settings.socialFacebook && (
                                        <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Facebook
                                        </a>
                                    )}
                                    {settings.socialZalo && (
                                        <a href={settings.socialZalo.startsWith('http') ? settings.socialZalo : `https://zalo.me/${settings.socialZalo}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                            Zalo
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Building className="h-6 w-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Đăng ký tư vấn</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ và tên *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Nhập số điện thoại"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Nhập email (không bắt buộc)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Nội dung cần tư vấn</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="VD: Tôi quan tâm đến căn hộ 2PN tại quận 7..."
                                    rows={4}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg"
                            >
                                <Send className="h-5 w-5 mr-2" />
                                {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
                            </Button>

                            <p className="text-xs text-slate-500 text-center">
                                Bằng việc gửi form, bạn đồng ý với{' '}
                                <a href="/dieu-khoan-su-dung" className="text-amber-600 hover:underline">Điều khoản sử dụng</a>
                                {' '}và{' '}
                                <a href="/chinh-sach-bao-mat" className="text-amber-600 hover:underline">Chính sách bảo mật</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
