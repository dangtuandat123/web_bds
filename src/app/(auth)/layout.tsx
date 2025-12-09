export const metadata = {
  title: 'Đăng nhập - Admin Panel',
  description: 'Đăng nhập vào hệ thống quản trị',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-slate-100">
      {children}
    </div>
  )
}
