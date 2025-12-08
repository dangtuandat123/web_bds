'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Save, Settings, Phone, Globe, Key, Image, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { updateSettings } from '@/app/actions/settings'

interface SettingsFormProps {
    initialSettings: Record<string, string>
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [settings, setSettings] = useState(initialSettings)

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
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
                        <Image className="h-4 w-4" />
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
                                placeholder="Happy Land Real Estate"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site_logo">Logo URL</Label>
                            <Input
                                id="site_logo"
                                value={settings.site_logo || ''}
                                onChange={e => handleChange('site_logo', e.target.value)}
                                placeholder="/logo.png hoặc https://..."
                            />
                            {settings.site_logo && (
                                <img src={settings.site_logo} alt="Logo preview" className="h-12 mt-2" />
                            )}
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
                            <Input
                                id="api_openrouter"
                                type="password"
                                value={settings.api_openrouter || ''}
                                onChange={e => handleChange('api_openrouter', e.target.value)}
                                placeholder="sk-or-v1-..."
                            />
                            <p className="text-xs text-slate-500">
                                API key cho chatbot AI. Lấy từ openrouter.ai
                            </p>
                        </div>
                    </div>
                </TabsContent>

                {/* Background Settings */}
                <TabsContent value="background" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Hình nền trang</h3>
                    <Separator />

                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="bg_home">Trang chủ</Label>
                            <Input
                                id="bg_home"
                                value={settings.bg_home || ''}
                                onChange={e => handleChange('bg_home', e.target.value)}
                                placeholder="URL hình nền trang chủ"
                            />
                            {settings.bg_home && (
                                <img src={settings.bg_home} alt="Home BG" className="h-24 w-full object-cover rounded mt-2" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bg_projects">Trang dự án</Label>
                            <Input
                                id="bg_projects"
                                value={settings.bg_projects || ''}
                                onChange={e => handleChange('bg_projects', e.target.value)}
                                placeholder="URL hình nền trang dự án"
                            />
                            {settings.bg_projects && (
                                <img src={settings.bg_projects} alt="Projects BG" className="h-24 w-full object-cover rounded mt-2" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bg_listings">Trang sàn giao dịch</Label>
                            <Input
                                id="bg_listings"
                                value={settings.bg_listings || ''}
                                onChange={e => handleChange('bg_listings', e.target.value)}
                                placeholder="URL hình nền trang sàn giao dịch"
                            />
                            {settings.bg_listings && (
                                <img src={settings.bg_listings} alt="Listings BG" className="h-24 w-full object-cover rounded mt-2" />
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Legal Settings */}
                <TabsContent value="legal" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Trang pháp lý</h3>
                    <Separator />

                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="terms_of_use">Điều khoản sử dụng (HTML)</Label>
                            <Textarea
                                id="terms_of_use"
                                value={settings.terms_of_use || ''}
                                onChange={e => handleChange('terms_of_use', e.target.value)}
                                placeholder="<h1>Điều khoản sử dụng</h1>..."
                                rows={10}
                                className="font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="privacy_policy">Chính sách bảo mật (HTML)</Label>
                            <Textarea
                                id="privacy_policy"
                                value={settings.privacy_policy || ''}
                                onChange={e => handleChange('privacy_policy', e.target.value)}
                                placeholder="<h1>Chính sách bảo mật</h1>..."
                                rows={10}
                                className="font-mono text-sm"
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
