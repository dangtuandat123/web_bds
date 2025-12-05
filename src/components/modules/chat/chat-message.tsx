import { UIMessage, isTextUIPart, isToolUIPart } from 'ai'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatPropertyCard, { ChatProperty } from './chat-property-card'

interface ChatMessageProps {
    message: UIMessage
}

function parseToolResults(message: UIMessage): ChatProperty[] {
    const results: ChatProperty[] = []

    if (message.parts) {
        message.parts.forEach((part) => {
            if (isToolUIPart(part)) {
                const toolPart = part as any // Cast to access properties easily if types are complex
                if (toolPart.toolName === 'searchVectorDB' && toolPart.state === 'output-available' && toolPart.output) {
                    try {
                        const parsed = typeof toolPart.output === 'string' ? JSON.parse(toolPart.output) : toolPart.output
                        if (Array.isArray(parsed)) {
                            parsed.forEach((item: any) => {
                                if (!item) return
                                const meta = item.metadata || {}
                                const urlFromMeta =
                                    meta.type === 'PROJECT'
                                        ? meta.slug ? `/du-an/${meta.slug}` : undefined
                                        : meta.type === 'LISTING'
                                            ? meta.slug ? `/nha-dat/${meta.slug}` : undefined
                                            : undefined

                                results.push({
                                    title: item.title || meta.name || meta.title || 'Bất động sản',
                                    price: item.price ?? meta.price ?? meta.priceRange ?? '',
                                    area: item.area ?? meta.area,
                                    location: item.location ?? meta.fullLocation ?? meta.location,
                                    url: item.url || urlFromMeta || '/',
                                    thumbnailUrl: item.thumbnailUrl ?? meta.thumbnailUrl,
                                    type: item.type || meta.type,
                                })
                            })
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                }
            }
        })
    }

    return results
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user'
    const normalizeHref = (href?: string) => {
        if (!href) return '#'
        try {
            const url = new URL(href, href.startsWith('http') ? undefined : 'http://localhost')
            // Strip host for any absolute URL to avoid wrong origin in chatbot
            if (href.startsWith('http')) {
                return url.pathname + url.search + url.hash
            }
            return href.startsWith('/') ? href : `/${href}`
        } catch {
            return href
        }
    }

    const propertyResults = !isUser ? parseToolResults(message) : []

    // Extract text content from parts
    const textContent = message.parts
        .filter(isTextUIPart)
        .map(part => part.text)
        .join('')

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
                            return (
                                <a
                                    {...props}
                                    href={safeHref}
                                    className="text-blue-600 hover:underline font-medium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            )
                        },
                        p: ({ node, ...props }) => <p {...props} className="whitespace-pre-wrap break-words mb-2 last:mb-0" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mb-2" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mb-2" />,
                    }}
                >
                    {textContent}
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
