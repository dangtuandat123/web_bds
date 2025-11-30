# 🧪 Manual Test Guide: Project Form

## Pre-requisites
✅ Amenities seeded (10 total)
✅ Form loads at `/admin/projects/new`
✅ All fields visible

## Test Case 1: Create New Project

### Steps:
1. Navigate to: http://localhost:3000/admin/projects/new

2. Fill in **Thông tin cơ bản**:
   - Tên dự án: `Căn hộ Vinhomes Grand Park`
   - Slug: Should auto-fill to `can-ho-vinhomes-grand-park`
   - Loại hình: Select `Căn hộ`
   - Trạng thái: Select `Đang bán`
   - Vị trí: `Quận 9, TP. Thủ Đức`
   - Địa chỉ đầy đủ: `Đường Nguyễn Xiển, Phường Long Thạnh Mỹ`
   - Giá: `40-50 triệu/m²`

3. Fill in **Mô tả**:
   - Mô tả ngắn: `Dự án căn hộ cao cấp tại Quận 9`
   - Nội dung: Use toolbar to format text:
     - Type some text
     - Select text and click Bold
     - Add bullet points

4. Fill in **Hình ảnh**:
   - Image URL 1: `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00`
   - Click "Thêm ảnh"
   - Image URL 2: `https://images.unsplash.com/photo-1512917774080-9991f1c4c750`

5. Select **Tiện ích** (check 3-4 boxes):
   - ☑ Hồ bơi
   - ☑ Gym
   - ☑ An ninh 24/7
   - ☑ Công viên

6. Click **"Tạo dự án"** button

### Expected Results:
✅ Form validates successfully (no red error messages)
✅ Browser redirects to `/admin/projects`
✅ New project appears in the table
✅ Toast/success message shows (if implemented)

### What to Check:
- Slug was auto-generated correctly
- Images array has 2 URLs
- Amenities are saved (4 selected)
- Rich text content has HTML formatting

## Test Case 2: Validation Errors

### Steps:
1. Go to new project form
2. Leave **required fields empty**
3. Click Submit

### Expected Results:
❌ Red validation messages appear:
- "Tên dự án là bắt buộc"
- "Vị trí là bắt buộc"
- "Mô tả là bắt buộc"
- "Giá là bắt buộc"
- "Cần ít nhất 1 ảnh"

## Test Case 3: Edit Existing Project

### Steps:
1. Go to `/admin/projects`
2. Click "Edit" button on any project
3. Modify fields
4. Click "C ập nhật"

### Expected Results:
✅ Form pre-fills with existing data
✅ Amenities checkboxes show correct selections
✅ Images list shows all existing URLs
✅ Update saves successfully

## Troubleshooting

### If form doesn't submit:
1. Open DevTools Console
2. Check for errors
3. Check Network tab for failed requests

### If amenities don't show:
- Run: `node scripts/seed-amenities.js`

### If validation doesn't work:
- Check Zod schema in project-form.tsx

---

**Quick Test Command:**
Open browser incognito mode (no extensions) and test to avoid hydration warnings.
