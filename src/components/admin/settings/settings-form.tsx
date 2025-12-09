'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Save, Settings, Phone, Globe, Key, Image as ImageIcon, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import ImageUpload from '@/components/admin/image-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { updateSettings } from '@/app/actions/settings'
import RichTextEditor from '@/components/admin/projects/rich-text-editor'

interface SettingsFormProps {
    initialSettings: Record<string, string>
}

interface ApiStatusInfo {
    valid: boolean
    error?: string
    label?: string
    usage?: number
    limit?: number | null
    isFreeTier?: boolean
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [settings, setSettings] = useState(initialSettings)
    const [isCheckingKey, setIsCheckingKey] = useState(false)
    const [apiStatus, setApiStatus] = useState<ApiStatusInfo | null>(null)

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        // Clear API status when key changes
        if (key === 'api_openrouter') {
            setApiStatus(null)
        }
    }

    const checkOpenRouterKey = async () => {
        const apiKey = settings.api_openrouter
        if (!apiKey) {
            toast.error('Vui lòng nhập API key trước')
            return
        }

        setIsCheckingKey(true)
        try {
            const response = await fetch('/api/admin/check-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey }),
            })
            const data = await response.json()
            setApiStatus(data)

            if (data.valid) {
                toast.success('API Key hợp lệ!')
            } else {
                toast.error(data.error || 'API Key không hợp lệ')
            }
        } catch (error) {
            toast.error('Không thể kiểm tra API key')
            setApiStatus({ valid: false, error: 'Lỗi kết nối' })
        } finally {
            setIsCheckingKey(false)
        }
    }

    const handleSubmit = () => {
        startTransition(async () => {
            const settingsArray = Object.entries(settings).map(([key, value]) => {
                let groupName = 'general'
                let type = 'text'

                if (key.startsWith('contact_')) groupName = 'contact'
                else if (key.startsWith('social_')) groupName = 'social'
                else if (key.startsWith('api_')) groupName = 'api'
                else if (key.startsWith('bg_')) { groupName = 'background'; type = 'image' }
                else if (key === 'terms_of_use' || key === 'privacy_policy') { groupName = 'legal'; type = 'html' }
                else if (key === 'site_logo') type = 'image'

                return { key, value, type, groupName }
            })

            const result = await updateSettings(settingsArray)

            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="general" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Chung
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Liên hệ
                    </TabsTrigger>
                    <TabsTrigger value="social" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Mạng XH
                    </TabsTrigger>
                    <TabsTrigger value="api" className="gap-2">
                        <Key className="h-4 w-4" />
                        API
                    </TabsTrigger>
                    <TabsTrigger value="background" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Hình nền
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Pháp lý
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Thông tin website</h3>
                    <Separator />

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="site_name">Tên website</Label>
                            <Input
                                id="site_name"
                                value={settings.site_name || ''}
                                onChange={e => handleChange('site_name', e.target.value)}
                                placeholder="Tên website của bạn"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="block mb-2">Logo website</Label>
                            <div className="mt-2">
                                <ImageUpload
                                    value={settings.site_logo || ''}
                                    onChange={(url) => handleChange('site_logo', url)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site_description">Mô tả website</Label>
                            <Textarea
                                id="site_description"
                                value={settings.site_description || ''}
                                onChange={e => handleChange('site_description', e.target.value)}
                                placeholder="Nền tảng bất động sản hàng đầu..."
                                rows={3}
                            />
                        </div>

                        <Separator className="my-4" />
                        <h4 className="font-medium text-slate-700">Nội dung trang chủ (Hero)</h4>

                        <div className="space-y-2">
                            <Label htmlFor="hero_badge">Badge (dòng nhỏ trên cùng)</Label>
                            <Input
                                id="hero_badge"
                                value={settings.hero_badge || ''}
                                onChange={e => handleChange('hero_badge', e.target.value)}
                                placeholder="Tên website của bạn"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero_title1">Tiêu đề dòng 1</Label>
                            <Input
                                id="hero_title1"
                                value={settings.hero_title1 || ''}
                                onChange={e => handleChange('hero_title1', e.target.value)}
                                placeholder="Kiến Tạo Giá Trị"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero_title2">Tiêu đề dòng 2</Label>
                            <Input
                                id="hero_title2"
                                value={settings.hero_title2 || ''}
                                onChange={e => handleChange('hero_title2', e.target.value)}
                                placeholder="Vun Đắp Tương Lai"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero_subtitle">Mô tả ngắn</Label>
                            <Textarea
                                id="hero_subtitle"
                                value={settings.hero_subtitle || ''}
                                onChange={e => handleChange('hero_subtitle', e.target.value)}
                                placeholder="Hệ thống phân phối và giao dịch bất động sản..."
                                rows={2}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Contact Settings */}
                <TabsContent value="contact" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Thông tin liên hệ</h3>
                    <Separator />

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Số điện thoại</Label>
                            <Input
                                id="contact_phone"
                                value={settings.contact_phone || ''}
                                onChange={e => handleChange('contact_phone', e.target.value)}
                                placeholder="0912 345 678"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Email</Label>
                            <Input
                                id="contact_email"
                                type="email"
                                value={settings.contact_email || ''}
                                onChange={e => handleChange('contact_email', e.target.value)}
                                placeholder="contact@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_address">Địa chỉ</Label>
                            <Textarea
                                id="contact_address"
                                value={settings.contact_address || ''}
                                onChange={e => handleChange('contact_address', e.target.value)}
                                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_working_hours">Giờ làm việc</Label>
                            <Input
                                id="contact_working_hours"
                                value={settings.contact_working_hours || ''}
                                onChange={e => handleChange('contact_working_hours', e.target.value)}
                                placeholder="Thứ 2 - Chủ nhật: 8:00 - 21:00"
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Social Media Settings */}
                <TabsContent value="social" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Mạng xã hội</h3>
                    <Separator />

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="social_facebook">Facebook URL</Label>
                            <Input
                                id="social_facebook"
                                value={settings.social_facebook || ''}
                                onChange={e => handleChange('social_facebook', e.target.value)}
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="social_zalo">Zalo</Label>
                            <Input
                                id="social_zalo"
                                value={settings.social_zalo || ''}
                                onChange={e => handleChange('social_zalo', e.target.value)}
                                placeholder="https://zalo.me/... hoặc số điện thoại"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="social_youtube">YouTube URL</Label>
                            <Input
                                id="social_youtube"
                                value={settings.social_youtube || ''}
                                onChange={e => handleChange('social_youtube', e.target.value)}
                                placeholder="https://youtube.com/@..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="social_tiktok">TikTok URL</Label>
                            <Input
                                id="social_tiktok"
                                value={settings.social_tiktok || ''}
                                onChange={e => handleChange('social_tiktok', e.target.value)}
                                placeholder="https://tiktok.com/@..."
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* API Settings */}
                <TabsContent value="api" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">API Keys</h3>
                    <Separator />

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="api_openrouter">OpenRouter API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="api_openrouter"
                                    type="password"
                                    value={settings.api_openrouter || ''}
                                    onChange={e => handleChange('api_openrouter', e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={checkOpenRouterKey}
                                    disabled={isCheckingKey}
                                    className="shrink-0"
                                >
                                    {isCheckingKey ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></span>
                                            Đang kiểm tra...
                                        </span>
                                    ) : (
                                        'Kiểm tra'
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                API key cho chatbot AI. Lấy từ openrouter.ai
                            </p>

                            {/* API Status Display */}
                            {apiStatus && (
                                <div className={`mt-3 p-4 rounded-lg border ${apiStatus.valid
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}>
                                    {apiStatus.valid ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-800">API Key hợp lệ</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                                <div className="bg-white rounded-lg p-3 border border-green-100">
                                                    <p className="text-slate-500 text-xs">Tên key</p>
                                                    <p className="font-semibold text-slate-800">{apiStatus.label}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-green-100">
                                                    <p className="text-slate-500 text-xs">Credit đã dùng</p>
                                                    <p className="font-semibold text-slate-800">
                                                        ${apiStatus.usage?.toFixed(4) || '0.0000'}
                                                        {apiStatus.limit && (
                                                            <span className="text-slate-400 font-normal"> / ${apiStatus.limit}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {apiStatus.isFreeTier && (
                                                    <div className="col-span-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                                                        <p className="text-amber-700 text-xs flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Đang sử dụng Free Tier
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <span className="font-medium text-red-800">{apiStatus.error}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Background Settings */}
                <TabsContent value="background" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Hình nền trang</h3>
                    <Separator />

                    <div className="grid gap-8">
                        <div className="space-y-3">
                            <Label className="block text-base font-medium">Hình nền trang chủ</Label>
                            <div className="flex justify-start">
                                <ImageUpload
                                    value={settings.bg_home || ''}
                                    onChange={(url) => handleChange('bg_home', url)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="block text-base font-medium">Hình nền trang dự án</Label>
                            <div className="flex justify-start">
                                <ImageUpload
                                    value={settings.bg_projects || ''}
                                    onChange={(url) => handleChange('bg_projects', url)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="block text-base font-medium">Hình nền trang sàn giao dịch</Label>
                            <div className="flex justify-start">
                                <ImageUpload
                                    value={settings.bg_listings || ''}
                                    onChange={(url) => handleChange('bg_listings', url)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Legal Settings */}
                <TabsContent value="legal" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Trang pháp lý</h3>
                    <Separator />

                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label>Điều khoản sử dụng</Label>
                            <RichTextEditor
                                value={settings.terms_of_use || ''}
                                onChange={(html) => handleChange('terms_of_use', html)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Chính sách bảo mật</Label>
                            <RichTextEditor
                                value={settings.privacy_policy || ''}
                                onChange={(html) => handleChange('privacy_policy', html)}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
                <Button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
            </div>
        </div>
    )
}
