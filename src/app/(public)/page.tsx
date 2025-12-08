import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import Hero from '@/components/modules/home/hero'
import AdvancedSearch from '@/components/modules/search/advanced-search'
import ProjectCard from '@/components/modules/project-card'
import ListingCard from '@/components/modules/listing-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    return {
        title: `${settings.siteName} | ${settings.siteDescription}`,
        description: settings.siteDescription,
    }
}

async function getLocations() {
    const locations = await prisma.location.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { name: true },
    })
    return locations.map(l => l.name)
}

async function getFeaturedData() {
    const [projects, listings, news] = await Promise.all([
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
        // Get 3 recent news
        prisma.news.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                category: true,
                thumbnailUrl: true,
                createdAt: true,
            },
        }),
    ])

    return { projects, listings, news }
}

// Category mapping from DB to Vietnamese
const categoryMap: Record<string, string> = {
    APARTMENT: 'Căn hộ chung cư',
    HOUSE: 'Nhà phố - Biệt thự',
    LAND: 'Đất nền dự án',
    VILLA: 'Biệt thự',
}

// News category mapping
const newsCategoryMap: Record<string, string> = {
    MARKET: 'Thị trường',
    FENG_SHUI: 'Phong thủy',
    LEGAL: 'Pháp lý',
}

export default async function HomePage() {
    const [{ projects, listings, news }, locations, settings] = await Promise.all([
        getFeaturedData(),
        getLocations(),
        getSiteSettings(),
    ])

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
            <Hero backgroundUrl={settings.bgHome} />

            {/* Advanced Search Box */}
            <div className="container mx-auto px-4 relative z-20">
                <AdvancedSearch locations={locations} />
            </div>

            {/* Featured Projects Section */}
            <section className="py-20 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
                                Dự Án Nổi Bật
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Tuyển chọn những dự án có tiềm năng sinh lời tốt nhất
                            </p>
                        </div>
                        <Link
                            href="/du-an"
                            className="hidden md:flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors"
                        >
                            Xem tất cả <ArrowRight size={20} className="ml-2" />
                        </Link>
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
                                fullLocation={project.fullLocation || ''}
                                image={project.thumbnailUrl}
                                slug={project.slug}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-12 md:hidden">
                        <Link href="/du-an">
                            <button className="bg-slate-100 text-slate-800 px-8 py-3 rounded-full font-bold text-sm">
                                Xem tất cả
                            </button>
                        </Link>
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
                                    fullLocation={listing.fullLocation || ''}
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

            {/* News Section */}
            <section className="py-20 bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
                                Tin Tức Bất Động Sản
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Cập nhật thông tin mới nhất về thị trường bất động sản
                            </p>
                        </div>
                        <Link
                            href="/tin-tuc"
                            className="hidden md:flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors"
                        >
                            Xem tất cả <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {news.map((item) => (
                            <Link key={item.id} href={`/tin-tuc/${item.slug}`}>
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {newsCategoryMap[item.category]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2">
                                            {item.summary}
                                        </p>
                                        <div className="text-slate-400 text-xs mt-3">
                                            {new Intl.DateTimeFormat('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            }).format(new Date(item.createdAt))}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-12 md:hidden">
                        <Link href="/tin-tuc">
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
