'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import type { Lead } from '@prisma/client'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateLeadStatus, deleteLead } from '@/app/actions/lead'
import { LeadStatus } from '@prisma/client'

interface LeadTableProps {
    leads: Lead[]
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
    NEW: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
    CONTACTED: { label: 'Đã liên hệ', color: 'bg-yellow-100 text-yellow-700' },
    QUALIFIED: { label: 'Tiềm năng', color: 'bg-green-100 text-green-700' },
    CONVERTED: { label: 'Đã chốt', color: 'bg-purple-100 text-purple-700' },
    LOST: { label: 'Thất bại', color: 'bg-gray-100 text-gray-700' },
}

const sourceConfig: Record<string, string> = {
    FORM: 'Form liên hệ',
    CHATBOT: 'AI Chatbot',
    PHONE: 'Điện thoại',
}

export default function LeadTable({ leads }: LeadTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (leadId: number, newStatus: LeadStatus) => {
        startTransition(async () => {
            const result = await updateLeadStatus(leadId, newStatus)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleDelete = () => {
        if (deleteId === null) return

        startTransition(async () => {
            const result = await deleteLead(deleteId)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
            setDeleteId(null)
        })
    }

    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-500 text-lg">Chưa có khách hàng nào</p>
                <p className="text-slate-400 text-sm mt-2">Khách hàng liên hệ sẽ hiển thị ở đây</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead className="max-w-xs">Tin nhắn</TableHead>
                            <TableHead>Nguồn</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="w-[80px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{lead.name}</TableCell>
                                <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                                <TableCell className="max-w-xs">
                                    <div className="truncate text-slate-600 text-sm">
                                        {lead.message || '—'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-slate-500">
                                        {sourceConfig[lead.source]}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="cursor-pointer">
                                                <Badge className={statusConfig[lead.status].color}>
                                                    {statusConfig[lead.status].label}
                                                </Badge>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel>Thay đổi trạng thái</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {Object.entries(statusConfig).map(([key, value]) => (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onClick={() => handleStatusChange(lead.id, key as LeadStatus)}
                                                    disabled={isPending || lead.status === key}
                                                >
                                                    <Badge className={`${value.color} mr-2`}>
                                                        {value.label}
                                                    </Badge>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }).format(new Date(lead.createdAt))}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeleteId(lead.id)}
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
                        <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.
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
