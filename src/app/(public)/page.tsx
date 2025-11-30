import prisma from '@/lib/prisma'
import Hero from '@/components/modules/home/hero'
import ProjectCard from '@/components/modules/project-card'
import ListingCard from '@/components/modules/listing-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getFeaturedData() {
    const [projects, listings] = await Promise.all([
        // Get 3 recent projects
        prisma.project.findMany({
            take: 3,
            where: { status: 'SELLING' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                priceRange: true,
                location: true,
                fullLocation: true,
                thumbnailUrl: true,
            },
        }),
        // Get 4 recent active listings
        prisma.listing.findMany({
            take: 4,
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                direction: true,
                location: true,
                fullLocation: true,
                thumbnailUrl: true,
                type: true,
            },
        }),
    ])

    return { projects, listings }
}

// Category mapping from DB to Vietnamese
const categoryMap: Record<string, string> = {
    APARTMENT: 'Căn hộ chung cư',
    HOUSE: 'Nhà phố - Biệt thự',
    LAND: 'Đất nền dự án',
    VILLA: 'Biệt  thự',
}

export default async function HomePage() {
    const { projects, listings } = await getFeaturedData()

    // Generate tags for listings based on type
    const getListingTags = (listing: any) => {
        const tags: string[] = []
        if (listing.type === 'APARTMENT') tags.push('Căn hộ')
        if (listing.type === 'HOUSE') tags.push('Nhà riêng')
        if (listing.type === 'LAND') tags.push('Đất nền')
        if (listing.type === 'RENT') tags.push('Cho thuê')
        return tags
    }

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <Hero />

            {/* Featured Projects Section */}
            <section className="py-20 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
                            Dự Án Nổi Bật
                        </h2>
                        <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full mb-4"></div>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            Tuyển chọn những dự án có tiềm năng sinh lời tốt nhất hiện nay
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                id={project.id}
                                title={project.name}
                                category={categoryMap[project.category] || project.category}
                                categoryId={project.category.toLowerCase()}
                                price={project.priceRange}
                                location={project.location}
                                fullLocation={project.fullLocation}
                                image={project.thumbnailUrl}
                                slug={project.slug}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Listings Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
                                Bất Động Sản Mới
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Cập nhật liên tục các sản phẩm hot nhất thị trường
                            </p>
                        </div>
                        <Link
                            href="/listings"
                            className="hidden md:flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors"
                        >
                            Xem tất cả <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {listings.map((listing, index) => (
                            <div
                                key={listing.id}
                                className={`animate-fade-in-up delay-${(index % 4) * 100}`}
                            >
                                <ListingCard
                                    id={listing.id}
                                    title={listing.title}
                                    price={listing.price}
                                    area={listing.area}
                                    bedrooms={listing.bedrooms}
                                    bathrooms={listing.bathrooms}
                                    direction={listing.direction || undefined}
                                    location={listing.location}
                                    fullLocation={listing.fullLocation}
                                    image={listing.thumbnailUrl}
                                    tags={getListingTags(listing)}
                                    slug={listing.slug}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 md:hidden">
                        <Link href="/listings">
                            <button className="bg-slate-100 text-slate-800 px-8 py-3 rounded-full font-bold text-sm">
                                Xem tất cả
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
