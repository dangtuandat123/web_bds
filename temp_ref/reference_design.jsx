import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Phone, MapPin, Mail, Menu, X, Home, Building, Newspaper, ArrowRight, CheckCircle, Search, Facebook, Instagram, Youtube, Filter, ChevronDown, RotateCcw, Bed, Compass, Heart, Share2, Star, ChevronLeft, ChevronRight, XCircle, Check, Camera, Image as ImageIcon, ZoomIn, Maximize2 } from 'lucide-react';

// --- STYLES FOR ANIMATIONS ---
const customStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate3d(0, 20px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
  .animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
  .animate-float { animation: float 3s ease-in-out infinite; }

  /* Smooth Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

// --- LIGHTBOX COMPONENT ---
const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  // Handle keyboard events & Lock Body Scroll
  useEffect(() => {
    // Khóa cuộn trang khi Lightbox mở
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Dọn dẹp: Mở lại cuộn trang và xóa event listener
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (!images || images.length === 0) return null;

  return (
    // Fixed inset-0 với z-index cực cao để đè lên tất cả
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in touch-none">
      
      {/* Nút đóng (Góc trên phải) */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
      >
        <X size={28} />
      </button>

      {/* Container chính full màn hình */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        
        {/* Nút Previous (Trái) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 md:left-8 z-40 p-2 md:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm group border border-white/10"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Ảnh chính - Responsive fit screen */}
        <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
            <img 
            src={images[currentIndex]} 
            alt={`Gallery ${currentIndex + 1}`} 
            className="max-w-full max-h-full object-contain shadow-2xl animate-zoom-in rounded-sm select-none"
            />
        </div>

        {/* Nút Next (Phải) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 md:right-8 z-40 p-2 md:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm group border border-white/10"
        >
          <ChevronRight size={24} className="md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {/* Bộ đếm ảnh (Dưới cùng) */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 shadow-lg">
           {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// --- DỮ LIỆU & CONSTANTS ---
const ITEMS_PER_PAGE = 6;
const PROJECT_CATEGORIES = [ { id: 'all', name: 'Tất cả dự án' }, { id: 'can-ho', name: 'Căn hộ chung cư' }, { id: 'nha-pho', name: 'Nhà phố - Biệt thự' }, { id: 'dat-nen', name: 'Đất nền dự án' } ];
const EXCHANGE_CATEGORIES = [ { id: 'all', name: 'Tất cả tin đăng' }, { id: 'ban-can-ho', name: 'Bán căn hộ' }, { id: 'ban-nha-pho', name: 'Bán nhà phố' }, { id: 'ban-dat-nen', name: 'Bán đất nền' }, { id: 'cho-thue', name: 'Cho thuê' } ];
const PRICE_RANGES = [ { label: 'Tất cả mức giá', min: 0, max: Infinity }, { label: 'Dưới 2 Tỷ', min: 0, max: 2 }, { label: '2 - 5 Tỷ', min: 2, max: 5 }, { label: '5 - 8 Tỷ', min: 5, max: 8 }, { label: 'Trên 8 Tỷ', min: 8, max: Infinity } ];
const AREA_RANGES = [ { label: 'Tất cả diện tích', min: 0, max: Infinity }, { label: 'Dưới 50m²', min: 0, max: 50 }, { label: '50 - 80m²', min: 50, max: 80 }, { label: '80 - 150m²', min: 80, max: 150 }, { label: 'Trên 150m²', min: 150, max: Infinity } ];
const BEDROOM_OPTIONS = [ { value: 'all', label: 'Phòng ngủ' }, { value: '1', label: '1 PN' }, { value: '2', label: '2 PN' }, { value: '3', label: '3 PN' }, { value: '4+', label: '4+ PN' } ];
const DIRECTION_OPTIONS = [ { value: 'all', label: 'Hướng nhà' }, { value: 'Đông', label: 'Đông' }, { value: 'Tây', label: 'Tây' }, { value: 'Nam', label: 'Nam' }, { value: 'Bắc', label: 'Bắc' }, { value: 'Đông Nam', label: 'Đông Nam' }, { value: 'Tây Nam', label: 'Tây Nam' }, { value: 'Đông Bắc', label: 'Đông Bắc' }, { value: 'Tây Bắc', label: 'Tây Bắc' } ];
const LOCATIONS = [ 'Tất cả khu vực', 'TP. Thủ Đức', 'Quận 9', 'Long Phước', 'Phú Hữu' ];
const NEWS_CATEGORIES = [ { id: 'all', name: 'Tất cả' }, { id: 'Pháp lý', name: 'Pháp lý' }, { id: 'Tin tức thị trường', name: 'Thị trường' }, { id: 'Cẩm nang', name: 'Cẩm nang' } ];

const BASE_PROJECTS = [
  {
    id: 'mt-eastmark-city',
    title: 'CĂN HỘ MT EASTMARK CITY',
    categoryId: 'can-ho',
    category: 'Căn hộ chung cư',
    price: '36 triệu/m²',
    priceValue: 2.5,
    location: 'TP. Thủ Đức',
    fullLocation: 'Đường Vành Đai 3, TP. Thủ Đức, TP.HCM',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    description: 'Khu phức hợp căn hộ cao cấp ven sông, biểu tượng sống mới tại tâm điểm thành phố Thủ Đức.',
    features: ['View sông trọn đời', 'Tiện ích đẳng cấp 5*', 'Pháp lý hoàn chỉnh', 'Thanh toán 30% nhận nhà'],
    content: 'Thông tin chi tiết về dự án MT Eastmark City. Vị trí đắc địa, kết nối thuận tiện. Quy mô dự án lớn với nhiều tiện ích nội khu như hồ bơi, công viên, trung tâm thương mại.',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600596542815-2a4d9f10927c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'happy-home-villas',
    title: 'KHU BIỆT THỰ HAPPY HOME',
    categoryId: 'nha-pho',
    category: 'Nhà phố - Biệt thự',
    price: '15 Tỷ/căn',
    priceValue: 15,
    location: 'Quận 9',
    fullLocation: 'Quận 9, TP. Thủ Đức',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
    description: 'Không gian sống thượng lưu với thiết kế biệt thự đơn lập và song lập sang trọng.',
    features: ['An ninh 24/7', 'Hồ bơi riêng', 'Công viên nội khu'],
    content: 'Dự án biệt thự biệt lập với không gian xanh mát, mang lại sự riêng tư tuyệt đối cho gia chủ.',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1000'
    ]
  }
];

const BASE_LISTINGS = [
  {
    id: 'ban-2pn-73m2-hybrid',
    title: 'Bán 2PN 73m2 tặng nội thất, block Hybrid chỉ 4.1 tỷ view sông',
    categoryId: 'ban-can-ho',
    price: '4.1 Tỷ',
    priceValue: 4.1,
    area: '73m²',
    areaValue: 73,
    bedrooms: 2,
    bathrooms: 2,
    direction: 'Đông Nam',
    location: 'TP. Thủ Đức',
    fullLocation: 'MT Eastmark City, TP. Thủ Đức',
    image: 'https://images.unsplash.com/photo-1502005229766-3a2ebcea591b?auto=format&fit=crop&q=80&w=1000',
    tags: ['Tặng nội thất', 'View sông', 'Block Hybrid'],
    content: 'Cần bán nhanh căn hộ 2 phòng ngủ, diện tích 73m2. Tặng gói nội thất cao cấp. Vị trí Block Hybrid đắc địa, tầm nhìn trực diện sông thoáng mát. Giá bán chỉ 4.1 tỷ đồng. Liên hệ ngay để xem nhà.',
    features: ['Hồ bơi tràn bờ', 'Công viên ven sông', 'Khu BBQ', 'An ninh 24/7', 'Gym & Spa', 'Siêu thị mini'],
    gallery: [
      'https://images.unsplash.com/photo-1502005229766-3a2ebcea591b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'ban-can-ho-ricca',
    title: 'Bán căn hộ Ricca Quận 9, 1PN+1 giá tốt',
    categoryId: 'ban-can-ho',
    price: '2.1 Tỷ',
    priceValue: 2.1,
    area: '56m²',
    areaValue: 56,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'Tây Bắc',
    location: 'Quận 9',
    fullLocation: 'Đường Gò Cát, Phú Hữu, TP. Thủ Đức',
    image: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000',
    tags: ['Giá tốt', 'Sổ hồng có sẵn'],
    content: 'Căn hộ Ricca thiết kế thông minh 1PN+1, phù hợp gia đình trẻ. Tiện ích hồ bơi, BBQ, công viên.',
    features: ['Hồ bơi người lớn & trẻ em', 'Sân chơi trẻ em', 'Nhà trẻ', 'Food Court', 'Sảnh đón sang trọng'],
    gallery: [
       'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&q=80&w=1000',
       'https://images.unsplash.com/photo-1556912172-4545a9310c97?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'ban-dat-nen-long-phuoc',
    title: 'Đất nền Long Phước, sổ đỏ trao tay, xây dựng tự do',
    categoryId: 'ban-dat-nen',
    price: '3.5 Tỷ',
    priceValue: 3.5,
    area: '100m²',
    areaValue: 100,
    bedrooms: 0,
    bathrooms: 0,
    direction: 'Nam',
    location: 'Long Phước',
    fullLocation: 'Long Phước, TP. Thủ Đức',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
    tags: ['Sổ đỏ', 'Xây tự do', 'Gần sông'],
    content: 'Đất nền thổ cư 100%, khu dân cư hiện hữu, đường nhựa 8m. Thích hợp mua ở hoặc đầu tư lâu dài.',
    features: ['Đường nhựa 8m', 'Điện âm nước máy', 'Gần sông thoáng mát', 'Khu dân cư hiện hữu', 'Xây dựng tự do'],
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'thue-can-ho-studio',
    title: 'Cho thuê Studio Full nội thất Vinhomes Grand Park',
    categoryId: 'cho-thue',
    price: '5 Triệu/tháng',
    priceValue: 0.005,
    area: '30m²',
    areaValue: 30,
    bedrooms: 1,
    bathrooms: 1,
    direction: 'Đông',
    location: 'Quận 9',
    fullLocation: 'Vinhomes Grand Park, Quận 9',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
    tags: ['Full nội thất', 'Dọn vào ngay'],
    content: 'Cho thuê nhanh căn studio đầy đủ tiện nghi...',
    features: ['Full nội thất', 'Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Bếp từ', 'Internet tốc độ cao'],
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 'ban-biet-thu-vuon',
    title: 'Bán biệt thự vườn 500m2 ven sông, nội thất gỗ quý',
    categoryId: 'ban-nha-pho',
    price: '25 Tỷ',
    priceValue: 25,
    area: '500m²',
    areaValue: 500,
    bedrooms: 4,
    bathrooms: 5,
    direction: 'Đông Nam',
    location: 'Long Phước',
    fullLocation: 'Đường số 5, Long Phước, TP. Thủ Đức',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
    tags: ['Ven sông', 'Nghỉ dưỡng', 'Sổ hồng riêng'],
    content: 'Biệt thự nghỉ dưỡng ven sông tắc, không khí trong lành. Tặng toàn bộ nội thất gỗ quý cho gia chủ mới.',
    features: ['Sân vườn rộng', 'Gara ô tô', 'Hồ cá Koi', 'Nội thất gỗ cao cấp', 'Phòng xông hơi', 'View sông trực diện'],
    gallery: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'
    ]
  }
];

const BASE_NEWS = [
  {
    id: 'luat-bds',
    title: 'Luật Bất Động Sản',
    category: 'Pháp lý',
    date: '20/11/2023',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000',
    excerpt: 'Cập nhật những thay đổi mới nhất và các quy định chung của Luật Bất Động Sản hiện hành.',
    content: 'Nội dung chi tiết về Luật Bất Động Sản. Các quy định về quyền sở hữu, chuyển nhượng, và các nghĩa vụ tài chính liên quan đến đất đai và nhà ở.'
  },
  {
    id: 'sua-luat-kinh-doanh',
    title: 'Sửa Luật Kinh doanh BĐS: Cá nhân không được làm môi giới độc lập',
    category: 'Tin tức thị trường',
    date: '18/11/2023',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
    excerpt: 'Điểm mới quan trọng trong Luật Kinh doanh Bất động sản (sửa đổi) về hoạt động môi giới cá nhân.',
    content: 'Theo Luật Kinh doanh Bất động sản sửa đổi, cá nhân muốn hành nghề môi giới bất động sản phải có chứng chỉ hành nghề và phải hoạt động trong một doanh nghiệp kinh doanh dịch vụ sàn giao dịch bất động sản.'
  },
  {
    id: 'ho-so-cong-chung',
    title: 'Hồ sơ cần chuẩn bị khi đi công chứng mua bán BĐS',
    category: 'Cẩm nang',
    date: '15/11/2023',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000',
    excerpt: 'Hướng dẫn chi tiết các giấy tờ cần thiết để thủ tục công chứng diễn ra suôn sẻ.',
    content: 'Để thực hiện thủ tục công chứng mua bán nhà đất, bên bán và bên mua cần chuẩn bị đầy đủ các loại giấy tờ như: CMND/CCCD, Sổ hộ khẩu/Xác nhận cư trú, Giấy chứng nhận quyền sử dụng đất.'
  }
];

const PROJECTS = [...BASE_PROJECTS, ...BASE_PROJECTS, ...BASE_PROJECTS, ...BASE_PROJECTS].map((p, i) => ({ ...p, id: `${p.id}-${i}` }));
const LISTINGS = [...BASE_LISTINGS, ...BASE_LISTINGS, ...BASE_LISTINGS, ...BASE_LISTINGS].map((l, i) => ({ ...l, id: `${l.id}-${i}` }));
const NEWS_ARTICLES = [...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS, ...BASE_NEWS].map((n, i) => ({ ...n, id: `${n.id}-${i}` }));

// --- UI COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? Check : XCircle;

  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 animate-slide-in`}>
       <Icon size={20} />
       <span className="font-bold text-sm">{message}</span>
       <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14}/></button>
    </div>
  );
};

const FloatingContact = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
    <button className="w-12 h-12 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-bounce"><span className="font-bold text-xs">Zalo</span></button>
    <button className="w-12 h-12 bg-red-600 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 hover:bg-red-700"><Phone size={20} /></button>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); } 
    else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-16 animate-fade-in">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500'}`}><ChevronLeft size={18} /></button>
      {getPageNumbers().map((page, idx) => (
        <button key={idx} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={typeof page !== 'number'} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 text-sm ${page === currentPage ? 'bg-amber-500 text-white shadow-lg scale-110' : typeof page !== 'number' ? 'bg-transparent text-slate-400 cursor-default' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-amber-300 hover:text-amber-600'}`}>{page}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${currentPage === totalPages ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500'}`}><ChevronRight size={18} /></button>
    </div>
  );
};

const Header = ({ setCurrentPage, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navItems = [ { label: 'Trang chủ', value: 'home' }, { label: 'Dự án', value: 'projects' }, { label: 'Sàn giao dịch', value: 'exchange' }, { label: 'Tin tức & Pháp lý', value: 'news' } ];

  return (
    <>
      <div className="bg-slate-900 text-slate-300 py-2 text-xs sm:text-sm relative z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center hover:text-amber-500 transition-colors cursor-pointer"><Phone size={14} className="mr-2 text-amber-500" /> 0912 345 678</span>
            <span className="flex items-center hidden sm:flex hover:text-amber-500 transition-colors cursor-pointer"><Mail size={14} className="mr-2 text-amber-500" /> info@happyland.net.vn</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-xs text-slate-500 hidden md:inline">Kết nối với chúng tôi:</span>
            <Facebook size={14} className="cursor-pointer hover:text-blue-500 transition-colors" />
            <Instagram size={14} className="cursor-pointer hover:text-pink-500 transition-colors" />
            <Youtube size={14} className="cursor-pointer hover:text-red-500 transition-colors" />
          </div>
        </div>
      </div>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="group flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:scale-105 transition-transform"><Building className="text-white" size={20} /></div>
              <div className="flex flex-col leading-none"><span className="text-xl font-extrabold text-slate-800 tracking-tight">HAPPY LAND</span><span className="text-[10px] font-bold text-amber-600 tracking-[0.3em] uppercase mt-1">Real Estate</span></div>
            </div>
            <nav className="hidden lg:flex space-x-8 items-center">
              {navItems.map((item) => (
                <button key={item.value} onClick={() => setCurrentPage(item.value)} className={`text-sm font-bold uppercase tracking-wide transition-all duration-300 relative px-2 py-1 rounded hover:bg-slate-50 ${currentPage === item.value ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'}`}>{item.label}<span className={`absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-amber-500 transform -translate-x-1/2 transition-transform duration-300 ${currentPage === item.value ? 'scale-x-100' : 'scale-x-0'}`}></span></button>
              ))}
              <button className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-xl hover:scale-105 active:scale-95 border border-slate-700">Liên hệ tư vấn</button>
            </nav>
            <button className="lg:hidden text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <button key={item.value} onClick={() => { setCurrentPage(item.value); setIsMobileMenuOpen(false); }} className={`py-3 text-left font-bold border-b border-slate-50 last:border-0 hover:text-amber-600 transition-colors flex items-center justify-between ${currentPage === item.value ? 'text-amber-600' : 'text-slate-600'}`}>{item.label}<ArrowRight size={16} className="opacity-50" /></button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

const AdvancedSearch = ({ onSearch, compact = false, isProjectSearch = false }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [price, setPrice] = useState(0);
  const [area, setArea] = useState(0);
  const [type, setType] = useState(isProjectSearch ? PROJECT_CATEGORIES[0].id : EXCHANGE_CATEGORIES[0].id);
  const [bedrooms, setBedrooms] = useState(BEDROOM_OPTIONS[0].value);
  const [direction, setDirection] = useState(DIRECTION_OPTIONS[0].value);
  const typeOptions = isProjectSearch ? PROJECT_CATEGORIES : EXCHANGE_CATEGORIES;

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ keyword, location: location === 'Tất cả khu vực' ? '' : location, priceRange: PRICE_RANGES[price], areaRange: AREA_RANGES[area], type, bedrooms, direction });
  };

  const SelectBox = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="group">
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider group-focus-within:text-amber-500 transition-colors">{label}</label>
      <div className="relative">
        <select className="w-full h-11 pl-3 pr-8 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 appearance-none text-sm font-medium transition-all cursor-pointer text-slate-700" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt, idx) => (<option key={idx} value={opt.value !== undefined ? opt.value : (opt.id || opt)}>{opt.label || opt.name || opt}</option>))}
        </select>
        {Icon ? <Icon size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" /> : <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />}
      </div>
    </div>
  );

  return (
    <div className={`bg-white/90 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl border border-white/50 relative z-20 mx-auto animate-fade-in-up ${compact ? 'max-w-4xl mt-0 shadow-lg' : '-mt-24 max-w-6xl'}`}>
      {!compact && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-slate-800 font-bold flex items-center uppercase text-sm tracking-wide"><span className="bg-amber-100 text-amber-600 p-1.5 rounded mr-2"><Search size={16} /></span>Tìm kiếm {isProjectSearch ? 'dự án' : 'bất động sản'}</h3>
          <span className="text-xs text-slate-400 italic hidden sm:inline">Lọc nhanh theo nhu cầu của bạn</span>
        </div>
      )}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-4">
          <div className="lg:col-span-2">
             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Từ khóa</label>
             <div className="relative">
                <input type="text" placeholder={isProjectSearch ? "Nhập tên dự án (ví dụ: MT Eastmark)" : "Nhập tên dự án, địa điểm..."} className="w-full h-11 pl-10 pr-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm transition-all" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
             </div>
          </div>
          <SelectBox label="Loại hình" value={type} onChange={setType} options={typeOptions} icon={Home} />
          <SelectBox label="Khu vực" value={location} onChange={setLocation} options={LOCATIONS} icon={MapPin} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-4 items-end">
           <div className={`col-span-2 ${isProjectSearch ? 'sm:col-span-2' : 'sm:col-span-1'}`}><SelectBox label="Mức giá" value={price} onChange={(v) => setPrice(Number(v))} options={PRICE_RANGES.map((r,i) => ({value: i, label: r.label}))} /></div>
           <div className={`col-span-2 ${isProjectSearch ? 'sm:col-span-2' : 'sm:col-span-1'}`}><SelectBox label="Diện tích" value={area} onChange={(v) => setArea(Number(v))} options={AREA_RANGES.map((r,i) => ({value: i, label: r.label}))} /></div>
           {!isProjectSearch && (<><div className="col-span-1"><SelectBox label="Phòng ngủ" value={bedrooms} onChange={setBedrooms} options={BEDROOM_OPTIONS} icon={Bed} /></div><div className="col-span-1"><SelectBox label="Hướng" value={direction} onChange={setDirection} options={DIRECTION_OPTIONS} icon={Compass} /></div></>)}
           <div className={`col-span-2 ${isProjectSearch ? 'md:col-span-4 lg:col-span-1' : 'md:col-span-4 lg:col-span-1'}`}><button type="submit" className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center">Tìm Kiếm</button></div>
        </div>
      </form>
    </div>
  );
};

