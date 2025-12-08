'use client'

import { useState, useMemo } from 'react'
import { listing, project } from '@prisma/client'
import AdminSearchInput from '@/components/admin/admin-search-input'
import AdminPagination from '@/components/admin/admin-pagination'
import ListingTable from '@/components/admin/listings/listing-table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

const ITEMS_PER_PAGE = 10

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
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState('all')

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

    // Get current filtered list based on active tab
    const getCurrentFiltered = () => {
        switch (activeTab) {
            case 'apartment': return filteredApartments
            case 'house': return filteredHouses
            case 'land': return filteredLands
            case 'rent': return filteredRents
            default: return filteredAll
        }
    }

    const currentFiltered = getCurrentFiltered()
    const totalPages = Math.ceil(currentFiltered.length / ITEMS_PER_PAGE)

    const paginatedListings = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return currentFiltered.slice(start, start + ITEMS_PER_PAGE)
    }, [currentFiltered, currentPage])

    // Reset page on search or tab change
    const handleSearch = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={handleSearch}
                    placeholder="Tìm theo tiêu đề, vị trí, dự án..."
                />
                <span className="text-sm text-slate-500">
                    {currentFiltered.length} / {all.length} tin đăng
                </span>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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

                <ListingTable listings={paginatedListings} />

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </Tabs>
        </div>
    )
}

