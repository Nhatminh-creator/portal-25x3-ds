"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader, Download, Search } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import * as XLSX from 'xlsx'

function HistoryContent() {
  const [history, setHistory] = useState<any[]>([])
  const [filteredHistory, setFilteredHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("diem_danh")
          .select("*")
          .order("ngay_diem_danh", { ascending: false })

        if (attendanceError) {
          console.error("Lỗi khi lấy lịch sử:", attendanceError)
          setHistory([])
        } else {
          const { data: studentsData, error: studentsError } = await supabase
            .from("sinh_vien")
            .select("ma_sinh_vien, ho_ten")

          if (studentsError) {
            console.error("Lỗi khi lấy danh sách sinh viên:", studentsError)
            setHistory(attendanceData || [])
          } else {
            const enrichedHistory = (attendanceData || []).map((record) => {
              const student = studentsData?.find(
                (s) => s.ma_sinh_vien === record.ma_sinh_vien
              )
              return {
                ...record,
                ho_ten: student?.ho_ten || "Không rõ",
              }
            })
            setHistory(enrichedHistory)
            setFilteredHistory(enrichedHistory)
          }
        }
      } catch (error) {
        console.error("Lỗi:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  useEffect(() => {
    const filtered = history.filter(record =>
      record.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ma_sinh_vien.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredHistory(filtered)
  }, [searchTerm, history])

  const exportToExcel = () => {
    const data = filteredHistory.map(record => ({
      'Ngày': new Date(record.ngay_diem_danh).toLocaleDateString('vi-VN'),
      'Mã SV': record.ma_sinh_vien,
      'Họ Tên': record.ho_ten,
      'Trạng thái': record.trang_thai
    }))
    
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử')
    XLSX.writeFile(wb, `lich-su-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex">
            <button className="p-2.5 rounded-full bg-card hover:bg-secondary transition-colors shadow-sm border border-border/50">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Lịch sử điểm danh</h1>
            <p className="text-xs text-muted-foreground font-medium">Xem toàn bộ bản ghi điểm danh</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Search and Export */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên/mã SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={exportToExcel}
            disabled={loading || filteredHistory.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-10 w-10 text-[#4F6BF6] animate-spin" />
              <p className="text-muted-foreground text-sm">Đang tải...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Ngày điểm danh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Mã Sinh Viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Họ Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(record.ngay_diem_danh).toLocaleDateString("vi-VN")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground font-mono">
                          {record.ma_sinh_vien || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">
                          {record.ho_ten || "Không rõ"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            record.trang_thai === "Có mặt"
                              ? "bg-emerald-50/10 text-emerald-400 border-emerald-400/30"
                              : record.trang_thai === "Muộn"
                              ? "bg-amber-50/10 text-amber-400 border-amber-400/30"
                              : "bg-red-50/10 text-red-400 border-red-400/30"
                          }`}
                        >
                          {record.trang_thai || "Không xác định"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground text-sm">Không có dữ liệu</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && filteredHistory.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Tổng bản ghi</p>
              <p className="text-2xl font-bold text-foreground">{filteredHistory.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Có mặt</p>
              <p className="text-2xl font-bold text-emerald-400">
                {filteredHistory.filter((r) => r.trang_thai === "Có mặt").length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Vắng/Muộn</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredHistory.filter((r) => r.trang_thai !== "Có mặt").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  )
}
