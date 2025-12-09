'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { lead_status } from '@prisma/client'

// Submit Lead from Contact Form
export async function submitLead(data: {
    name: string
    phone: string
    message?: string
    referenceUrl?: string
}) {
    try {
        // Validation
        if (!data.name || data.name.trim().length < 2) {
            return { success: false, message: 'Tên phải có ít nhất 2 ký tự' }
        }

        if (!data.phone || data.phone.trim().length < 10) {
            return { success: false, message: 'Số điện thoại không hợp lệ' }
        }

        // Validate phone is numeric
        const phoneDigits = data.phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
            return { success: false, message: 'Số điện thoại phải có ít nhất 10 chữ số' }
        }

        // Create lead
        await prisma.lead.create({
            data: {
                name: data.name.trim(),
                phone: data.phone.trim(),
                message: data.message?.trim() || null,
                referenceUrl: data.referenceUrl || null,
                source: 'FORM',
                status: 'NEW',
                updatedAt: new Date(),
            },
        })

        // Revalidate admin page if exists
        revalidatePath('/admin/leads')

        return { success: true, message: 'Gửi thông tin thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.' }
    } catch (error) {
        console.error('Error submitting lead:', error)
        return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' }
    }
}

// Update Lead Status (Admin only)
export async function updateLeadStatus(leadId: number, newStatus: lead_status) {
    try {
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus },
        })

        revalidatePath('/admin/leads')

        return { success: true, message: 'Đã cập nhật trạng thái' }
    } catch (error) {
        console.error('Error updating lead status:', error)
        return { success: false, message: 'Không thể cập nhật. Vui lòng thử lại.' }
    }
}

// Delete Lead (Admin only)
export async function deleteLead(leadId: number) {
    try {
        await prisma.lead.delete({
            where: { id: leadId },
        })

        revalidatePath('/admin/leads')

        return { success: true, message: 'Đã xóa khách hàng' }
    } catch (error) {
        console.error('Error deleting lead:', error)
        return { success: false, message: 'Không thể xóa. Vui lòng thử lại.' }
    }
}

// Create Lead from FormData (for contact form)
export async function createLead(formData: FormData) {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string | undefined
    const message = formData.get('message') as string | undefined
    const source = (formData.get('source') as string) || 'FORM'

    try {
        if (!phone || phone.trim().length < 8) {
            return { success: false, error: 'Số điện thoại không hợp lệ' }
        }

        await prisma.lead.create({
            data: {
                name: name?.trim() || 'Khách hàng',
                phone: phone.trim(),
                email: email?.trim() || null,
                message: message?.trim() || null,
                source: source === 'CONTACT_PAGE' ? 'FORM' : 'FORM',
                status: 'NEW',
                updatedAt: new Date(),
            },
        })

        revalidatePath('/admin/leads')
        return { success: true, message: 'Đã lưu thông tin thành công!' }
    } catch (error) {
        console.error('Error creating lead:', error)
        return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' }
    }
}

