import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function PublicLayout({
    children,
}: {
    children: React.NodeNode
}) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    )
}
