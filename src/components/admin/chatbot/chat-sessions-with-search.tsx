'use client'

import { useState, useMemo } from 'react'
import AdminSearchInput from '@/components/admin/admin-search-input'
import AdminPagination from '@/components/admin/admin-pagination'
import ChatSessionTable from '@/components/admin/chatbot/chat-session-table'

const ITEMS_PER_PAGE = 10

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

interface ChatSessionsWithSearchProps {
    sessions: ChatSession[]
}

export default function ChatSessionsWithSearch({ sessions }: ChatSessionsWithSearchProps) {
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredSessions = useMemo(() => {
        if (!search.trim()) return sessions
        const query = search.toLowerCase()
        return sessions.filter(s =>
            s.sessionId.toLowerCase().includes(query) ||
            s.preview.toLowerCase().includes(query)
        )
    }, [sessions, search])

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    // Pagination
    const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE)
    const paginatedSessions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredSessions.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredSessions, currentPage])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <AdminSearchInput
                    value={search}
                    onChange={handleSearch}
                    placeholder="Tìm theo session ID, nội dung..."
                />
                <span className="text-sm text-slate-500">
                    {filteredSessions.length} / {sessions.length} phiên
                </span>
            </div>
            <ChatSessionTable sessions={paginatedSessions} />
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
