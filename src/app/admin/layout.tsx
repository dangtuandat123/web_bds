import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/sidebar'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
