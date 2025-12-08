'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Project } from '@prisma/client'
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
import { deleteProject } from '@/app/actions/project'

interface ProjectTableProps {
    projects: Project[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
    UPCOMING: { label: 'Sắp mở bán', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800' },
    SELLING: { label: 'Đang bán', color: 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800' },
    SOLD_OUT: { label: 'Đã bán hết', color: 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800' },
}

const categoryConfig: Record<string, string> = {
    APARTMENT: 'Căn hộ',
    VILLA: 'Biệt thự',
    LAND: 'Đất nền',
}

export default function ProjectTable({ projects }: ProjectTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (deleteId === null) return

        startTransition(async () => {
            await deleteProject(deleteId)
            setDeleteId(null)
        })
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-500 text-lg">Không có dự án nào</p>
                <p className="text-slate-400 text-sm mt-2">Thêm dự án đầu tiên của bạn</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Hình ảnh</TableHead>
                            <TableHead>Tên dự án</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="w-[80px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                        <Image
                                            src={project.thumbnailUrl}
                                            alt={project.name}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell>{categoryConfig[project.category]}</TableCell>
                                <TableCell>{project.priceRange}</TableCell>
                                <TableCell>
                                    <Badge className={statusConfig[project.status].color}>
                                        {statusConfig[project.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    }).format(new Date(project.createdAt))}
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
                                                <Link href={`/admin/projects/${project.id}`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Sửa
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeleteId(project.id)}
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
                        <AlertDialogTitle>Xác nhận xóa dự án</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.
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
