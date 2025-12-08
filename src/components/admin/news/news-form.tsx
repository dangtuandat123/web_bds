'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { news } from '@prisma/client'
import { toast } from 'sonner'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import RichTextEditor from '../projects/rich-text-editor'
import ImageUpload from '../image-upload'
import { createNews, updateNews } from '@/app/actions/news'

const newsSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    category: z.enum(['MARKET', 'FENG_SHUI', 'LEGAL']),
    categoryId: z.number().optional().nullable(),
    summary: z.string().min(1, 'Tóm tắt là bắt buộc'),
    content: z.string().min(1, 'Nội dung là bắt buộc'),
    thumbnailUrl: z.string().min(1, 'Ảnh đại diện là bắt buộc'),
    author: z.string().optional(),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
})

type NewsFormData = z.infer<typeof newsSchema>

interface Category {
    id: number
    name: string
    slug: string
}

interface NewsFormProps {
    initialData?: news & {
        isFeatured?: boolean
        isActive?: boolean
    }
    categories?: Category[]
}

export default function NewsForm({ initialData, categories = [] }: NewsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isEdit = !!initialData

    const form = useForm<NewsFormData>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: initialData?.title || '',
            category: initialData?.category || 'MARKET',
            summary: initialData?.summary || '',
            content: initialData?.content || '',
            thumbnailUrl: initialData?.thumbnailUrl || '',
            author: initialData?.author || 'Admin',
            isFeatured: initialData?.isFeatured || false,
            isActive: initialData?.isActive ?? true,
        },
    })

    const onSubmit = async (data: NewsFormData) => {
        setIsLoading(true)
        try {
            let result
            if (isEdit && initialData) {
                result = await updateNews(initialData.id, data)
            } else {
                result = await createNews(data)
            }

            if (result.success) {
                toast.success(result.message)
                router.push('/admin/news')
                router.refresh()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Form error:', error)
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tiêu đề tin tức" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category & Author */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Danh mục</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MARKET">Thị trường</SelectItem>
                                        <SelectItem value="FENG_SHUI">Phong thủy</SelectItem>
                                        <SelectItem value="LEGAL">Pháp lý</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tác giả</FormLabel>
                                <FormControl>
                                    <Input placeholder="Admin" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Thumbnail Upload */}
                <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Ảnh đại diện *</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Summary */}
                <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tóm tắt</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập tóm tắt ngắn gọn..."
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Content */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nội dung</FormLabel>
                            <FormControl>
                                <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cài đặt</h3>

                    <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Nổi bật</FormLabel>
                                    <FormDescription>
                                        Hiển thị tin tức này ở vị trí nổi bật
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Hoạt động</FormLabel>
                                    <FormDescription>
                                        Tin tức này hiển thị công khai
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-amber-500 to-amber-600"
                    >
                        {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tin tức'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                </div>
            </form>
        </Form>
    )
}
