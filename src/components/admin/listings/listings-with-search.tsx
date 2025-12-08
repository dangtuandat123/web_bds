'use client'

import { useState, useMemo } from 'react'
import { listing, project } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import ListingTable from '@/components/admin/listings/listing-table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

type ListingWithProject = listing & {
    project: { id: number; name: string } | null
}

interface ListingsTabsWithSearchProps {
    all: ListingWithProject[]
    apartments: ListingWithProject[]
    houses: ListingWithProject[]
    lands: ListingWithProject[]
    rents: ListingWithProject[]
}

export default function ListingsTabsWithSearch({
    all, apartments, houses, lands, rents
}: ListingsTabsWithSearchProps) {
    const [search, setSearch] = useState('')

    const filterListings = (listings: ListingWithProject[]) => {
        if (!search.trim()) return listings
        const query = search.toLowerCase()
        return listings.filter(l =>
            l.title.toLowerCase().includes(query) ||
            l.location.toLowerCase().includes(query) ||
            (l.project?.name && l.project.name.toLowerCase().includes(query))
        )
    }

    const filteredAll = useMemo(() => filterListings(all), [all, search])
    const filteredApartments = useMemo(() => filterListings(apartments), [apartments, search])
    const filteredHouses = useMemo(() => filterListings(houses), [houses, search])
    const filteredLands = useMemo(() => filterListings(lands), [lands, search])
    const filteredRents = useMemo(() => filterListings(rents), [rents, search])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Tìm theo tiêu đề, vị trí, dự án..."
                />
                <span className="text-sm text-slate-500">
                    {filteredAll.length} / {all.length} tin đăng
                </span>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">
                        Tất cả ({filteredAll.length})
                    </TabsTrigger>
                    <TabsTrigger value="apartment">
                        Căn hộ ({filteredApartments.length})
                    </TabsTrigger>
                    <TabsTrigger value="house">
                        Nhà riêng ({filteredHouses.length})
                    </TabsTrigger>
                    <TabsTrigger value="land">
                        Đất nền ({filteredLands.length})
                    </TabsTrigger>
                    <TabsTrigger value="rent">
                        Cho thuê ({filteredRents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <ListingTable listings={filteredAll} />
                </TabsContent>

                <TabsContent value="apartment">
                    <ListingTable listings={filteredApartments} />
                </TabsContent>

                <TabsContent value="house">
                    <ListingTable listings={filteredHouses} />
                </TabsContent>

                <TabsContent value="land">
                    <ListingTable listings={filteredLands} />
                </TabsContent>

                <TabsContent value="rent">
                    <ListingTable listings={filteredRents} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
