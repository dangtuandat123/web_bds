import Link from 'next/link'
import { Building, Home } from 'lucide-react'

interface HeroProps {
    backgroundUrl?: string
    badge?: string
    title1?: string
    title2?: string
    subtitle?: string
}

export default function Hero({
    backgroundUrl,
    badge = 'Happy Land Real Estate',
    title1 = 'Kiến Tạo Giá Trị',
    title2 = 'Vun Đắp Tương Lai',
    subtitle = 'Hệ thống phân phối và giao dịch bất động sản uy tín hàng đầu tại TP. Thủ Đức. Nơi trao gửi niềm tin trọn vẹn.'
}: HeroProps) {
    const bgImage = backgroundUrl || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000'

    return (
        <div className="relative h-[550px] sm:h-[700px] w-full bg-slate-900 overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 bg-fixed transform scale-105 animate-slow-zoom"
                style={{ backgroundImage: `url('${bgImage}')` }}
            ></div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/90"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-20 sm:pt-0 pb-24 animate-fade-in-up">
                {/* Badge */}
                <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 animate-float">
                    {badge}
                </div>

                {/* Title with Gradient Text */}
                <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 max-w-4xl leading-tight drop-shadow-lg">
                    {title1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                        {title2}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-200 text-lg sm:text-xl mb-10 max-w-2xl font-light leading-relaxed drop-shadow-md">
                    {subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                    <Link href="/du-an">
                        <button className="group bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 flex items-center justify-center w-full sm:w-auto">
                            <Building className="mr-2 group-hover:-translate-y-1 transition-transform" size={20} />
                            Xem Dự Án
                        </button>
                    </Link>
                    <Link href="/nha-dat">
                        <button className="group bg-white/90 hover:bg-white text-slate-900 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center backdrop-blur-sm w-full sm:w-auto">
                            <Home className="mr-2 group-hover:-translate-y-1 transition-transform" size={20} />
                            Sàn Giao Dịch
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
