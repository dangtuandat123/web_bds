import { getLocations } from '@/app/actions/location'
import LocationManager from '@/components/admin/locations/location-manager'

export default async function LocationsPage() {
    const result = await getLocations()
    const locations = result.success ? result.data : []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quản lý Khu vực</h1>
                <p className="text-slate-600">Thêm, sửa, xóa các khu vực cho tìm kiếm và forms</p>
            </div>

            <LocationManager initialLocations={locations || []} />
        </div>
    )
}
