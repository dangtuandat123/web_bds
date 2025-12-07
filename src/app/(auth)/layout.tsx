export const metadata = {
  title: 'Đăng nhập - Happy Land',
  description: 'Đăng nhập vào hệ thống quản trị Happy Land',
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
