import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { getSiteSettings } from '@/lib/settings'

// Force dynamic rendering - settings can change
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const settings = await getSiteSettings()

    return (
        <>
            <Header settings={settings} />
            <main>{children}</main>
            <Footer settings={settings} />
        </>
    )
}
