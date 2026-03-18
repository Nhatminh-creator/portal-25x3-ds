"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader, Download, Search } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import * as XLSX from 'xlsx'

function HistoryContent() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // TODO: attendance_records table will be implemented with new tracking system
        // History functionality will be updated with the new attendance tracking system
        setLoading(false)
      } catch (error) {
        console.error("Lỗi:", error)
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // History is always empty as per current system, so filtered history remains empty
  useEffect(() => {
    // Once new attendance tracking system is implemented, this will filter history
    // based on searchTerm from the history records fetched above
  }, [searchTerm])

  const exportToExcel = () => {
    const emptyData: Array<Record<string, string>> = []
    const ws = XLSX.utils.json_to_sheet(emptyData)
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
            disabled={loading}
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
          <div className="rounded-xl border border-border/50 shadow-sm bg-card p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <p className="text-lg font-semibold text-foreground">Tính năng đang được cập nhật</p>
              <p className="text-sm text-muted-foreground text-center">
                Hệ thống tracking điểm danh cũ đã được cập nhật. Chúng tôi sẽ sớm triển khai chức năng lịch sử với công nghệ mới.
              </p>
            </div>
          </div>
        )}

        {/* Summary - Hidden until new system is implemented */}
        {false && !loading && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Tổng bản ghi</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Có mặt</p>
              <p className="text-2xl font-bold text-emerald-400">0</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1 uppercase">Vắng/Muộn</p>
              <p className="text-2xl font-bold text-red-400">0</p>
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
