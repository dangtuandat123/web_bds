import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const settings = await getSiteSettings()

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar siteName={settings.siteName} />
            <main className="flex-1 w-full">
                {/* Add top padding on mobile for fixed header */}
                <div className="pt-14 lg:pt-0">
                    <div className="p-4 md:p-6 lg:p-8">{children}</div>
                </div>
            </main>
        </div>
    )
}

