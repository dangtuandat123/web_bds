import prisma from '@/lib/prisma'

export interface SiteSettings {
    // General
    siteName: string
    siteLogo: string
    siteDescription: string
    // Hero
    heroBadge: string
    heroTitle1: string
    heroTitle2: string
    heroSubtitle: string
    // Contact
    contactPhone: string
    contactEmail: string
    contactAddress: string
    contactWorkingHours: string
    // Social
    socialFacebook: string
    socialZalo: string
    socialYoutube: string
    socialTiktok: string
    // Backgrounds
    bgHome: string
    bgProjects: string
    bgListings: string
    // API
    apiOpenrouter: string
    // Legal
    termsOfUse: string
    privacyPolicy: string
}

const defaultSettings: SiteSettings = {
    siteName: 'Happy Land Real Estate',
    siteLogo: '',
    siteDescription: 'Nền tảng bất động sản hàng đầu Việt Nam',
    heroBadge: 'Happy Land Real Estate',
    heroTitle1: 'Kiến Tạo Giá Trị',
    heroTitle2: 'Vun Đắp Tương Lai',
    heroSubtitle: 'Hệ thống phân phối và giao dịch bất động sản uy tín hàng đầu tại TP. Thủ Đức. Nơi trao gửi niềm tin trọn vẹn.',
    contactPhone: '0912 345 678',
    contactEmail: 'contact@happyland.vn',
    contactAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    contactWorkingHours: 'Thứ 2 - Chủ nhật: 8:00 - 21:00',
    socialFacebook: '',
    socialZalo: '',
    socialYoutube: '',
    socialTiktok: '',
    bgHome: '',
    bgProjects: '',
    bgListings: '',
    apiOpenrouter: '',
    termsOfUse: '',
    privacyPolicy: '',
}

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const settings = await prisma.setting.findMany()

        const result = { ...defaultSettings }

        settings.forEach(s => {
            switch (s.key) {
                case 'site_name': result.siteName = s.value || defaultSettings.siteName; break
                case 'site_logo': result.siteLogo = s.value; break
                case 'site_description': result.siteDescription = s.value || defaultSettings.siteDescription; break
                case 'hero_badge': result.heroBadge = s.value || defaultSettings.heroBadge; break
                case 'hero_title1': result.heroTitle1 = s.value || defaultSettings.heroTitle1; break
                case 'hero_title2': result.heroTitle2 = s.value || defaultSettings.heroTitle2; break
                case 'hero_subtitle': result.heroSubtitle = s.value || defaultSettings.heroSubtitle; break
                case 'contact_phone': result.contactPhone = s.value || defaultSettings.contactPhone; break
                case 'contact_email': result.contactEmail = s.value || defaultSettings.contactEmail; break
                case 'contact_address': result.contactAddress = s.value || defaultSettings.contactAddress; break
                case 'contact_working_hours': result.contactWorkingHours = s.value || defaultSettings.contactWorkingHours; break
                case 'social_facebook': result.socialFacebook = s.value; break
                case 'social_zalo': result.socialZalo = s.value; break
                case 'social_youtube': result.socialYoutube = s.value; break
                case 'social_tiktok': result.socialTiktok = s.value; break
                case 'bg_home': result.bgHome = s.value; break
                case 'bg_projects': result.bgProjects = s.value; break
                case 'bg_listings': result.bgListings = s.value; break
                case 'api_openrouter': result.apiOpenrouter = s.value; break
                case 'terms_of_use': result.termsOfUse = s.value; break
                case 'privacy_policy': result.privacyPolicy = s.value; break
            }
        })

        return result
    } catch (error) {
        console.error('Error fetching site settings:', error)
        return defaultSettings
    }
}
