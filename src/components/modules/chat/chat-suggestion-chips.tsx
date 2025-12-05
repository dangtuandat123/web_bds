'use client'

interface ChatSuggestionChipsProps {
    onSelect: (prompt: string) => void
    disabled?: boolean
    suggestions?: string[]
}

export default function ChatSuggestionChips({ onSelect, disabled, suggestions = [] }: ChatSuggestionChipsProps) {
    if (!suggestions.length) return null

    return (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
            {suggestions.map((text) => (
                <button
                    key={text}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(text)}
                    className="text-xs md:text-sm rounded-full border border-amber-200 bg-amber-50 text-amber-700 px-3 py-1.5 font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {text}
                </button>
            ))}
        </div>
    )
}
