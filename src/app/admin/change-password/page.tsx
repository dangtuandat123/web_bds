import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/admin/change-password-form'

export default async function ChangePasswordPage() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    return <ChangePasswordForm />
}
