'use client'

import { useState } from 'react'
import { MessageSquare, Eye, Trash2, Clock, User, Bot } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatSession {
    id: number
    sessionId: string
    messages: string
    metadata: string | null
    createdAt: Date
    updatedAt: Date
    messageCount: number
    userMessageCount: number
    preview: string
}

interface ChatSessionTableProps {
    sessions: ChatSession[]
}

interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export default function ChatSessionTable({ sessions }: ChatSessionTableProps) {
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
    const [parsedMessages, setParsedMessages] = useState<Message[]>([])

    const handleViewSession = (session: ChatSession) => {
        setSelectedSession(session)
        try {
            const parsed = JSON.parse(session.messages || '[]')
            const messages = Array.isArray(parsed) ? parsed : []
            setParsedMessages(messages)
        } catch {
            setParsedMessages([])
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    const getTimeAgo = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        return `${days} ngày trước`
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Chưa có hội thoại nào</p>
                <p className="text-slate-400 text-sm mt-2">
                    Các hội thoại của người dùng với chatbot sẽ hiển thị ở đây
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Session ID</TableHead>
                            <TableHead>Nội dung đầu tiên</TableHead>
                            <TableHead className="text-center">Tin nhắn</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead className="w-[100px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session, index) => (
                            <TableRow key={session.id} className="hover:bg-slate-50">
                                <TableCell className="font-medium text-slate-500">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                        {session.sessionId.slice(0, 12)}...
                                    </code>
                                </TableCell>
                                <TableCell className="max-w-md">
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {session.preview}...
                                    </p>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Badge variant="secondary" className="gap-1">
                                            <User className="h-3 w-3" />
                                            {session.userMessageCount}
                                        </Badge>
                                        <Badge variant="outline" className="gap-1">
                                            <Bot className="h-3 w-3" />
                                            {session.messageCount - session.userMessageCount}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {getTimeAgo(session.updatedAt)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewSession(session)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Xem
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Chat Detail Dialog */}
            <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-amber-500" />
                            Chi tiết hội thoại
                        </DialogTitle>
                        {selectedSession && (
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>Session: {selectedSession.sessionId.slice(0, 16)}...</span>
                                <span>•</span>
                                <span>{formatDate(selectedSession.updatedAt)}</span>
                            </div>
                        )}
                    </DialogHeader>

                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            {parsedMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[80%] rounded-2xl px-4 py-2.5
                                            ${message.role === 'user'
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 text-slate-800'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {message.role === 'user' ? (
                                                <User className="h-3 w-3" />
                                            ) : (
                                                <Bot className="h-3 w-3" />
                                            )}
                                            <span className="text-xs font-medium opacity-75">
                                                {message.role === 'user' ? 'Người dùng' : 'Chatbot'}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {typeof message.content === 'string'
                                                ? message.content
                                                : JSON.stringify(message.content)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {parsedMessages.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    Không có tin nhắn trong phiên này
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}
