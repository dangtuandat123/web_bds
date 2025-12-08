import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import ListingsTabsWithSearch from '@/components/admin/listings/listings-with-search'

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

            <ListingsTabsWithSearch
                all={all}
                apartments={apartments}
                houses={houses}
                lands={lands}
                rents={rents}
            />
        </div>
    )
}

