"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Loader, Bell, QrCode, ChevronRight, Clock, Home, User, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface Notification {
  id: string
  title: string
  content: string
  type: 'urgent' | 'reminder' | 'normal'
  created_at: string
}

const navItems = [
  { id: "home", label: "Trang chủ", icon: Home, isCenter: false },
  { id: "scan", label: "Quét mã", icon: QrCode, isCenter: true },
  { id: "profile", label: "Cá nhân", icon: User, isCenter: false },
]

function DashboardContent() {
  const { logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [stats, setStats] = useState({ coMat: 0, muon: 0, vang: 0 })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Sinh viên")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Lấy thông tin người dùng đang đăng nhập
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Lấy Tên từ bảng profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single()
            
          if (profile) {
            // Tách lấy tên cuối (Ví dụ: "Phạm Nhật Minh" -> "Minh")
            const nameParts = profile.full_name.split(' ');
            const shortName = nameParts[nameParts.length - 1];
            setUserName(shortName);
          }
        }

        // 2. Thống kê (tạm thời để 0)
        setStats({ coMat: 0, muon: 0, vang: 0 })

        // 3. Lấy thông báo từ bảng announcements mới
        const { data: notificationsData } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3)

        setNotifications(notificationsData || [])
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Hàm chuyển đổi cấp độ thông báo
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'urgent': return 'Khẩn cấp';
      case 'reminder': return 'Nhắc nhở';
      default: return 'Thông thường';
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo Portal 25X3-DS"
              width={44}
              height={44}
              className="rounded-lg border-2 border-slate-700 shadow-sm"
            />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Xin chào,</p>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Chào {userName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-full bg-card hover:bg-secondary transition-colors shadow-sm border border-border/50">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-card" />
            </button>
            <button onClick={handleLogout} className="p-2.5 rounded-full bg-card hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm border border-border/50 hover:border-red-300 dark:hover:border-red-700">
              <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-10 w-10 text-[#4F6BF6] animate-spin" />
            <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Section (Giữ nguyên giao diện của Minh) */}
          <section className="px-4 py-5">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Thống kê điểm danh
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-sm border border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium mb-1">Có mặt</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.coMat}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 shadow-sm border border-amber-200">
                <p className="text-xs text-amber-600 font-medium mb-1">Muộn</p>
                <p className="text-2xl font-bold text-amber-700">{stats.muon}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-sm border border-red-200">
                <p className="text-xs text-red-600 font-medium mb-1">Vắng</p>
                <p className="text-2xl font-bold text-red-700">{stats.vang}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Tỉ lệ Có mặt</p>
                <p className="text-sm font-bold text-[#4F6BF6]">
                  {Math.round((stats.coMat / 44) * 100)}%
                </p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300" style={{ width: `${Math.min((stats.coMat / 44) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats.coMat} / 44 sinh viên</p>
            </div>
          </section>

          {/* Notifications Section - ĐÃ SỬA CỘT DỮ LIỆU */}
          <section className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Thông báo</h2>
              <button className="text-sm text-[#4F6BF6] font-medium hover:underline">Xem tất cả</button>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {/* Sửa thành title */}
                          <h3 className="font-bold text-foreground text-sm">{notification.title}</h3>
                          {/* Sửa thành type */}
                          <span className={`flex-shrink-0 px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${notification.type === 'urgent' ? 'bg-red-100 text-red-600 border-red-200' : notification.type === 'reminder' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-[#4F6BF6]/10 text-[#4F6BF6] border-[#4F6BF6]/20'}`}>
                            {getTypeLabel(notification.type)}
                          </span>
                        </div>
                        {/* Sửa thành content */}
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.content}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-2">
                          <Clock className="h-3 w-3" />
                          {/* Sửa thành created_at */}
                          <span>{new Date(notification.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">Chưa có thông báo nào</p>
              )}
            </div>
          </section>

          {/* Action Button */}
          <section className="px-4 py-4">
            <Link href="/diem-danh" className="block w-full">
              <button className="w-full bg-gradient-to-r from-[#4F6BF6] to-[#7B8FF7] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white font-bold py-4 px-6 rounded-xl shadow-lg">
                Điểm danh ngay
              </button>
            </Link>
          </section>
        </>
      )}

      {/* Bottom Navigation (Giữ nguyên của Minh) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-20 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            if (item.isCenter) {
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className="relative -mt-6 flex flex-col items-center justify-center">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${isActive ? "bg-[#4F6BF6] shadow-[#4F6BF6]/30" : "bg-[#4F6BF6] hover:bg-[#4F6BF6]/90"}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-[10px] font-medium mt-1 ${isActive ? "text-[#4F6BF6]" : "text-muted-foreground"}`}>{item.label}</span>
                </button>
              )
            }
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200">
                <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? "bg-[#4F6BF6]/10" : "bg-transparent"}`}>
                  <item.icon className={`h-6 w-6 transition-colors ${isActive ? "text-[#4F6BF6]" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? "text-[#4F6BF6]" : "text-muted-foreground"}`}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}