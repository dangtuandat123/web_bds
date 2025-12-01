import { Message } from 'ai'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
    message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user'

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
                        a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                        p: ({ node, ...props }) => <p {...props} className="whitespace-pre-wrap break-words mb-2 last:mb-0" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-4 mb-2" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-4 mb-2" />,
                    }}
                >
                    {message.content}
                </ReactMarkdown>
            </div>
        </div>
    )
}
