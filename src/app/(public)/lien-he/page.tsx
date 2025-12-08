import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/settings'
import ContactForm from '@/components/modules/contact/contact-form'

export const metadata: Metadata = {
    title: 'Liên hệ tư vấn | Happy Land Real Estate',
    description: 'Liên hệ với đội ngũ tư vấn bất động sản chuyên nghiệp của Happy Land',
}

export default async function ContactPage() {
    const settings = await getSiteSettings()

    return <ContactForm settings={settings} />
}
