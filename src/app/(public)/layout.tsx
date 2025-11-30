import type { ReactNode } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function PublicLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    )
}