const Hero = ({ setCurrentPage }) => (
  <div className="relative h-[550px] sm:h-[700px] w-full bg-slate-900 overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-no-repeat opacity-50 bg-fixed transform scale-105 animate-slow-zoom"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/90"></div>
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pb-24 animate-fade-in-up">
      <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 animate-float">Happy Land Real Estate</div>
      <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 max-w-4xl leading-tight drop-shadow-lg">Kiến Tạo Giá Trị <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Vun Đắp Tương Lai</span></h1>
      <p className="text-slate-200 text-lg sm:text-xl mb-10 max-w-2xl font-light leading-relaxed drop-shadow-md">Hệ thống phân phối và giao dịch bất động sản uy tín hàng đầu tại TP. Thủ Đức. Nơi trao gửi niềm tin trọn vẹn.</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <button onClick={() => setCurrentPage('projects')} className="group bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 flex items-center justify-center"><Building className="mr-2 group-hover:-translate-y-1 transition-transform" size={20} /> Xem Dự Án</button>
        <button onClick={() => setCurrentPage('exchange')} className="group bg-white/90 hover:bg-white text-slate-900 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center backdrop-blur-sm"><Home className="mr-2 group-hover:-translate-y-1 transition-transform" size={20} /> Sàn Giao Dịch</button>
      </div>
    </div>
  </div>
);

