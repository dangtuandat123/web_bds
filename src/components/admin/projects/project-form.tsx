'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Project, Prisma } from '@prisma/client'
import { X, Plus } from 'lucide-react'
import {
    Form,
    FormControl,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RichTextEditor from './rich-text-editor'
import ImageUpload from '../image-upload'
import { createProject, updateProject } from '@/app/actions/project'

// Zod schema
const projectSchema = z.object({
    name: z.string().min(1, 'Tên dự án là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    category: z.enum(['APARTMENT', 'VILLA', 'LAND']),
    location: z.string().min(1, 'Vị trí là bắt buộc'),
    fullLocation: z.string().optional(),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
    content: z.string().optional(),
    priceRange: z.string().min(1, 'Giá là bắt buộc'),
    status: z.enum(['UPCOMING', 'SELLING', 'SOLD_OUT']),
    images: z.array(z.string().min(1, 'Ảnh không được trống')).min(1, 'Cần ít nhất 1 ảnh'),
    amenityIds: z.array(z.number()),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface Amenity {
    id: number
    name: string
    icon: string
}

interface ProjectFormProps {
    initialData?: Project & { amenities: { amenityId: number }[] }
    amenities: Amenity[]
}

export default function ProjectForm({ initialData, amenities }: ProjectFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isEdit = !!initialData

    // Parse JSON images
    const defaultImages: string[] = initialData
        ? (Array.isArray(initialData.images)
            ? (initialData.images as Prisma.JsonArray).filter((img): img is string => typeof img === 'string')
            : [])
        : ['']

    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: initialData?.name || '',
            slug: initialData?.slug || '',
            category: initialData?.category || 'APARTMENT',
            location: initialData?.location || '',
            fullLocation: initialData?.fullLocation || '',
            description: initialData?.description || '',
            content: initialData?.content || '',
            priceRange: initialData?.priceRange || '',
            status: initialData?.status || 'SELLING',
            images: defaultImages,
            amenityIds: initialData?.amenities?.map((a) => a.amenityId) || [],
        },
    })

    const { watch, setValue } = form
    const images = watch('images')

    // Auto-generate slug
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const onSubmit = async (data: ProjectFormData) => {
        setIsLoading(true)
        try {
            if (isEdit && initialData) {
                await updateProject(initialData.id, data)
            } else {
                await createProject(data)
            }
            router.push('/admin/projects')
            router.refresh()
        } catch (error) {
            console.error('Form error:', error)
            alert('Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên dự án *</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Ví dụ: Căn hộ Vinhomes Central Park"
                                        onBlur={(e) => {
                                            field.onBlur()
                                            if (!isEdit) {
                                                setValue('slug', generateSlug(e.target.value))
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug (URL) *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="vi-du-vinhomes-central-park" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại hình *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại hình" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="APARTMENT">Căn hộ</SelectItem>
                                            <SelectItem value="VILLA">Biệt thự</SelectItem>
                                            <SelectItem value="LAND">Đất nền</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trạng thái *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UPCOMING">Sắp mở bán</SelectItem>
                                            <SelectItem value="SELLING">Đang bán</SelectItem>
                                            <SelectItem value="SOLD_OUT">Đã bán hết</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vị trí *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ví dụ: Quận 9, TP. Thủ Đức" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fullLocation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Địa chỉ đầy đủ</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Số nhà, đường, phường, quận..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priceRange"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ví dụ: 35-50 triệu/m²" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Mô tả</h3>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả ngắn *</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Mô tả ngắn gọn về dự án..."
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nội dung chi tiết</FormLabel>
                                <FormControl>
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Hình ảnh</h3>
                    <p className="text-sm text-slate-600">Upload ảnh dự án (JPG, PNG, WebP, GIF - tối đa 5MB)</p>

                    <div className="space-y-4">
                        {images.map((img, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <ImageUpload
                                        value={img}
                                        onChange={(url) => {
                                            const newImages = [...images]
                                            newImages[index] = url
                                            setValue('images', newImages)
                                        }}
                                        onRemove={() => {
                                            if (images.length > 1) {
                                                const newImages = images.filter((_, i) => i !== index)
                                                setValue('images', newImages)
                                            }
                                        }}
                                    />
                                </div>
                                {images.length > 1 && !img && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-8"
                                        onClick={() => {
                                            const newImages = images.filter((_, i) => i !== index)
                                            setValue('images', newImages)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValue('images', [...images, ''])}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm ảnh
                    </Button>
                </div>

                <Separator />

                {/* Amenities */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tiện ích</h3>

                    <FormField
                        control={form.control}
                        name="amenityIds"
                        render={() => (
                            <FormItem>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {amenities.map((amenity) => (
                                        <FormField
                                            key={amenity.id}
                                            control={form.control}
                                            name="amenityIds"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(amenity.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), amenity.id])
                                                                    : field.onChange(
                                                                        field.value?.filter((value) => value !== amenity.id)
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">
                                                        {amenity.icon} {amenity.name}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-amber-500 to-amber-600"
                    >
                        {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo dự án'}
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
