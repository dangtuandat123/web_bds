/**
 * Format price to Vietnamese currency display
 * @param price - Price in VND
 * @returns Formatted string (e.g., "1.5 tỷ", "500 triệu")
 */
export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000
    return `${billions % 1 === 0 ? billions : billions.toFixed(1)} tỷ`
  }
  if (price >= 1_000_000) {
    const millions = price / 1_000_000
    return `${millions % 1 === 0 ? millions : millions.toFixed(0)} triệu`
  }
  return `${price.toLocaleString('vi-VN')} đ`
}

/**
 * Format area display
 * @param area - Area in square meters
 * @returns Formatted string (e.g., "120 m²")
 */
export function formatArea(area: number): string {
  return `${area.toLocaleString('vi-VN')} m²`
}

/**
 * Generate URL-friendly slug from Vietnamese text
 * @param text - Input text
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
