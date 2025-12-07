import { UIMessage, isTextUIPart, isToolUIPart } from 'ai'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatPropertyCard, { ChatProperty } from './chat-property-card'

interface ChatMessageProps {
    message: UIMessage
}

// Parse properties from embedded HTML comment in text
// Format: <!-- PROPERTIES:[...JSON...] -->
function parsePropertiesFromText(text: string): { cleanText: string; properties: ChatProperty[] } {
    const properties: ChatProperty[] = []
    const propRegex = /<!-- PROPERTIES:(\[[\s\S]*?\]) -->/
    const match = text.match(propRegex)

    if (match && match[1]) {
        try {
            // Sanitize JSON string - remove control characters
            const sanitized = match[1].replace(/[\x00-\x1F\x7F]/g, ' ')
            const parsed = JSON.parse(sanitized)
            if (Array.isArray(parsed)) {
                parsed.forEach((item: any) => {
                    if (!item) return

                    // Build URL from slug if not provided
                    let url = item.url
                    if (!url || url === '/') {
                        const slug = item.slug
                        const type = item.type
                        if (type === 'Dự án' && slug) url = `/du-an/${slug}`
                        else if (type === 'Tin đăng' && slug) url = `/nha-dat/${slug}`
                    }

                    properties.push({
                        title: item.title || 'Bất động sản',
                        price: item.price ?? 'Liên hệ',
                        area: item.area ? `${item.area} m²` : undefined,
                        location: item.location,
                        url: url || '/',
                        thumbnailUrl: item.thumbnailUrl,
                        type: item.type,
                    })
                })
            }
        } catch (e) {
            console.error('Failed to parse properties from text:', e)
        }
    }

    // Remove the property marker from text
    const cleanText = text.replace(propRegex, '').trim()

    return { cleanText, properties }
}

function parseToolResults(message: UIMessage): ChatProperty[] {
    const results: ChatProperty[] = []

    if (message.parts) {
        message.parts.forEach((part) => {
            if (isToolUIPart(part)) {
                const toolPart = part as any

                // Check for searchVectorDB tool
                if (toolPart.toolName === 'searchVectorDB') {
                    // Handle both 'result' (new format) and 'output' (old format)
                    const data = toolPart.result || toolPart.output
                    if (!data) return

                    try {
                        const parsed = typeof data === 'string' ? JSON.parse(data) : data
                        if (Array.isArray(parsed)) {
                            parsed.forEach((item: any) => {
                                if (!item) return
                                const meta = item.metadata || {}

                                // Build URL from slug if not provided directly
                                let url = item.url
                                if (!url) {
                                    const type = item.type || meta.type
                                    const slug = item.slug || meta.slug
                                    if (type === 'PROJECT' && slug) url = `/du-an/${slug}`
                                    else if (type === 'LISTING' && slug) url = `/nha-dat/${slug}`
                                    else if (type === 'Dự án' && slug) url = `/du-an/${slug}`
                                    else if (type === 'Tin đăng' && slug) url = `/nha-dat/${slug}`
                                }

                                results.push({
                                    title: item.title || meta.name || meta.title || 'Bất động sản',
                                    price: item.price ?? meta.price ?? meta.priceRange ?? 'Liên hệ',
                                    area: item.area ?? meta.area,
                                    location: item.location ?? meta.fullLocation ?? meta.location,
                                    url: url || '/',
                                    thumbnailUrl: item.thumbnailUrl ?? meta.thumbnailUrl,
                                    type: item.type || meta.type,
                                })
                            })
                        }
                    } catch (e) {
                        console.error('Failed to parse tool result:', e)
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

    const toolPropertyResults = !isUser ? parseToolResults(message) : []

    // Extract text content from parts
    const rawTextContent = message.parts
        .filter(isTextUIPart)
        .map(part => part.text)
        .join('')

    // Parse properties embedded in text and get clean text
    const { cleanText: textContent, properties: textProperties } = parsePropertiesFromText(rawTextContent)

    // Combine properties from both sources
    const propertyResults = [...toolPropertyResults, ...textProperties]

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-amber-100' : 'bg-slate-100'
                    }`}
            >
                {isUser ? <User className="w-5 h-5 text-amber-600" /> : <Bot className="w-5 h-5 text-slate-600" />}
            </div>
            <div
                className={`rounded-2xl px-4 py-3 text-sm ${isUser
                    ? 'bg-amber-50 text-amber-900 rounded-tr-none max-w-[80%]'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm max-w-[95%]'
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
                    <div className="mt-3 space-y-2">
                        {propertyResults.map((property, idx) => (
                            <ChatPropertyCard key={`${property.url}-${idx}`} property={property} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
