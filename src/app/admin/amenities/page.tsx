import { getAmenities } from '@/app/actions/amenity'
import AmenityManager from '@/components/admin/amenities/amenity-manager'

export default async function AmenitiesPage() {
    const result = await getAmenities()
    const amenities = result.success ? result.data : []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quản lý Tiện ích</h1>
                <p className="text-slate-600">Thêm, sửa, xóa các tiện ích cho dự án và sàn giao dịch</p>
            </div>

            <AmenityManager initialAmenities={amenities || []} />
        </div>
    )
}
