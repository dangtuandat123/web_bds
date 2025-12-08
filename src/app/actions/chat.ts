'use server'

import prisma from '@/lib/prisma'
import { getSession } from './auth'

interface ChatMessage {
    role: string
    content: string
}

export async function getChatSession(sessionId: string) {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' }
    }

    if (!sessionId) {
        return { success: false, error: 'Session ID required' }
    }

    try {
        const chatSession = await prisma.chatsession.findUnique({
            where: { sessionId }
        })

        if (!chatSession) {
            return { success: false, error: 'Chat session not found' }
        }

        // Parse messages
        let messages: ChatMessage[] = []
        try {
            messages = JSON.parse(chatSession.messages)
        } catch {
            messages = []
        }

        return {
            success: true,
            messages,
            createdAt: chatSession.createdAt,
            updatedAt: chatSession.updatedAt
        }
    } catch (error) {
        console.error('getChatSession Error:', error)
        return { success: false, error: 'Failed to fetch chat session' }
    }
}
