import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'

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
            <main className="flex-1">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
