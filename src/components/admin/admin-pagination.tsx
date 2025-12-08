'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function AdminPagination({
    currentPage,
    totalPages,
    onPageChange,
}: AdminPaginationProps) {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
        const pages: (number | 'ellipsis')[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            if (currentPage > 3) {
                pages.push('ellipsis')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis')
            }

            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
            >
                <ChevronLeft className="h-4 w-4" />
                Trước
            </Button>

            <div className="flex items-center gap-1">
                {getVisiblePages().map((page, idx) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={currentPage === page ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1"
            >
                Sau
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
