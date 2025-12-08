import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import SettingsForm from '@/components/admin/settings/settings-form'
import { initializeDefaultSettings } from '@/app/actions/settings'

export const metadata: Metadata = {
    title: 'Cài đặt | Admin',
    description: 'Quản lý cài đặt website',
}

export default async function AdminSettingsPage() {
    // Initialize default settings if needed
    await initializeDefaultSettings()

    // Get all settings
    const settings = await prisma.setting.findMany()

    // Convert to object
    const settingsObj: Record<string, string> = {}
    settings.forEach(s => {
        settingsObj[s.key] = s.value
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Cài đặt</h1>
                <p className="text-slate-600 mt-2">
                    Quản lý thông tin và cấu hình website
                </p>
            </div>

            {/* Settings Form */}
            <SettingsForm initialSettings={settingsObj} />
        </div>
    )
}
