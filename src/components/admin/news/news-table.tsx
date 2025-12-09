'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { news } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteNews } from '@/app/actions/news'

interface NewsTableProps {
    news: (news & {
        isFeatured?: boolean
        isActive?: boolean
        newsCategory?: {
            id: number
            name: string
        } | null
    })[]
}

export default function NewsTable({ news }: NewsTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (deleteId === null) return

        startTransition(async () => {
            const result = await deleteNews(deleteId)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
            setDeleteId(null)
        })
    }

    if (news.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-500 text-lg">Chưa có tin tức nào</p>
                <p className="text-slate-400 text-sm mt-2">Thêm tin tức đầu tiên của bạn</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Ảnh</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Lượt xem</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="w-[80px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {news.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="relative w-16 h-12 rounded-md overflow-hidden bg-slate-100">
                                        <Image
                                            src={item.thumbnailUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-md">
                                    <Link
                                        href={`/tin-tuc/${item.slug}`}
                                        target="_blank"
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                        <span className="line-clamp-2">{item.title}</span>
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {item.newsCategory ? (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {item.newsCategory.name}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Chưa phân loại</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {item.isActive ? (
                                        <Badge variant="default" className="bg-green-500">Hoạt động</Badge>
                                    ) : (
                                        <Badge variant="secondary">Ẩn</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {item.views} lượt
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    }).format(new Date(item.createdAt))}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/news/${item.id}`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Sửa
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeleteId(item.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa tin tức</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tin tức này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
