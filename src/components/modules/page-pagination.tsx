import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PagePaginationProps {
    currentPage: number
    totalPages: number
    baseUrl: string
    searchParams?: Record<string, string>
}

export default function PagePagination({
    currentPage,
    totalPages,
    baseUrl,
    searchParams = {},
}: PagePaginationProps) {
    if (totalPages <= 1) return null

    // Generate page numbers with ellipsis
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
            }
        }
        return pages
    }

    const buildUrl = (page: number): string => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        return `${baseUrl}?${params.toString()}`
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className="flex justify-center items-center space-x-2 mt-16 animate-fade-in">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={buildUrl(currentPage - 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300"
                >
                    <ChevronLeft size={18} />
                </Link>
            ) : (
                <span className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-300 cursor-not-allowed">
                    <ChevronLeft size={18} />
                </span>
            )}

            {/* Page Numbers */}
            {pageNumbers.map((page, idx) =>
                typeof page === 'number' ? (
                    <Link
                        key={idx}
                        href={buildUrl(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${page === currentPage
                                ? 'bg-amber-500 text-white shadow-lg scale-110'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-amber-300 hover:text-amber-600'
                            }`}
                    >
                        {page}
                    </Link>
                ) : (
                    <span
                        key={idx}
                        className="w-10 h-10 flex items-center justify-center text-slate-400"
                    >
                        {page}
                    </span>
                )
            )}

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={buildUrl(currentPage + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300"
                >
                    <ChevronRight size={18} />
                </Link>
            ) : (
                <span className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-300 cursor-not-allowed">
                    <ChevronRight size={18} />
                </span>
            )}
        </div>
    )
}
