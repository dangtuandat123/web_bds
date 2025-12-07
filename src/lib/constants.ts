// Shared constants for locations across the app
// Used in: Search filters, Project forms, Listing forms

export const LOCATIONS = [
    'Tất cả khu vực',
    // TP. Hồ Chí Minh
    'Quận 1',
    'Quận 2',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Quận 6',
    'Quận 7',
    'Quận 8',
    'Quận 9',
    'Quận 10',
    'Quận 11',
    'Quận 12',
    'Thủ Đức',
    'Bình Thạnh',
    'Gò Vấp',
    'Phú Nhuận',
    'Tân Bình',
    'Tân Phú',
    'Bình Tân',
    'Nhà Bè',
    'Hóc Môn',
    'Củ Chi',
    'Cần Giờ',
]

// Locations without "Tất cả khu vực" - for use in forms
export const LOCATION_OPTIONS = LOCATIONS.filter(loc => loc !== 'Tất cả khu vực')

// Price ranges for search filters
export const PRICE_RANGES = [
    { label: 'Tất cả mức giá', min: null, max: null },
    { label: 'Dưới 1 tỷ', min: null, max: 1000000000 },
    { label: '1-3 tỷ', min: 1000000000, max: 3000000000 },
    { label: '3-5 tỷ', min: 3000000000, max: 5000000000 },
    { label: '5-10 tỷ', min: 5000000000, max: 10000000000 },
    { label: 'Trên 10 tỷ', min: 10000000000, max: null },
]

// Area ranges for search filters
export const AREA_RANGES = [
    { label: 'Tất cả diện tích', min: null, max: null },
    { label: 'Dưới 50m²', min: null, max: 50 },
    { label: '50-100m²', min: 50, max: 100 },
    { label: '100-200m²', min: 100, max: 200 },
    { label: 'Trên 200m²', min: 200, max: null },
]

// Listing types
export const LISTING_TYPES = [
    { id: 'all', name: 'Tất cả loại hình' },
    { id: 'APARTMENT', name: 'Căn hộ' },
    { id: 'HOUSE', name: 'Nhà riêng' },
    { id: 'LAND', name: 'Đất nền' },
    { id: 'RENT', name: 'Cho thuê' },
]

// Project categories
export const PROJECT_CATEGORIES = [
    { id: 'all', name: 'Tất cả loại hình' },
    { id: 'APARTMENT', name: 'Căn hộ chung cư' },
    { id: 'VILLA', name: 'Biệt thự' },
    { id: 'LAND', name: 'Đất nền dự án' },
]

// Bedroom options
export const BEDROOM_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: '1', label: '1 PN' },
    { value: '2', label: '2 PN' },
    { value: '3', label: '3 PN' },
    { value: '4+', label: '4+ PN' },
]

// Direction options
export const DIRECTION_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Đông', label: 'Đông' },
    { value: 'Tây', label: 'Tây' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Bắc', label: 'Bắc' },
    { value: 'Đông Nam', label: 'Đông Nam' },
    { value: 'Đông Bắc', label: 'Đông Bắc' },
    { value: 'Tây Nam', label: 'Tây Nam' },
    { value: 'Tây Bắc', label: 'Tây Bắc' },
]

// Project status
export const PROJECT_STATUS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'SELLING', label: 'Đang mở bán' },
    { value: 'UPCOMING', label: 'Sắp mở bán' },
    { value: 'SOLD_OUT', label: 'Đã bán hết' },
]
