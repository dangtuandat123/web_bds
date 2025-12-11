import { getSiteSettings } from '@/lib/settings'
import ContactForm from '@/components/modules/contact/contact-form'

export async function generateMetadata() {
    const settings = await getSiteSettings()
    return {
        title: `Liên hệ tư vấn | ${settings.siteName}`,
        description: 'Liên hệ với đội ngũ tư vấn bất động sản chuyên nghiệp',
    }
}

export default async function ContactPage() {
    const settings = await getSiteSettings()

    return <ContactForm settings={settings} />
}
