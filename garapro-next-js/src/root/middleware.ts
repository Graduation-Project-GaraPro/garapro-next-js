// middleware.ts
// Đặt file này ở thư mục root của project (cùng cấp với app hoặc pages)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lấy token từ cookie hoặc header
  const token = request.cookies.get('authToken')?.value;
  
  const { pathname } = request.nextUrl;
  
  // Kiểm tra nếu đang truy cập route technician mà không có token
  if (pathname.startsWith('/technician') && !token) {
    // Redirect về trang login
    const loginUrl = new URL('/login', request.url);
    // Thêm returnUrl để sau khi login có thể quay lại trang ban đầu
    loginUrl.searchParams.set('returnUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }
  
  // Cho phép request tiếp tục nếu có token
  return NextResponse.next();
}

// Cấu hình các route cần bảo vệ
export const config = {
  matcher: [
    '/technician/:path*',  // Bảo vệ tất cả routes bắt đầu với /technician
  ]
};