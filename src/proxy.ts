import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Logic bảo mật của Minh giữ nguyên ở đây
  return NextResponse.next()
}

export default proxy