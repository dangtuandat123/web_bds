import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/settings'
import { FileText, Shield, Scale, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Điều khoản sử dụng | Happy Land Real Estate',
    description: 'Điều khoản và điều kiện sử dụng website Happy Land Real Estate',
}

export default async function TermsOfUsePage() {
    const settings = await getSiteSettings()

    // If custom terms from settings
    if (settings.termsOfUse && settings.termsOfUse.length > 50) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold">Điều khoản sử dụng</h1>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-white rounded-xl shadow-sm p-8 prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: settings.termsOfUse }} />
                </div>
            </div>
        )
    }

    // Default terms
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-10 w-10 text-amber-500" />
                        <h1 className="text-4xl font-bold">Điều khoản sử dụng</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Scale className="h-6 w-6 text-amber-500" />
                            1. Điều khoản chung
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Chào mừng bạn đến với {settings.siteName}. Khi truy cập và sử dụng website của chúng tôi,
                            bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Quyền sở hữu trí tuệ</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>Tất cả nội dung trên website thuộc quyền sở hữu của {settings.siteName}</li>
                            <li>Bạn không được sao chép, phân phối hoặc sử dụng nội dung mà không có sự cho phép</li>
                            <li>Logo, hình ảnh và thương hiệu được bảo hộ theo quy định pháp luật</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Quy định sử dụng</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>Không sử dụng website cho mục đích bất hợp pháp</li>
                            <li>Không đăng tải nội dung vi phạm pháp luật hoặc đạo đức</li>
                            <li>Không can thiệp vào hệ thống hoặc bảo mật website</li>
                            <li>Cung cấp thông tin chính xác khi đăng ký hoặc liên hệ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Thông tin bất động sản</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Thông tin về các dự án và bất động sản trên website chỉ mang tính chất tham khảo.
                            Giá cả, diện tích và các thông số có thể thay đổi mà không cần báo trước.
                            Vui lòng liên hệ trực tiếp để có thông tin chính xác nhất.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Giới hạn trách nhiệm</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {settings.siteName} không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng
                            thông tin trên website. Chúng tôi khuyến khích khách hàng xác minh thông tin độc lập
                            trước khi đưa ra quyết định đầu tư.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Thay đổi điều khoản</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng
                            website sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                        </p>
                    </section>

                    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Liên hệ
                        </h2>
                        <p className="text-slate-600">
                            Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:<br />
                            <strong>Email:</strong> {settings.contactEmail}<br />
                            <strong>Điện thoại:</strong> {settings.contactPhone}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