const CardProject = ({ project, onClick }) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border border-slate-100 h-full flex flex-col transform hover:-translate-y-2" onClick={onClick}>
    <div className="relative h-72 overflow-hidden">
      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
      <div className="absolute top-4 left-4"><span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">{project.categoryId === 'can-ho' ? 'Đang mở bán' : 'Hot'}</span></div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"><button className="bg-white p-2 rounded-full shadow-lg hover:text-red-500"><Heart size={18} /></button></div>
    </div>
    <div className="p-6 flex flex-col flex-grow relative">
      <div className="-mt-10 mb-4 relative z-10"><span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wide border-2 border-white">{project.category}</span></div>
      <h3 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[3.5rem]">{project.title}</h3>
      <div className="flex items-start text-slate-500 text-sm mb-6 flex-grow"><MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-amber-500" /><span className="line-clamp-2 text-slate-600">{project.fullLocation}</span></div>
      <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
        <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Giá tham khảo</span><span className="text-red-600 font-black text-lg">{project.price}</span></div>
        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300"><ArrowRight size={18} /></button>
      </div>
    </div>
  </div>
);

const CardListing = ({ listing, onClick }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden flex flex-col h-full group" onClick={onClick}>
    <div className="relative h-56 overflow-hidden">
      <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center shadow-sm"><Home size={12} className="mr-1.5" /> {listing.area}</div>
      <div className="absolute top-3 right-3 bg-white/90 text-slate-800 px-2 py-1 text-[10px] font-bold rounded shadow-sm flex items-center border border-slate-100"><Compass size={12} className="mr-1 text-amber-500" /> {listing.direction}</div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-base font-bold text-slate-800 mb-3 line-clamp-2 hover:text-amber-600 transition-colors min-h-[3rem] leading-snug">{listing.title}</h3>
      <div className="flex justify-between items-center mb-4">
        <span className="text-red-600 font-black text-xl">{listing.price}</span>
        {listing.bedrooms > 0 && (<div className="flex space-x-2 text-xs text-slate-500 font-medium"><span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100"><Bed size={12} className="mr-1" /> {listing.bedrooms}</span><span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100"><span className="font-bold mr-1">WC</span> {listing.bathrooms}</span></div>)}
      </div>
      <div className="text-slate-500 text-xs flex items-center mb-4 flex-grow border-b border-slate-50 pb-4 border-dashed"><MapPin size={14} className="mr-1.5 flex-shrink-0 text-slate-400" /><span className="truncate">{listing.fullLocation}</span></div>
      <div className="flex flex-wrap gap-2 mt-auto">{listing.tags.slice(0, 2).map((tag, idx) => (<span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-1 rounded-md">{tag}</span>))}</div>
    </div>
  </div>
);

const CardNews = ({ news, onClick }) => (
  <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-8 mb-8 last:border-0 cursor-pointer group hover:bg-slate-50 p-4 -mx-4 rounded-xl transition-colors" onClick={onClick}>
    <div className="w-full md:w-1/3 h-52 overflow-hidden rounded-xl shadow-sm relative">
      <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
    </div>
    <div className="w-full md:w-2/3 py-2">
      <div className="flex items-center space-x-2 mb-3"><span className="text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">{news.category}</span><span className="text-slate-300 text-xs">•</span><span className="text-slate-400 text-xs font-medium flex items-center"><Newspaper size={12} className="mr-1" /> {news.date}</span></div>
      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors leading-snug">{news.title}</h3>
      <p className="text-slate-500 mb-4 line-clamp-2 text-sm leading-relaxed">{news.excerpt}</p>
      <span className="text-amber-500 font-bold text-xs flex items-center group-hover:translate-x-2 transition-transform duration-300">ĐỌC TIẾP <ArrowRight size={14} className="ml-1" /></span>
    </div>
  </div>
);

const Footer = ({ setCurrentPage, onRegister }) => (
  <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
      <div className="md:col-span-1">
        <div className="flex flex-col text-white font-bold mb-6"><div className="flex items-center text-2xl"><Building className="text-amber-500 mr-2" /> HAPPY LAND</div><span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] ml-8 uppercase mt-1">Real Estate</span></div>
        <p className="mb-8 text-sm leading-relaxed text-slate-400 font-light">Đối tác tin cậy cho mọi nhu cầu đầu tư và an cư. Chúng tôi cam kết mang đến những sản phẩm giá trị thực.</p>
        <div className="flex space-x-3">{[Facebook, Instagram, Youtube].map((Icon, idx) => (<div key={idx} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all cursor-pointer transform hover:-translate-y-1"><Icon size={18} /></div>))}</div>
      </div>
      <div className="md:col-span-2 pl-0 md:pl-12">
        <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-wide relative inline-block">Thông tin liên hệ<span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-amber-500"></span></h4>
        <ul className="space-y-6 text-sm">
          <li className="flex items-start group"><div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors"><MapPin size={16} className="text-amber-500 group-hover:text-white transition-colors" /></div><span className="mt-1.5 text-slate-400 group-hover:text-slate-200 transition-colors">Số 123 Đường Nguyễn Duy Trinh, P. Bình Trưng Tây, TP. Thủ Đức, TP.HCM</span></li>
          <li className="flex items-center group"><div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors"><Phone size={16} className="text-amber-500 group-hover:text-white transition-colors" /></div><span className="font-bold text-white text-xl group-hover:text-amber-500 transition-colors">0912 345 678</span></li>
          <li className="flex items-center group"><div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-amber-500 transition-colors"><Mail size={16} className="text-amber-500 group-hover:text-white transition-colors" /></div><span className="text-slate-400 group-hover:text-white transition-colors">info@happyland.net.vn</span></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-wide relative inline-block">Đăng ký nhận tin<span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-amber-500"></span></h4>
        <p className="text-xs text-slate-500 mb-4">Nhận thông tin dự án mới nhất và ưu đãi độc quyền.</p>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onRegister(); }}>
          <input type="email" required placeholder="Email của bạn" className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors" />
          <button type="submit" className="w-full bg-amber-500 text-white py-3 rounded font-bold hover:bg-amber-600 transition-colors uppercase text-xs tracking-wider">Đăng ký ngay</button>
        </form>
      </div>
    </div>
    <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-600 flex flex-col md:flex-row justify-between container mx-auto px-4">
      <span>© 2023 Happy Land Real Estate. All rights reserved.</span>
      <div className="space-x-4 mt-2 md:mt-0"><span className="hover:text-white cursor-pointer">Điều khoản sử dụng</span><span className="hover:text-white cursor-pointer">Chính sách bảo mật</span></div>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategory, setNewsCategory] = useState('all');
  const [notification, setNotification] = useState(null);
  const [savedItems, setSavedItems] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  const [filters, setFilters] = useState({ keyword: '', type: 'all', location: '', priceRange: PRICE_RANGES[0], areaRange: AREA_RANGES[0], bedrooms: 'all', direction: 'all' });
  const [pageStates, setPageStates] = useState({ projects: 1, exchange: 1, news: 1 });

  // --- DERIVE GALLERY DATA SAFELY ---
  const currentGallery = useMemo(() => {
    if (!selectedItem?.data) return [];
    return selectedItem.data.gallery || [selectedItem.data.image];
  }, [selectedItem]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage, selectedItem]);
  useEffect(() => { setPageStates({ projects: 1, exchange: 1, news: 1 }); }, [filters, newsSearch, newsCategory]);

  const showNotification = (message, type = 'success') => { setNotification({ message, type }); };
  const handleRegister = () => { showNotification("Đăng ký nhận tin thành công!", "success"); };
  const toggleSaveItem = (e, id) => {
    e.stopPropagation();
    if (savedItems.includes(id)) { setSavedItems(prev => prev.filter(item => item !== id)); showNotification("Đã bỏ lưu tin", "error"); }
    else { setSavedItems(prev => [...prev, id]); showNotification("Đã lưu tin thành công!", "success"); }
  };
  const handleContactSubmit = (e) => { e.preventDefault(); showNotification("Yêu cầu tư vấn đã được gửi!", "success"); };
  const handleSearchFromHome = (searchParams) => { setFilters(searchParams); setCurrentPage('exchange'); };
  const handlePageChange = (section, newPage) => { setPageStates(prev => ({ ...prev, [section]: newPage })); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Lightbox handlers
  const openLightbox = (index) => { setLightboxIndex(index); };
  const closeLightbox = () => { setLightboxIndex(null); };
  const moveLightbox = (step) => {
    if (currentGallery.length > 0) {
      const newIndex = (lightboxIndex + step + currentGallery.length) % currentGallery.length;
      setLightboxIndex(newIndex);
    }
  };

  const filteredListings = useMemo(() => {
    return LISTINGS.filter(item => {
      const matchKeyword = filters.keyword === '' || item.title.toLowerCase().includes(filters.keyword.toLowerCase());
      const matchType = filters.type === 'all' || item.categoryId === filters.type;
      const matchLocation = filters.location === '' || item.location === filters.location;
      const matchPrice = item.priceValue >= filters.priceRange.min && item.priceValue < filters.priceRange.max;
      const matchArea = item.areaValue >= filters.areaRange.min && item.areaValue < filters.areaRange.max;
      let matchBedrooms = true;
      if (filters.bedrooms !== 'all') { matchBedrooms = filters.bedrooms === '4+' ? item.bedrooms >= 4 : item.bedrooms === parseInt(filters.bedrooms); }
      const matchDirection = filters.direction === 'all' || item.direction === filters.direction;
      return matchKeyword && matchType && matchLocation && matchPrice && matchArea && matchBedrooms && matchDirection;
    });
  }, [filters]);

  const filteredProjects = useMemo(() => {
     return PROJECTS.filter(item => {
       const matchKeyword = filters.keyword === '' || item.title.toLowerCase().includes(filters.keyword.toLowerCase());
       const matchType = filters.type === 'all' || item.categoryId === filters.type;
       const matchLocation = filters.location === '' || item.location === filters.location;
       const matchPrice = item.priceValue >= filters.priceRange.min && item.priceValue < filters.priceRange.max;
       return matchKeyword && matchType && matchLocation && matchPrice;
     });
  }, [filters]);

  const paginateData = (data, page, itemsPerPage = ITEMS_PER_PAGE) => {
    const startIndex = (page - 1) * itemsPerPage;
    return { data: data.slice(startIndex, startIndex + itemsPerPage), totalPages: Math.ceil(data.length / itemsPerPage) };
  };

  const renderContent = () => {
    if (selectedItem) {
      const item = selectedItem.data;
      const isProject = selectedItem.type === 'project';
      const displayImage = activeImage || item.image;
      
      const getCurrentImageIndex = () => { const currentSrc = activeImage || item.image; const idx = currentGallery.indexOf(currentSrc); return idx >= 0 ? idx : 0; };
      const relatedItems = isProject ? PROJECTS.filter(p => p.id !== item.id && (p.location === item.location || p.categoryId === item.categoryId)).slice(0, 3) : LISTINGS.filter(l => l.id !== item.id && (l.location === item.location || l.categoryId === item.categoryId)).slice(0, 3);

      return (
        <div className="animate-fade-in-up min-h-screen bg-slate-50 pb-20">
          <div className="relative h-[400px] lg:h-[500px] group cursor-pointer" onClick={() => openLightbox(getCurrentImageIndex())}>
             <img src={displayImage} className="w-full h-full object-cover transition-all duration-500" alt={item.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><ZoomIn size={48} className="text-white" /></div>
             <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 pb-16 md:pb-24 container mx-auto pointer-events-none">
                 <div className="max-w-4xl pointer-events-auto">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3 inline-block">{item.category}</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight shadow-sm">{item.title}</h1>
                    <div className="flex flex-wrap items-center text-slate-300 text-sm gap-4"><span className="flex items-center"><MapPin size={16} className="mr-1 text-amber-400" /> {item.fullLocation || item.location}</span>{item.date && <span className="flex items-center"><Newspaper size={16} className="mr-1" /> {item.date}</span>}</div>
                 </div>
             </div>
             <button onClick={(e) => { e.stopPropagation(); setSelectedItem(null); setActiveImage(null); }} className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full hover:bg-white hover:text-slate-900 transition-all font-bold flex items-center text-sm"><ArrowRight className="rotate-180 mr-2" size={16} /> Quay lại</button>
             <button onClick={(e) => toggleSaveItem(e, item.id)} className={`absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full backdrop-blur-md border border-white/30 transition-all ${savedItems.includes(item.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'}`}><Heart size={20} fill={savedItems.includes(item.id) ? "currentColor" : "none"} /></button>
          </div>

          <div className="container mx-auto px-4 -mt-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 {/* Gallery Section - Updated: Click thumbnail opens Lightbox */}
                 {currentGallery.length > 0 && (
                     <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 flex gap-2 overflow-x-auto pb-4">
                        {currentGallery.map((img, idx) => (
                            <div key={idx} className={`w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative group ${activeImage === img ? 'border-amber-500 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                onClick={() => { setActiveImage(img); openLightbox(idx); }}>
                                <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 size={20} className="text-white drop-shadow-md" /></div>
                            </div>
                        ))}
                     </div>
                 )}

                 <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center"><span className="w-1 h-6 bg-amber-500 mr-3 rounded-full"></span>Tổng quan</h3>
                    <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed"><p className="text-lg font-medium text-slate-700 mb-4">{item.description || item.excerpt}</p><p>{item.content}</p></div>
                    {item.features && item.features.length > 0 && (
                       <div className="mt-8 pt-8 border-t border-slate-100">
                          <h3 className="text-xl font-bold text-slate-800 mb-6">{isProject ? 'Tiện ích đặc quyền' : 'Tiện ích & Đặc điểm'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{item.features.map((f, i) => (<div key={i} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100"><CheckCircle size={18} className="text-green-500 mr-3" /><span className="text-slate-700 font-medium">{f}</span></div>))}</div>
                       </div>
                    )}
                 </div>

                 {relatedItems.length > 0 && (
                     <div className="mt-12">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Sản phẩm tương tự</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedItems.map((relItem) => (
                                isProject ? <CardProject key={relItem.id} project={relItem} onClick={() => {setSelectedItem({ type: 'project', data: relItem }); window.scrollTo(0,0);}} /> : <CardListing key={relItem.id} listing={relItem} onClick={() => {setSelectedItem({ type: 'listing', data: relItem }); window.scrollTo(0,0);}} />
                            ))}
                        </div>
                     </div>
                 )}
              </div>

              <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 sticky top-24">
                    <div className="text-center mb-6"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá tham khảo</span><div className="text-3xl font-black text-red-600 mt-1">{item.price || 'Liên hệ'}</div></div>
                    {!isProject && selectedItem.type === 'listing' && (
                       <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="bg-slate-50 p-3 rounded text-center"><div className="text-slate-400 text-xs mb-1">Diện tích</div><div className="font-bold text-slate-800">{item.area}</div></div>
                          <div className="bg-slate-50 p-3 rounded text-center"><div className="text-slate-400 text-xs mb-1">Hướng</div><div className="font-bold text-slate-800">{item.direction}</div></div>
                       </div>
                    )}
                    <form className="space-y-3 mb-4" onSubmit={handleContactSubmit}>
                        <input type="text" required placeholder="Họ tên của bạn" className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        <input type="text" required placeholder="Số điện thoại" className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                        <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-amber-600 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-1 uppercase text-sm tracking-wider">Gửi yêu cầu tư vấn</button>
                    </form>
                    <button className="w-full bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 transition-all flex items-center justify-center text-sm"><Phone size={18} className="mr-2" /> 0912 345 678</button>
                 </div>
              </div>
            </div>
          </div>
          {/* REMOVED LIGHTBOX FROM HERE TO MOVE TO ROOT */}
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <div className="animate-fade-in">
            <Hero setCurrentPage={setCurrentPage} />
            <div className="container mx-auto px-4 relative z-20"><AdvancedSearch onSearch={handleSearchFromHome} /></div>
            <section className="py-20 bg-slate-50/50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Dự Án Nổi Bật</h2><div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full mb-4"></div><p className="text-slate-500 max-w-2xl mx-auto text-lg">Tuyển chọn những dự án có tiềm năng sinh lời tốt nhất hiện nay</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{PROJECTS.slice(0, 3).map(p => (<CardProject key={p.id} project={p} onClick={() => setSelectedItem({ type: 'project', data: p })} />))}</div>
              </div>
            </section>
            <section className="py-20 bg-white">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                  <div><h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">Bất Động Sản Mới</h2><p className="text-slate-500 text-lg">Cập nhật liên tục các sản phẩm hot nhất thị trường</p></div>
                  <button onClick={() => setCurrentPage('exchange')} className="hidden md:flex items-center text-amber-600 font-bold hover:text-amber-700 transition-colors">Xem tất cả <ArrowRight size={20} className="ml-2" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{LISTINGS.slice(0, 4).map((l, index) => (<div key={l.id} className={`animate-fade-in-up delay-${(index % 4) * 100}`}><CardListing listing={l} onClick={() => setSelectedItem({ type: 'listing', data: l })} /></div>))}</div>
                <div className="text-center mt-12 md:hidden"><button onClick={() => setCurrentPage('exchange')} className="bg-slate-100 text-slate-800 px-8 py-3 rounded-full font-bold text-sm">Xem tất cả</button></div>
              </div>
            </section>
          </div>
        );

      case 'projects':
        const pData = paginateData(filteredProjects, pageStates.projects);
        return (
          <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
            <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
               <div className="relative z-10"><h1 className="text-4xl font-black text-white mb-4">Dự Án Phân Phối</h1><p className="text-slate-300 text-lg max-w-2xl mx-auto">Khám phá danh mục đầu tư đa dạng và chất lượng cao</p></div>
            </div>
            <div className="container mx-auto px-4 -mt-8 relative z-20 mb-12"><AdvancedSearch onSearch={(params) => setFilters(params)} compact={true} isProjectSearch={true} /></div>
            <div className="container mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{pData.data.map(p => (<CardProject key={p.id} project={p} onClick={() => setSelectedItem({ type: 'project', data: p })} />))}</div>
                {pData.data.length > 0 ? (<Pagination currentPage={pageStates.projects} totalPages={pData.totalPages} onPageChange={(page) => handlePageChange('projects', page)} />) : (<div className="text-center py-20"><h3 className="text-xl font-bold text-slate-600">Không tìm thấy dự án phù hợp</h3><button onClick={() => setFilters({keyword: '', type: 'all', location: '', priceRange: PRICE_RANGES[0], areaRange: AREA_RANGES[0], bedrooms: 'all', direction: 'all'})} className="mt-4 text-amber-600 font-bold hover:underline">Xóa bộ lọc & thử lại</button></div>)}
            </div>
          </div>
        );

      case 'exchange':
        const eData = paginateData(filteredListings, pageStates.exchange);
        return (
          <div className="bg-white min-h-screen pb-20 animate-fade-in">
             <div className="bg-slate-900 py-20 px-4 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
               <div className="relative z-10"><h1 className="text-4xl font-black text-white mb-4">Sàn Giao Dịch</h1><p className="text-slate-300 text-lg max-w-2xl mx-auto">Tìm kiếm cơ hội đầu tư và an cư lý tưởng</p></div>
            </div>
             <div className="container mx-auto px-4 -mt-8 relative z-20"><AdvancedSearch onSearch={(params) => setFilters(params)} compact={true} /><div className="flex justify-between items-center mt-12 mb-8"><h2 className="text-2xl font-bold text-slate-800 flex items-center">Kết quả tìm kiếm <span className="ml-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{filteredListings.length}</span></h2><div className="flex items-center text-sm text-slate-500"><span className="mr-2">Sắp xếp:</span><select className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"><option>Mới nhất</option><option>Giá tăng dần</option><option>Giá giảm dần</option></select></div></div>
                {filteredListings.length > 0 ? (<><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{eData.data.map(l => (<CardListing key={l.id} listing={l} onClick={() => setSelectedItem({ type: 'listing', data: l })} />))}</div><Pagination currentPage={pageStates.exchange} totalPages={eData.totalPages} onPageChange={(page) => handlePageChange('exchange', page)} /></>) : (<div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><div className="text-slate-300 mb-4 flex justify-center"><Search size={48} /></div><h3 className="text-xl font-bold text-slate-600">Không tìm thấy kết quả phù hợp</h3><button onClick={() => setFilters({keyword: '', type: 'all', location: '', priceRange: PRICE_RANGES[0], areaRange: AREA_RANGES[0], bedrooms: 'all', direction: 'all'})} className="mt-4 text-amber-600 font-bold hover:underline">Xóa bộ lọc & thử lại</button></div>)}
             </div>
          </div>
        );

      case 'news':
        const filteredNews = NEWS_ARTICLES.filter(article => {
          const matchesSearch = article.title.toLowerCase().includes(newsSearch.toLowerCase()) || article.excerpt.toLowerCase().includes(newsSearch.toLowerCase());
          const matchesCategory = newsCategory === 'all' || article.category === newsCategory;
          return matchesSearch && matchesCategory;
        });
        const nData = paginateData(filteredNews, pageStates.news);
        
        return (
          <div className="bg-white min-h-screen pb-20 animate-fade-in">
             <div className="bg-slate-50 py-16 text-center mb-12"><h1 className="text-4xl font-black text-slate-800 mb-4">Tin Tức & Sự Kiện</h1><div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-8"></div>
                 <div className="max-w-xl mx-auto px-4 relative flex flex-col items-center gap-4">
                    <div className="relative w-full"><input type="text" placeholder="Tìm kiếm bài viết, tin tức..." className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all shadow-sm bg-white" value={newsSearch} onChange={(e) => setNewsSearch(e.target.value)} /><Search className="absolute left-4 top-3.5 text-slate-400" size={20} /></div>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">{NEWS_CATEGORIES.map((cat) => (<button key={cat.id} onClick={() => setNewsCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${newsCategory === cat.id ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>{cat.name}</button>))}</div>
                 </div>
             </div>
             <div className="container mx-auto px-4 max-w-5xl">
                {nData.data.length > 0 ? (<>{nData.data.map(article => (<CardNews key={article.id} news={article} onClick={() => setSelectedItem({ type: 'news', data: article })} />))}<Pagination currentPage={pageStates.news} totalPages={nData.totalPages} onPageChange={(page) => handlePageChange('news', page)} /></>) : (<div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200"><div className="inline-flex bg-white p-4 rounded-full mb-4 shadow-sm"><Search size={32} className="text-slate-400" /></div><h3 className="text-lg font-bold text-slate-600">Không tìm thấy tin tức nào phù hợp</h3><button onClick={() => { setNewsSearch(''); setNewsCategory('all'); }} className="mt-2 text-amber-600 font-bold hover:underline text-sm">Xóa bộ lọc & Xem tất cả</button></div>)}
             </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="font-sans text-slate-600 bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <style>{customStyles}</style>
      <Header setCurrentPage={setCurrentPage} currentPage={currentPage} />
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <main>{renderContent()}</main>
      
      {/* --- MOVED LIGHTBOX HERE (ROOT LEVEL) --- */}
      {lightboxIndex !== null && (
        <Lightbox 
          images={currentGallery} 
          currentIndex={lightboxIndex} 
          onClose={closeLightbox} 
          onNext={() => moveLightbox(1)} 
          onPrev={() => moveLightbox(-1)} 
        />
      )}

      <Footer setCurrentPage={setCurrentPage} onRegister={handleRegister} />
      <FloatingContact />
    </div>
  );
};

export default App;