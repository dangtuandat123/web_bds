import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ChatSessionsWithSearch from '@/components/admin/chatbot/chat-sessions-with-search'

export const metadata: Metadata = {
    title: 'Quản lý Chatbot AI | Admin',
    description: 'Xem các hội thoại chatbot với người dùng',
}

export default async function AdminChatbotPage() {
    const sessions = await prisma.chatsession.findMany({
        orderBy: { updatedAt: 'desc' },
    })

    // Parse messages for each session
    const parsedSessions = sessions.map(session => {
        let messages: any[] = []
        try {
            const parsed = JSON.parse(session.messages || '[]')
            messages = Array.isArray(parsed) ? parsed : []
        } catch {
            messages = []
        }

        // Get first user message as preview
        const userMessages = messages.filter((m: any) => m.role === 'user')
        const firstMessage = userMessages[0]?.content || 'Không có tin nhắn'

        return {
            ...session,
            messageCount: messages.length,
            userMessageCount: userMessages.length,
            preview: typeof firstMessage === 'string'
                ? firstMessage.slice(0, 100)
                : 'Không có tin nhắn',
        }
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Chatbot AI</h1>
                <p className="text-slate-600 mt-2">
                    Xem các hội thoại của người dùng với chatbot ({sessions.length} phiên)
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500">Tổng phiên hội thoại</div>
                    <div className="text-3xl font-bold text-slate-800 mt-1">
                        {sessions.length}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500">Tổng tin nhắn</div>
                    <div className="text-3xl font-bold text-amber-600 mt-1">
                        {parsedSessions.reduce((sum, s) => sum + s.messageCount, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500">Hội thoại hôm nay</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">
                        {parsedSessions.filter(s => {
                            const today = new Date()
                            const sessionDate = new Date(s.updatedAt)
                            return sessionDate.toDateString() === today.toDateString()
                        }).length}
                    </div>
                </div>
            </div>

            {/* Sessions Table with Search & Pagination */}
            <ChatSessionsWithSearch sessions={parsedSessions} />
        </div>
    )
}
