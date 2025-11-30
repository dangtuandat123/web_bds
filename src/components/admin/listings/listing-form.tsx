'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Listing, Prisma } from '@prisma/client'
import { X, Plus } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import RichTextEditor from '../projects/rich-text-editor'
import { createListing, updateListing } from '@/app/actions/listing'
import { generateSlug } from '@/lib/utils/format'

// Zod schema
const listingSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    description: z.string().min(1, 'Mô tả là bắt buộc'),
    content: z.string().optional(),
    price: z.number().min(0, 'Giá phải >= 0'),
    area: z.number().min(0, 'Diện tích phải >= 0'),
    bedrooms: z.number().int().min(0, 'Số phòng ngủ phải >= 0'),
    bathrooms: z.number().int().min(0, 'Số phòng tắm phải >= 0'),
    direction: z.string().optional(),
    location: z.string().min(1, 'Vị trí là bắt buộc'),
    fullLocation: z.string().optional(),
    type: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'RENT']),
    projectId: z.number().nullable(),
    images: z.array(z.string().url('URL không hợp lệ')).min(1, 'Cần ít nhất 1 ảnh'),
    amenityIds: z.array(z.number()),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
})

type ListingFormData = z.infer<typeof listingSchema>

interface Amenity {
    id: number
    name: string
    icon: string
}

interface Project {
    id: number
    name: string
}

interface ListingFormProps {
    initialData?: Listing & { amenities: { amenityId: number }[] }
    amenities: Amenity[]
    projects: Project[]
}

export default function ListingForm({ initialData, amenities, projects }: ListingFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isEdit = !!initialData

    // Parse JSON images
    const defaultImages: string[] = initialData
        ? (Array.isArray(initialData.images)
            ? (initialData.images as Prisma.JsonArray).filter((img): img is string => typeof img === 'string')
            : [])
        : ['']

    const form = useForm<ListingFormData>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            content: initialData?.content || '',
            price: initialData?.price || 0,
            area: initialData?.area || 0,
            bedrooms: initialData?.bedrooms || 0,
            bathrooms: initialData?.bathrooms || 0,
            direction: initialData?.direction || '',
            location: initialData?.location || '',
            fullLocation: initialData?.fullLocation || '',
            type: initialData?.type || 'APARTMENT',
            projectId: initialData?.projectId || null,
            images: defaultImages,
            amenityIds: initialData?.amenities?.map((a) => a.amenityId) || [],
            isFeatured: initialData?.isFeatured || false,
            isActive: initialData?.isActive ?? true,
        },
    })

    const { watch, setValue } = form
    const images = watch('images')

    const onSubmit = async (data: ListingFormData) => {
        setIsLoading(true)
        try {
            const result = isEdit && initialData
                ? await updateListing(initialData.id, data)
                : await createListing(data)

            if (result.success) {
                toast.success(result.message)
                router.push('/admin/listings')
                router.refresh()
            } else {
                toast.error(result.error || 'Có lỗi xảy ra')
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Main Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông tin chính</h3>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề *</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Ví dụ: Căn hộ 3PN view sông Landmark 81"
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
                                    <Input {...field} placeholder="can-ho-3pn-view-song" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="type"
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
                                            <SelectItem value="HOUSE">Nhà riêng</SelectItem>
                                            <SelectItem value="LAND">Đất nền</SelectItem>
                                            <SelectItem value="RENT">Cho thuê</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dự án</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))}
                                        defaultValue={field.value?.toString() || 'null'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn dự án" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="null">Không thuộc dự án</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Chọn dự án mà listing này thuộc về (nếu có)
                                    </FormDescription>
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
                </div>

                <Separator />

                {/* Specifications */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Thông số</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá (VNĐ) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            placeholder="5000000000"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diện tích (m²) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            placeholder="120"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bedrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phòng ngủ</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            placeholder="3"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phòng tắm</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            placeholder="2"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="direction"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hướng</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ví dụ: Đông Nam, Tây Bắc" />
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
                                        placeholder="Mô tả ngắn gọn về căn hộ/nhà..."
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
                                        content={field.value || ''}
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
                    <p className="text-sm text-slate-600">Nhập URL hình ảnh</p>

                    <div className="space-y-2">
                        {images.map((_, index) => (
                            <div key={index} className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name={`images.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input {...field} placeholder="https://images.unsplash.com/..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {images.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
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

                <Separator />

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
                                        Hiển thị listing này ở vị trí nổi bật
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
                                        Listing này hiển thị công khai
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

                {/* Submit */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-amber-500 to-amber-600"
                    >
                        {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo listing'}
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
