import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tên hàm PHẢI là proxy để khớp với tên file proxy.ts
export function proxy(request: NextRequest) {
  // Giữ nguyên logic bảo mật của bạn ở đây
  return NextResponse.next()
}

// Hoặc dùng export default cho chắc ăn
export default proxy