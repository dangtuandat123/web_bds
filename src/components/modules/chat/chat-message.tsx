<div
    className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
        ? 'bg-amber-100 text-slate-800 border border-amber-200'
        : 'bg-slate-100 text-slate-800 border border-slate-200'
        }`}
>
    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
</div>
        </div >
    )
}
