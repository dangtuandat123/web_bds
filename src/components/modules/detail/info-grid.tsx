interface InfoGridProps {
    items: Array<{
        label: string
        value: string | number
        icon?: React.ReactNode
    }>
}

export default function InfoGrid({ items }: InfoGridProps) {
    if (!items || items.length === 0) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-amber-200 transition-colors"
                >
                    <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-2 tracking-wider">
                        {item.icon}
                        {item.label}
                    </div>
                    <div className="text-slate-800 font-bold text-lg">
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    )
}
