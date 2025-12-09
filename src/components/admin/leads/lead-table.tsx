'use client'

import { useState, useTransition, useEffect } from 'react'
import { MoreHorizontal, Trash2, Eye, Phone, Mail, MessageSquare, Calendar, Bot, User, Loader2, ExternalLink } from 'lucide-react'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateLeadStatus, deleteLead } from '@/app/actions/lead'
import { getChatSession } from '@/app/actions/chat'
import { lead_status, lead_source } from '@prisma/client'

// Define Lead type locally
interface Lead {
    id: number
    name: string
    phone: string
    email: string | null
    message: string | null
    sessionId?: string | null
    referenceUrl?: string | null
    source: lead_source
    status: lead_status
    createdAt: Date
    updatedAt: Date
}

interface LeadTableProps {
    leads: Lead[]
}

interface ChatMessage {
    role: string
    content: string
}

// Property from chat message
interface Property {
    title: string
    price: string | number
    area?: number | string
    location?: string
    url?: string
    type?: string
    thumbnailUrl?: string
}

const statusConfig: Record<lead_status, { label: string; color: string }> = {
    NEW: { label: 'Mới', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800' },
    CONTACTED: { label: 'Đã liên hệ', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800' },
    QUALIFIED: { label: 'Tiềm năng', color: 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800' },
    CONVERTED: { label: 'Đã chốt', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800' },
    LOST: { label: 'Thất bại', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800' },
}

const sourceConfig: Record<string, string> = {
    FORM: 'Form liên hệ',
    CHATBOT: 'AI Chatbot',
    PHONE: 'Điện thoại',
}

// Parse properties from message content
function parsePropertiesFromMessage(content: string): Property[] {
    const propRegex = /<!-- PROPERTIES:(\[[\s\S]*?\]) -->/
    const match = content.match(propRegex)

    if (match && match[1]) {
        try {
            const sanitized = match[1].replace(/[\x00-\x1F\x7F]/g, ' ')
            const parsed = JSON.parse(sanitized)
            if (Array.isArray(parsed)) {
                return parsed.map((item: any) => ({
                    title: item.title || 'Bất động sản',
                    price: item.price ?? 'Liên hệ',
                    area: item.area,
                    location: item.location,
                    url: item.url || '/',
                    type: item.type,
                    thumbnailUrl: item.thumbnailUrl
                }))
            }
        } catch (e) {
            console.error('Failed to parse properties:', e)
        }
    }
    return []
}

// Clean message content - remove property markers
function cleanMessageContent(content: string): string {
    return content
        .replace(/<!-- PROPERTIES:\[[\s\S]*?\] -->/g, '')
        .trim()
}

// Format price
function formatPrice(price: string | number): string {
    if (typeof price === 'number') {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} tỷ`
        } else if (price >= 1000000) {
            return `${(price / 1000000).toFixed(0)} triệu`
        }
        return price.toLocaleString('vi-VN') + ' VNĐ'
    }
    return price
}

export default function LeadTable({ leads }: LeadTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [viewLead, setViewLead] = useState<Lead | null>(null)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [loadingChat, setLoadingChat] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Fetch chat session when viewing chatbot lead
    useEffect(() => {
        if (viewLead && viewLead.source === 'CHATBOT' && viewLead.sessionId) {
            setLoadingChat(true)
            getChatSession(viewLead.sessionId).then(result => {
                if (result.success && result.messages) {
                    setChatMessages(result.messages)
                } else {
                    setChatMessages([])
                }
                setLoadingChat(false)
            })
        } else {
            setChatMessages([])
        }
    }, [viewLead])

    const handleStatusChange = (leadId: number, newStatus: lead_status) => {
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
                                    <span className={`text-xs px-2 py-1 rounded ${lead.source === 'CHATBOT' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>
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
                                                    onClick={() => handleStatusChange(lead.id, key as lead_status)}
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
                                            <DropdownMenuItem onClick={() => setViewLead(lead)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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

            {/* View Detail Dialog */}
            <Dialog open={viewLead !== null} onOpenChange={() => setViewLead(null)}>
                <DialogContent className={viewLead?.source === 'CHATBOT' && viewLead?.sessionId ? 'max-w-2xl max-h-[90vh] overflow-y-auto' : 'max-w-md'}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            Chi tiết khách hàng
                            {viewLead?.source === 'CHATBOT' && (
                                <Badge className="bg-purple-100 text-purple-700 ml-2">Từ Chatbot</Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {viewLead && (
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <span className="text-amber-600 font-bold text-lg">
                                        {viewLead.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{viewLead.name}</p>
                                    <Badge className={statusConfig[viewLead.status].color}>
                                        {statusConfig[viewLead.status].label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Số điện thoại</p>
                                        <a href={`tel:${viewLead.phone}`} className="font-mono text-blue-600 hover:underline">
                                            {viewLead.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Ngày tạo</p>
                                        <p className="text-sm font-medium">
                                            {new Intl.DateTimeFormat('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }).format(new Date(viewLead.createdAt))}
                                        </p>
                                    </div>
                                </div>

                                {viewLead.email && (
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg col-span-2">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Email</p>
                                            <a href={`mailto:${viewLead.email}`} className="text-blue-600 hover:underline">
                                                {viewLead.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Message / Interest */}
                            {viewLead.message && (
                                <div className="border-t pt-4">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 mb-1">Nhu cầu / Quan tâm</p>
                                            <p className="text-slate-700 whitespace-pre-wrap bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                {viewLead.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reference URL for Form leads */}
                            {viewLead.source === 'FORM' && viewLead.referenceUrl && (
                                <div className="border-t pt-4">
                                    <div className="flex items-start gap-3">
                                        <ExternalLink className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500 mb-1">Điền form từ trang</p>
                                            <a
                                                href={viewLead.referenceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 p-3 rounded-lg border border-blue-100"
                                            >
                                                {viewLead.referenceUrl}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Chat History for Chatbot leads */}
                            {viewLead.source === 'CHATBOT' && viewLead.sessionId && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-purple-500" />
                                        Đoạn hội thoại với Chatbot
                                    </p>

                                    {loadingChat ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                            <span className="ml-2 text-slate-500">Đang tải...</span>
                                        </div>
                                    ) : chatMessages.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto bg-slate-50 rounded-lg p-3">
                                            {chatMessages.map((msg, idx) => {
                                                const properties = msg.role === 'assistant' ? parsePropertiesFromMessage(msg.content) : []
                                                const cleanContent = cleanMessageContent(msg.content)

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                                    >
                                                        <div
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-100' : 'bg-purple-100'}`}
                                                        >
                                                            {msg.role === 'user' ? (
                                                                <User className="w-4 h-4 text-amber-600" />
                                                            ) : (
                                                                <Bot className="w-4 h-4 text-purple-600" />
                                                            )}
                                                        </div>
                                                        <div className="max-w-[85%] space-y-2">
                                                            {/* Text content */}
                                                            {cleanContent && (
                                                                <div
                                                                    className={`rounded-xl px-3 py-2 text-sm ${msg.role === 'user'
                                                                        ? 'bg-amber-100 text-amber-900'
                                                                        : 'bg-white border border-slate-200 text-slate-700'
                                                                        }`}
                                                                >
                                                                    {cleanContent}
                                                                </div>
                                                            )}

                                                            {/* Property cards for bot messages */}
                                                            {properties.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    {properties.map((prop, pIdx) => (
                                                                        <a
                                                                            key={pIdx}
                                                                            href={prop.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block bg-white border border-slate-200 rounded-lg p-2 hover:shadow-md transition-shadow"
                                                                        >
                                                                            <div className="flex gap-2">
                                                                                {prop.thumbnailUrl && (
                                                                                    <img
                                                                                        src={prop.thumbnailUrl}
                                                                                        alt={prop.title}
                                                                                        className="w-16 h-12 object-cover rounded"
                                                                                    />
                                                                                )}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-xs font-medium text-slate-800 truncate">{prop.title}</p>
                                                                                    <p className="text-xs text-amber-600 font-bold">{formatPrice(prop.price)}</p>
                                                                                    {prop.location && (
                                                                                        <p className="text-xs text-slate-500 truncate">{prop.location}</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Không tìm thấy đoạn hội thoại</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                                <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                                    <a href={`tel:${viewLead.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Gọi điện
                                    </a>
                                </Button>
                                <Button variant="outline" onClick={() => setViewLead(null)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
