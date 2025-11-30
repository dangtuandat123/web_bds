export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center px-4">
                <h1 className="text-5xl font-bold text-slate-800 mb-4">
                    Happy Land Real Estate
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                    Dự án Next.js đã được khởi tạo thành công
                </p>
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold text-slate-700 mb-4">
                        ✅ Hoàn thành cài đặt
                    </h2>
                    <ul className="text-left space-y-2 text-slate-600">
                        <li>📦 Next.js 15 với App Router</li>
                        <li>🎨 Tailwind CSS</li>
                        <li>📘 TypeScript</li>
                        <li>🗄️ Prisma với MySQL</li>
                        <li>🎯 Lucide React Icons</li>
                        <li>📁 Cấu trúc thư mục chuẩn</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
