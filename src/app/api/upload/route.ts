import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import sharp from 'sharp'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/x-png',
    'image/webp',
    'image/gif',
    'image/x-citrix-pjpeg',
    'image/x-citrix-png',
])
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

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

        // Validate file type (allow common browser variants)
        const mimeType = (file.type || '').toLowerCase()
        const ext = (file.name.split('.').pop() || '').toLowerCase()
        const isAllowedMime = ALLOWED_TYPES.has(mimeType) || (mimeType.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext))
        const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext)

        if (!isAllowedMime && !isAllowedExt) {
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

        // Generate unique filename - ALWAYS use .webp extension
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const filename = `${timestamp}-${randomStr}.webp`

        // Convert to WebP for better compatibility and performance
        const bytes = await file.arrayBuffer()
        const inputBuffer = Buffer.from(bytes)

        let webpBuffer: Buffer
        try {
            // Convert to WebP with good quality
            webpBuffer = await sharp(inputBuffer)
                .webp({ quality: 85 })
                .toBuffer()
            console.log(`[Upload] Converted ${ext} to WebP: ${file.name} -> ${filename}`)
        } catch (sharpError) {
            console.error('[Upload] Sharp conversion failed, saving original:', sharpError)
            // Fallback: save original if conversion fails
            const fallbackFilename = `${timestamp}-${randomStr}.${ext}`
            const fallbackPath = path.join(uploadsDir, fallbackFilename)
            await writeFile(fallbackPath, inputBuffer)
            return NextResponse.json({ url: `/uploads/${fallbackFilename}`, filename: fallbackFilename })
        }

        // Write WebP file
        const filePath = path.join(uploadsDir, filename)
        await writeFile(filePath, webpBuffer)

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
