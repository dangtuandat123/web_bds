import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import ListingTable from '@/components/admin/listings/listing-table'

async function getListings(type?: string) {
    const where = type ? { type: type as any } : {}

    const listings = await prisma.listing.findMany({
        where,
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return listings
}

export default async function ListingsPage() {
    const [all, apartments, houses, lands, rents] = await Promise.all([
        getListings(),
        getListings('APARTMENT'),
        getListings('HOUSE'),
        getListings('LAND'),
        getListings('RENT'),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Quản lý Listings</h1>
                    <p className="text-slate-600 mt-2">
                        Danh sách căn hộ, nhà đất đang giao dịch
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600">
                    <Link href="/admin/listings/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm listing
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">
                        Tất cả ({all.length})
                    </TabsTrigger>
                    <TabsTrigger value="apartment">
                        Căn hộ ({apartments.length})
                    </TabsTrigger>
                    <TabsTrigger value="house">
                        Nhà riêng ({houses.length})
                    </TabsTrigger>
                    <TabsTrigger value="land">
                        Đất nền ({lands.length})
                    </TabsTrigger>
                    <TabsTrigger value="rent">
                        Cho thuê ({rents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <ListingTable listings={all} />
                </TabsContent>

                <TabsContent value="apartment">
                    <ListingTable listings={apartments} />
                </TabsContent>

                <TabsContent value="house">
                    <ListingTable listings={houses} />
                </TabsContent>

                <TabsContent value="land">
                    <ListingTable listings={lands} />
                </TabsContent>

                <TabsContent value="rent">
                    <ListingTable listings={rents} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
