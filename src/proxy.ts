import { NextResponse } from 'next/server'

export function proxy() {
  // Logic bảo mật của Minh giữ nguyên ở đây
  return NextResponse.next()
}

export default proxy