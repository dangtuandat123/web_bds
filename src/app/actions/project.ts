'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSession } from './auth'

export async function deleteProject(id: number) {
    // Validate session
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.project.delete({
            where: { id },
        })

        revalidatePath('/admin/projects')

        return { success: true }
    } catch (error) {
        console.error('Delete project error:', error)
        return { error: 'Không thể xóa dự án' }
    }
}
