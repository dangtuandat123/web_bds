import prisma from '@/lib/prisma'

export interface SiteSettings {
    // General
    siteName: string
    siteLogo: string
    siteDescription: string
    // Contact
    contactPhone: string
    contactEmail: string
    contactAddress: string
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
    contactPhone: '0912 345 678',
    contactEmail: 'contact@happyland.vn',
    contactAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
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
                case 'contact_phone': result.contactPhone = s.value || defaultSettings.contactPhone; break
                case 'contact_email': result.contactEmail = s.value || defaultSettings.contactEmail; break
                case 'contact_address': result.contactAddress = s.value || defaultSettings.contactAddress; break
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
