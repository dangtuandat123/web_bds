import { Metadata } from 'next'
import { getSiteSettings } from '@/lib/settings'
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Chính sách bảo mật | Bất Động Sản',
    description: 'Chính sách bảo mật và quyền riêng tư',
}

export default async function PrivacyPolicyPage() {
    const settings = await getSiteSettings()

    // If custom privacy policy from settings
    if (settings.privacyPolicy && settings.privacyPolicy.length > 50) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold">Chính sách bảo mật</h1>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-white rounded-xl shadow-sm p-8 prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }} />
                </div>
            </div>
        )
    }

    // Default privacy policy
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-10 w-10 text-amber-500" />
                        <h1 className="text-4xl font-bold">Chính sách bảo mật</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Eye className="h-6 w-6 text-amber-500" />
                            1. Thu thập thông tin
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Chúng tôi thu thập các thông tin sau khi bạn sử dụng dịch vụ:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li><strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, email khi bạn đăng ký tư vấn</li>
                            <li><strong>Thông tin tự động:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập</li>
                            <li><strong>Cookie:</strong> Để cải thiện trải nghiệm người dùng</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Database className="h-6 w-6 text-amber-500" />
                            2. Mục đích sử dụng
                        </h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>Liên hệ tư vấn về bất động sản theo yêu cầu của bạn</li>
                            <li>Gửi thông tin về dự án mới và chương trình khuyến mãi</li>
                            <li>Cải thiện chất lượng dịch vụ và website</li>
                            <li>Thống kê và phân tích để phục vụ khách hàng tốt hơn</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Lock className="h-6 w-6 text-amber-500" />
                            3. Bảo mật thông tin
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Chúng tôi cam kết bảo mật thông tin của bạn bằng các biện pháp:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4">
                            <li>Mã hóa SSL cho tất cả dữ liệu truyền tải</li>
                            <li>Hạn chế quyền truy cập vào dữ liệu cá nhân</li>
                            <li>Không chia sẻ thông tin với bên thứ ba mà không có sự đồng ý</li>
                            <li>Lưu trữ dữ liệu trên hệ thống bảo mật cao</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <UserCheck className="h-6 w-6 text-amber-500" />
                            4. Quyền của bạn
                        </h2>
                        <p className="text-slate-600 leading-relaxed">Bạn có quyền:</p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4">
                            <li>Yêu cầu xem thông tin cá nhân mà chúng tôi lưu trữ</li>
                            <li>Yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân</li>
                            <li>Từ chối nhận thông tin quảng cáo, khuyến mãi</li>
                            <li>Khiếu nại nếu quyền riêng tư bị xâm phạm</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Cookie</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Website sử dụng cookie để ghi nhớ tùy chọn của bạn và cải thiện trải nghiệm.
                            Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng
                            có thể bị ảnh hưởng.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Thay đổi chính sách</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi
                            sẽ được đăng tải trên trang này với ngày cập nhật mới.
                        </p>
                    </section>

                    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Liên hệ về quyền riêng tư
                        </h2>
                        <p className="text-slate-600">
                            Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:<br />
                            <strong>Email:</strong> {settings.contactEmail}<br />
                            <strong>Điện thoại:</strong> {settings.contactPhone}<br />
                            <strong>Địa chỉ:</strong> {settings.contactAddress}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
