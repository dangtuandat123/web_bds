import prisma from '@/lib/prisma'
import HeroSearch from '@/components/modules/home/hero-search'
import ProjectCard from '@/components/modules/project-card'
import ListingCard from '@/components/modules/listing-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getData() {
    const [projects, listings] = await Promise.all([
        prisma.project.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: { status: 'SELLING' },
        }),
        prisma.listing.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            where: { isActive: true },
        }),
    ])

    return { projects, listings }
}

export default async function HomePage() {
    const { projects, listings } = await getData()

    return (
        <>
            {/* Hero Section */}
            <HeroSearch />

            {/* Featured Projects Section */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Dự án nổi bật</h2>
                            <p className="text-slate-600 mt-2">
                                Những dự án bất động sản được yêu thích nhất
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/du-an">
                                Xem tất cả
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Chưa có dự án nào
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Latest Listings Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Tin đăng mới nhất</h2>
                            <p className="text-slate-600 mt-2">
                                Cập nhật hàng ngày từ hàng ngàn tin đăng
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/mua-ban">
                                Xem tất cả
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {listings.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Chưa có listing nào
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {listings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
