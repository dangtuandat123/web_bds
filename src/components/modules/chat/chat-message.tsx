<div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    {/* Avatar */}
    <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
            : 'bg-gradient-to-r from-slate-700 to-slate-800'
            }`}
    >
        {isUser ? (
            <User className="w-5 h-5 text-white" />
        ) : (
            <Bot className="w-5 h-5 text-white" />
        )}
    </div>

    {/* Message Bubble */}
    <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
            ? 'bg-amber-100 text-slate-800 border border-amber-200'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
    >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
    </div>
</div>
    )
}
