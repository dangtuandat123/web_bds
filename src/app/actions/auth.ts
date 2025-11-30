'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

type SessionPayload = { userId: number; email: string; role: string }

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email và mật khẩu không được để trống' }
    }

    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return { error: 'Email hoặc mật khẩu không đúng' }
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return { error: 'Email hoặc mật khẩu không đúng' }
        }

        // Check if admin
        if (user.role !== 'ADMIN') {
            return { error: 'Bạn không có quyền truy cập' }
        }

        // Create JWT token
        const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET)

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
        })

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'Đã xảy ra lỗi, vui lòng thử lại' }
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    redirect('/login')
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value

    if (!token) {
        return null
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as SessionPayload
    } catch (error) {
        return null
    }
}
