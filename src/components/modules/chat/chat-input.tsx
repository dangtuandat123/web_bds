import { Send } from 'lucide-react'
import { FormEvent, KeyboardEvent } from 'react'

interface ChatInputProps {
    input: string
    onChange: (value: string) => void
    onSubmit: (e: FormEvent) => void
    isLoading: boolean
}

export default function ChatInput({ input, onChange, onSubmit, isLoading }: ChatInputProps) {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (input.trim() && !isLoading) {
                onSubmit(e as any)
            }
        }
    }

    return (
        <form onSubmit={onSubmit} className="border-t border-slate-200 p-4 bg-white">
            <div className="flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-400 text-white flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
    )
}
