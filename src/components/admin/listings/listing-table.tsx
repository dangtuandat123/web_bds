'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@prisma/client'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteListing } from '@/app/actions/listing'
import { formatPrice, formatArea } from '@/lib/utils/format'

type ListingWithProject = Listing & {
    project: {
        id: number
        name: string
    } | null
}

interface ListingTableProps {
    listings: ListingWithProject[]
}

const typeLabels = {
    APARTMENT: 'Căn hộ',
    HOUSE: 'Nhà riêng',
    LAND: 'Đất nền',
    RENT: 'Cho thuê',
}

export default function ListingTable({ listings }: ListingTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            const result = await deleteListing(deleteId)

            if (result.success) {
                toast.success(result.message)
                setDeleteId(null)
            } else {
                toast.error(result.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa listing')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Ảnh</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Loại hình</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Diện tích</TableHead>
                            <TableHead>Dự án</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {listings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-slate-500">
                                    Chưa có listing nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            listings.map((listing) => (
                                <TableRow key={listing.id}>
                                    <TableCell>
                                        <div className="relative h-16 w-16 rounded overflow-hidden bg-slate-100">
                                            <Image
                                                src={listing.thumbnailUrl}
                                                alt={listing.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {listing.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{typeLabels[listing.type]}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-amber-600">
                                        {formatPrice(listing.price)}
                                    </TableCell>
                                    <TableCell>{formatArea(listing.area)}</TableCell>
                                    <TableCell className="text-slate-600">
                                        {listing.project?.name || (
                                            <span className="text-slate-400 italic">Độc lập</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {listing.isActive ? (
                                            <Badge variant="default" className="bg-green-500">Hoạt động</Badge>
                                        ) : (
                                            <Badge variant="secondary">Ẩn</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/listings/${listing.id}`}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteId(listing.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa listing</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa listing này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
