import prisma from '@/lib/prisma'
import { vectorStore, Document } from './vector-store'

// ============ Tool Handlers for AI Agent ============

// Helper to format property result
function formatProperty(r: Document) {
    const meta = r.metadata || {}
    const type = (meta.type as string | undefined) || ''
    const slug = meta.slug as string | undefined
    const path = type === 'PROJECT'
        ? slug ? `/du-an/${slug}` : undefined
        : type === 'LISTING'
            ? slug ? `/nha-dat/${slug}` : undefined
            : undefined

    return {
        id: r.id,
        title: meta.name || meta.title || 'Bất động sản',
        price: meta.price ?? meta.priceRange ?? 'Liên hệ',
        area: meta.area,
        location: meta.fullLocation || meta.location || '',
        url: path,
        thumbnailUrl: meta.thumbnailUrl,
        type: type === 'PROJECT' ? 'Dự án' : (type === 'LISTING' ? 'Tin đăng' : type),
        slug: slug,
    }
}

/**
 * Search properties in vector database
 * AI calls this when user asks about real estate
 */
export async function searchProperties(query: string, limit: number = 5): Promise<string> {
    console.error(`[searchProperties] ===== TOOL CALLED =====`)
    console.error(`[searchProperties] Query: "${query}", Limit: ${limit}`)

    try {
        const results = await vectorStore.similaritySearch(query, limit)
        console.error(`[searchProperties] Raw results count: ${results.length}`)

        // Lower threshold to 0.3 to get more results
        const SIMILARITY_THRESHOLD = 0.3
        const relevantResults = results.filter(r => (r.similarity || 0) >= SIMILARITY_THRESHOLD)
        console.error(`[searchProperties] After threshold filter (>=${SIMILARITY_THRESHOLD}): ${relevantResults.length}`)

        if (relevantResults.length === 0) {
            // If no results meet threshold, return top results anyway if they exist
            if (results.length > 0) {
                console.error('[searchProperties] No results above threshold, returning top results')
                return JSON.stringify({
                    success: true,
                    found: true,
                    message: `Tìm thấy ${Math.min(results.length, limit)} bất động sản có thể phù hợp.`,
                    properties: results.slice(0, limit).map(r => formatProperty(r))
                })
            }
            return JSON.stringify({
                success: true,
                found: false,
                message: 'Không tìm thấy bất động sản phù hợp với yêu cầu.',
                properties: []
            })
        }

        const properties = relevantResults.map(r => formatProperty(r))

        return JSON.stringify({
            success: true,
            found: true,
            message: `Tìm thấy ${properties.length} bất động sản phù hợp.`,
            properties
        })
    } catch (error) {
        console.error('searchProperties Error:', error)
        return JSON.stringify({
            success: false,
            message: 'Lỗi khi tìm kiếm bất động sản.',
            properties: []
        })
    }
}

/**
 * Save customer info as Lead
 * AI calls this when user provides contact info
 */
export async function saveCustomerInfo(
    phone: string,
    name?: string,
    email?: string,
    interest?: string,
    message?: string,
    sessionId?: string
): Promise<string> {
    try {
        // Validate phone
        if (!phone || phone.length < 8) {
            return JSON.stringify({
                success: false,
                message: 'Số điện thoại không hợp lệ. Vui lòng cung cấp số điện thoại đúng.'
            })
        }

        // Build message with interest info
        const fullMessage = [
            interest ? `Quan tâm: ${interest}` : null,
            message || null,
            'Khách hàng từ Chatbot'
        ].filter(Boolean).join(' | ')

        const lead = await prisma.lead.create({
            data: {
                name: name || 'Khách từ Chatbot',
                phone: phone.replace(/\s/g, ''),
                email: email || null,
                message: fullMessage,
                sessionId: sessionId || null,
                source: 'CHATBOT',
                status: 'NEW',
                updatedAt: new Date(),
            },
        })

        return JSON.stringify({
            success: true,
            message: `Đã lưu thông tin thành công! Chúng tôi sẽ liên hệ ${name || 'anh/chị'} qua số ${phone} sớm nhất.`,
            leadId: lead.id
        })
    } catch (error) {
        console.error('saveCustomerInfo Error:', error)
        return JSON.stringify({
            success: false,
            message: 'Không thể lưu thông tin. Vui lòng thử lại.'
        })
    }
}

/**
 * Get project detail by slug
 * AI calls this when user wants more info about a specific project
 */
export async function getProjectDetail(slug: string): Promise<string> {
    try {
        const project = await prisma.project.findUnique({
            where: { slug },
            include: {
                projectamenity: {
                    include: { amenity: true }
                }
            }
        })

        if (!project) {
            return JSON.stringify({
                success: false,
                message: `Không tìm thấy dự án với mã "${slug}".`
            })
        }

        return JSON.stringify({
            success: true,
            project: {
                name: project.name,
                location: project.fullLocation || project.location,
                priceRange: project.priceRange,
                status: project.status === 'SELLING' ? 'Đang mở bán' :
                    project.status === 'UPCOMING' ? 'Sắp mở bán' : 'Đã bán hết',
                description: project.description,
                amenities: project.projectamenity.map(pa => pa.amenity.name),
                url: `/du-an/${project.slug}`
            }
        })
    } catch (error) {
        console.error('getProjectDetail Error:', error)
        return JSON.stringify({
            success: false,
            message: 'Lỗi khi lấy thông tin dự án.'
        })
    }
}

// ============ Tool Executor ============
export async function executeTool(toolName: string, args: Record<string, any>, sessionId?: string): Promise<string> {
    console.log(`[Agent] Executing tool: ${toolName}`, args)

    switch (toolName) {
        case 'search_properties':
            return await searchProperties(args.query, args.limit || 5)

        case 'save_customer_info':
            return await saveCustomerInfo(args.phone, args.name, args.email, args.interest, args.message, sessionId)

        case 'get_project_detail':
            return await getProjectDetail(args.slug)

        default:
            return JSON.stringify({ success: false, message: `Tool "${toolName}" không tồn tại.` })
    }
}

// Legacy exports for backward compatibility
export { searchProperties as searchVectorDB }
export async function createLead(name: string, phone: string, message?: string) {
    return await saveCustomerInfo(phone, name, undefined, message)
}
