import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'

export async function POST(request: Request) {
    // Check auth
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { apiKey } = await request.json()

        if (!apiKey) {
            return NextResponse.json({
                valid: false,
                error: 'API key không được để trống'
            })
        }

        // Call OpenRouter API to check key and credits
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({
                valid: false,
                error: 'API key không hợp lệ'
            })
        }

        const data = await response.json()

        // Get credit/usage info
        const creditInfo = data.data || {}

        return NextResponse.json({
            valid: true,
            label: creditInfo.label || 'Unknown',
            usage: creditInfo.usage || 0,
            limit: creditInfo.limit || null,
            isFreeTier: creditInfo.is_free_tier || false,
            rateLimit: creditInfo.rate_limit || null,
        })

    } catch (error) {
        console.error('OpenRouter API check error:', error)
        return NextResponse.json({
            valid: false,
            error: 'Không thể kiểm tra API key'
        })
    }
}
