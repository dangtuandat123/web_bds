'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'

// Get all settings
export async function getSettings() {
    try {
        const settings = await prisma.setting.findMany({
            orderBy: { groupName: 'asc' },
        })

        // Convert to object for easier access
        const settingsObj: Record<string, string> = {}
        settings.forEach(s => {
            settingsObj[s.key] = s.value
        })

        return { success: true, data: settingsObj, raw: settings }
    } catch (error) {
        console.error('Error fetching settings:', error)
        return { success: false, data: {}, raw: [] }
    }
}

// Get a single setting by key
export async function getSetting(key: string) {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        })
        return setting?.value || null
    } catch (error) {
        console.error('Error fetching setting:', error)
        return null
    }
}

// Get settings by group
export async function getSettingsByGroup(groupName: string) {
    try {
        const settings = await prisma.setting.findMany({
            where: { groupName },
        })

        const settingsObj: Record<string, string> = {}
        settings.forEach(s => {
            settingsObj[s.key] = s.value
        })

        return settingsObj
    } catch (error) {
        console.error('Error fetching settings by group:', error)
        return {}
    }
}

// Update or create a single setting
export async function upsertSetting(key: string, value: string, type: string = 'text', groupName: string = 'general') {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        await prisma.setting.upsert({
            where: { key },
            update: { value, type, groupName },
            create: { key, value, type, groupName },
        })

        revalidatePath('/admin/settings')
        revalidatePath('/')

        return { success: true, message: 'Đã lưu cài đặt' }
    } catch (error) {
        console.error('Error upserting setting:', error)
        return { success: false, message: 'Không thể lưu cài đặt' }
    }
}

// Bulk update settings
export async function updateSettings(settings: Array<{ key: string; value: string; type?: string; groupName?: string }>) {
    // Authorization check
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: 'Unauthorized' }
    }

    try {
        // Use transaction to update all settings
        await prisma.$transaction(
            settings.map(s =>
                prisma.setting.upsert({
                    where: { key: s.key },
                    update: { value: s.value, type: s.type || 'text', groupName: s.groupName || 'general' },
                    create: { key: s.key, value: s.value, type: s.type || 'text', groupName: s.groupName || 'general' },
                })
            )
        )

        revalidatePath('/admin/settings')
        revalidatePath('/')
        revalidatePath('/du-an')
        revalidatePath('/nha-dat')

        return { success: true, message: 'Đã lưu tất cả cài đặt' }
    } catch (error) {
        console.error('Error updating settings:', error)
        return { success: false, message: 'Không thể lưu cài đặt' }
    }
}

// Initialize default settings
export async function initializeDefaultSettings() {
    const defaults = [
        // General
        { key: 'site_name', value: 'Bất Động Sản', type: 'text', groupName: 'general' },
        { key: 'site_logo', value: '/logo.png', type: 'image', groupName: 'general' },
        { key: 'site_description', value: 'Nền tảng bất động sản uy tín', type: 'text', groupName: 'general' },

        // Contact
        { key: 'contact_phone', value: '0912 345 678', type: 'text', groupName: 'contact' },
        { key: 'contact_email', value: 'contact@example.com', type: 'text', groupName: 'contact' },
        { key: 'contact_address', value: 'TP. Hồ Chí Minh', type: 'text', groupName: 'contact' },

        // Social
        { key: 'social_facebook', value: '', type: 'text', groupName: 'social' },
        { key: 'social_zalo', value: '', type: 'text', groupName: 'social' },
        { key: 'social_youtube', value: '', type: 'text', groupName: 'social' },
        { key: 'social_tiktok', value: '', type: 'text', groupName: 'social' },

        // API
        { key: 'api_openrouter', value: '', type: 'text', groupName: 'api' },

        // Background
        { key: 'bg_home', value: '', type: 'image', groupName: 'background' },
        { key: 'bg_projects', value: '', type: 'image', groupName: 'background' },
        { key: 'bg_listings', value: '', type: 'image', groupName: 'background' },

        // Legal
        { key: 'terms_of_use', value: '<h1>Điều khoản sử dụng</h1><p>Nội dung điều khoản...</p>', type: 'html', groupName: 'legal' },
        { key: 'privacy_policy', value: '<h1>Chính sách bảo mật</h1><p>Nội dung chính sách...</p>', type: 'html', groupName: 'legal' },
    ]

    try {
        for (const setting of defaults) {
            const exists = await prisma.setting.findUnique({ where: { key: setting.key } })
            if (!exists) {
                await prisma.setting.create({ data: setting })
            }
        }
        return { success: true, message: 'Đã khởi tạo cài đặt mặc định' }
    } catch (error) {
        console.error('Error initializing settings:', error)
        return { success: false, message: 'Không thể khởi tạo cài đặt' }
    }
}
