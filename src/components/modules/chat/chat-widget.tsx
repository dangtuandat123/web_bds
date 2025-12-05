'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { MessageCircle, X } from 'lucide-react'
import ChatMessage from './chat-message'
import ChatInput from './chat-input'
import ChatSuggestionChips from './chat-suggestion-chips'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content:
                    'Xin chào! 👋 Tôi là trợ lý ảo của Happy Land. Tôi có thể giúp bạn tìm hiểu về các dự án bất động sản, giá cả, vị trí và pháp lý. Bạn quan tâm đến loại hình nào? 🏠',
            },
        ],
    })

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSelectSuggestion = (prompt: string) => {
        append({ role: 'user', content: prompt })
    }

    const shouldShowSuggestions = messages.length <= 1 && !isLoading
    const defaultSuggestions = [
        'Tìm căn hộ giá tốt',
        'Nhà phố khu đông',
        'Dự án mới mở bán',
        'Tư vấn đầu tư BĐS',
    ]

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${isOpen ? 'scale-0' : 'scale-100'
                    }`}
                aria-label="Mở chat"
            >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    1
                </span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm md:w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Happy Land AI</h3>
                                <p className="text-amber-100 text-xs">Trợ lý ảo tư vấn BĐS</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label="Đóng chat"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        <div className="flex flex-col gap-4">
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            {shouldShowSuggestions && (
                                <ChatSuggestionChips
                                    onSelect={handleSelectSuggestion}
                                    disabled={isLoading}
                                    suggestions={defaultSuggestions}
                                />
                            )}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '0.2s' }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '0.4s' }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <ChatInput
                        input={input}
                        onChange={handleInputChange}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Custom Animation Styles */}
            <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    )
}
