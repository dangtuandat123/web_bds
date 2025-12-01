'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

// Submit Lead from Contact Form
export async function submitLead(data: {
    name: string
    phone: string
    message?: string
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
                source: 'FORM',
                status: 'NEW',
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
export async function updateLeadStatus(leadId: number, newStatus: LeadStatus) {
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
