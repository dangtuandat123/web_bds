# Báo cáo cập nhật hệ thống web BĐS & AI chatbot

## 1. Tổng quan
- Hoàn thiện website bất động sản Happy Land với giao diện khách hàng, trang chi tiết BĐS/dự án, trang tin tức và form liên hệ ghi lead.
- Bổ sung chatbot AI bán hàng (OpenRouter) để tìm kiếm sản phẩm, chốt thông tin liên hệ và lưu lịch sử chat.
- Xây dựng admin panel bảo vệ bằng đăng nhập để quản trị dự án, listing, tin tức và khách hàng tiềm năng.

## 2. Công nghệ chính
- Next.js 15 (App Router) + React 19 + TypeScript; style bằng TailwindCSS + shadcn/ui + Lucide.
- Prisma ORM kết nối MySQL; seeds mẫu trong `prisma/seed.ts`, `prisma/seed-news.ts`; endpoint kiểm tra DB `src/app/api/test-db/route.ts`.
- Vercel AI SDK + OpenRouter (Gemini 2.5) cho chatbot; OpenAI client tích hợp tools.
- Form & validation: react-hook-form + zod; soạn thảo giàu nội dung bằng Tiptap; thông báo toast Sonner.

## 3. Chức năng đã xây dựng
- **Website khách hàng**
  - Trang chủ hiển thị hero, hộp tìm kiếm nâng cao và danh sách dự án/tin đăng nổi bật (`src/app/(public)/page.tsx`).
  - Danh sách sản phẩm `/nha-dat` với lọc loại hình, vị trí, giá, diện tích, phòng ngủ, hướng; phân trang. Chi tiết BĐS hiển thị gallery, thông số, tiện ích, tin liên quan và form liên hệ ghi lead (`src/app/(public)/nha-dat/[slug]/page.tsx`).
  - Danh sách dự án `/du-an` lọc theo loại, trạng thái, vị trí; trang chi tiết hiển thị tiện ích và các listing thuộc dự án (`src/app/(public)/du-an/[slug]/page.tsx`).
  - Trang tìm kiếm tổng hợp `/tim-kiem` gom listing + dự án; component `AdvancedSearch` dùng chung cho lọc listing/dự án.
  - Trang tin tức `/tin-tuc` có bộ lọc danh mục, ô tìm kiếm, đếm kết quả; trang chi tiết tăng view, hiển thị tin liên quan (`src/app/(public)/tin-tuc`).
  - Form liên hệ/đặt tư vấn gửi lead qua server action `submitLead` (`src/components/modules/detail/contact-form.tsx`).

- **AI chatbot bán hàng**
  - Widget nổi trên site với welcome message, markdown render, auto-scroll, nhập Enter để gửi (`src/components/modules/chat`).
  - API `/api/chat` dùng OpenRouter Gemini 2.5, system prompt “sales aggressive”, hỗ trợ tool:
    - `searchProperties` (fuzzy search theo tiêu đề/vị trí/mô tả/fullLocation, ưu tiên quận/huyện, lọc giá/diện tích/loại, trả link slug).
    - `createLead` lưu họ tên + SĐT (source CHATBOT).
  - Lưu toàn bộ phiên chat vào bảng `ChatSession` qua `onFinal`; sinh `sessionId` cho client.

- **Admin panel (bảo vệ bằng middleware + cookie JWT)**
  - Đăng nhập `/login` (demo admin@happyland.net.vn/admin123); middleware chặn truy cập nếu thiếu session (`src/middleware.ts`, `src/app/actions/auth.ts`).
  - Dashboard thống kê số dự án/listing/lead (`src/app/admin/page.tsx`).
  - Quản lý dự án: bảng dự án, form thêm/sửa với sinh slug tự động, chọn tiện ích, nhiều ảnh, trạng thái (UPCOMING/SELLING/SOLD_OUT), rich text nội dung (`src/components/admin/projects` + server actions `src/app/actions/project.ts`).
  - Quản lý listing: tab theo loại (Apartment/House/Land/Rent), CRUD với liên kết dự án, tiện ích, cờ nổi bật/kích hoạt, hình ảnh, thông số chi tiết (`src/components/admin/listings`, `src/app/actions/listing.ts`).
  - Quản lý tin tức: CRUD, sinh slug, rich text, chọn danh mục MARKET/FENG_SHUI/LEGAL, thumbnail, tác giả; tự tăng view khi xem (`src/components/admin/news`, `src/app/actions/news.ts`).
  - Quản lý lead: bảng lead với bộ lọc trạng thái, đổi trạng thái (NEW/CONTACTED/QUALIFIED/CONVERTED/LOST) và xóa lead (`src/components/admin/leads/lead-table.tsx`, `src/app/actions/lead.ts`).

- **Mô hình dữ liệu (Prisma)**
  - Các bảng: `User`, `Project`, `Listing`, `Amenity` (+ bảng nối ProjectAmenity, ListingAmenity), `Lead`, `ChatSession`, `News`.
  - Enum cho vai trò, loại hình dự án/listing, nguồn và trạng thái lead, danh mục tin tức; nhiều chỉ mục hỗ trợ truy vấn tìm kiếm/lọc.

## 4. Ghi chú triển khai
- Biến môi trường: `DATABASE_URL`, `OPENROUTER_API_KEY` (xem `.env.example`).
- Scripts: `npm run dev` để chạy, `npm run build`/`start` cho production; Prisma seed cấu hình trong `package.json`.
