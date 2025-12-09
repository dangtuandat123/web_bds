import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// SECURITY: JWT_SECRET must be set
const JWT_SECRET = process.env.JWT_SECRET
    ? new TextEncoder().encode(process.env.JWT_SECRET)
    : null

export async function POST(request: NextRequest) {
    try {
        // Authorization check - require admin session
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value

        if (!token || !JWT_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin login required' },
                { status: 401 }
            )
        }

        try {
            await jwtVerify(token, JWT_SECRET)
        } catch {
            return NextResponse.json(
                { error: 'Invalid or expired session' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'Không có file được gửi lên' },
                { status: 400 }
            )
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, PNG, WebP, GIF' },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File quá lớn. Tối đa 5MB' },
                { status: 400 }
            )
        }

        // Create uploads directory if not exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${timestamp}-${randomStr}.${ext}`

        // Write file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = path.join(uploadsDir, filename)
        await writeFile(filePath, buffer)

        // Return public URL
        const url = `/uploads/${filename}`

        return NextResponse.json({ url, filename })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Lỗi khi upload file' },
            { status: 500 }
        )
    }
}
