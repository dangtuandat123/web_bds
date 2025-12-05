import { Message } from 'ai'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatPropertyCard, { ChatProperty } from './chat-property-card'

interface ChatMessageProps {
    message: Message
}

function parseToolResults(message: Message): ChatProperty[] {
    const results: ChatProperty[] = []

    // Prefer toolInvocations if present
    const toolInvocations = (message as any).toolInvocations as Array<{
        toolName?: string
        state?: string
        result?: unknown
    }> | undefined

    toolInvocations?.forEach((invocation) => {
        if (invocation.toolName === 'searchProperties' && invocation.state === 'result' && invocation.result) {
            try {
                const parsed = typeof invocation.result === 'string' ? JSON.parse(invocation.result) : invocation.result
                if (Array.isArray(parsed)) {
                    parsed.forEach((item: any) => {
                        if (item && item.title && item.url) {
                            results.push({
                                title: item.title,
                                price: item.price || '',
                                area: item.area,
                                location: item.location,
                                url: item.url,
                                thumbnailUrl: item.thumbnailUrl,
                                type: item.type,
                            })
                        }
                    })
                }
            } catch {
                // Ignore parsing errors for tool results
            }
        }
    })

    // Fallback: try parsing content as JSON array
    if (results.length === 0 && typeof message.content === 'string') {
        try {
            const parsed = JSON.parse(message.content)
            if (Array.isArray(parsed)) {
                parsed.forEach((item: any) => {
                    if (item && item.title && item.url) {
                        results.push({
                            title: item.title,
                            price: item.price || '',
                            area: item.area,
                            location: item.location,
                            url: item.url,
                            thumbnailUrl: item.thumbnailUrl,
                            type: item.type,
                        })
                    }
                })
            }
        } catch {
            // not JSON, ignore
        }
    }

    return results
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const propertyResults = !isUser ? parseToolResults(message) : []

    const normalizeHref = (href?: string) => {
        if (!href) return '#'
        try {
            const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
            const url = new URL(href, base)
            if (href.startsWith('http') && url.origin === base) {
                return url.pathname + url.search + url.hash
            }
            if (!href.startsWith('http')) return href
            return url.href
        } catch {
            return href
        }
    }

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-amber-100' : 'bg-slate-100'
                    }`}
            >
                {isUser ? <User className="w-5 h-5 text-amber-600" /> : <Bot className="w-5 h-5 text-slate-600" />}
            </div>
            <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${isUser
                    ? 'bg-amber-50 text-amber-900 rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ node, href, ...props }) => {
                            const safeHref = normalizeHref(href as string | undefined)
                            const isExternal = safeHref.startsWith('http')
                            return (
                                <a
                                    {...props}
                                    href={safeHref}
                                    className="text-blue-600 hover:underline font-medium"
                                    target={isExternal ? '_blank' : '_self'}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                />
                            )
                        },
                        p: ({ node, ...props }) => <p {...props} className="whitespace-pre-wrap break-words mb-2 last:mb-0" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mb-2" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mb-2" />,
                    }}
                >
                    {message.content}
                </ReactMarkdown>

                {propertyResults.length > 0 && (
                    <div className="mt-3 -mx-2">
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-2 py-1">
                            {propertyResults.map((property, idx) => (
                                <div key={`${property.url}-${idx}`} className="snap-start">
                                    <ChatPropertyCard property={property} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
