'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Student {
  id: number;
  ma_sinh_vien: string;
  ho_ten: string;
}

type AttendanceStatus = 'Có mặt' | 'Muộn' | 'Vắng';

function DiemDanhContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('sinh_vien')
        .select('*')
        .order('ma_sinh_vien', { ascending: true });

      if (error) {
        console.error('Lỗi chi tiết từ Supabase:', error.message, error.details);
        return;
      }

      if (data) {
        setStudents(data as Student[]);

        const initialAttendance: Record<string, AttendanceStatus> = {};
        (data as Student[]).forEach((student) => {
          initialAttendance[student.ma_sinh_vien] = 'Có mặt';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Lỗi không mong muốn:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateStatus = (ma_sinh_vien: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [ma_sinh_vien]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const ngay_diem_danh = `${yyyy}-${mm}-${dd}`;

    const mang_du_lieu = Object.entries(attendance).map(([ma_sinh_vien, trang_thai]) => ({
      ma_sinh_vien,
      ngay_diem_danh,
      trang_thai,
    }));

    try {
      const { error } = await supabase.from('diem_danh').insert(mang_du_lieu);
      if (error) {
        alert(`Lỗi khi lưu điểm danh: ${error.message}`);
        return;
      }
      alert('Lưu điểm danh thành công!');
    } catch (err) {
      alert(`Lỗi khi lưu điểm danh: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          ← Quay lại Trang chủ
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
          Danh sách lớp 25X3-DS
        </h1>

        <div className="overflow-x-auto rounded-lg border border-border/50 shadow-sm bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/60 border-b border-border/50">
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground uppercase">Mã SV</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground uppercase">Họ Tên</th>
                <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-semibold text-foreground uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 md:px-6 py-8 text-center text-muted-foreground">
                    Chưa có dữ liệu sinh viên
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.ma_sinh_vien} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 md:px-6 py-3 text-sm md:text-base text-foreground font-medium">{student.ma_sinh_vien}</td>
                    <td className="px-4 md:px-6 py-3 text-sm md:text-base text-foreground">{student.ho_ten}</td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex justify-center flex-wrap gap-1 md:gap-2">
                        <button
                          onClick={() => updateStatus(student.ma_sinh_vien, 'Có mặt')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.ma_sinh_vien] === 'Có mặt'
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 hover:bg-green-600/50 text-slate-300'
                          }`}
                        >
                          Có
                        </button>
                        <button
                          onClick={() => updateStatus(student.ma_sinh_vien, 'Muộn')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.ma_sinh_vien] === 'Muộn'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-slate-700 hover:bg-yellow-600/50 text-slate-300'
                          }`}
                        >
                          Muộn
                        </button>
                        <button
                          onClick={() => updateStatus(student.ma_sinh_vien, 'Vắng')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.ma_sinh_vien] === 'Vắng'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-700 hover:bg-red-600/50 text-slate-300'
                          }`}
                        >
                          Vắng
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSaveAttendance}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          >
            Lưu điểm danh
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiemDanhPage() {
  return (
    <ProtectedRoute>
      <DiemDanhContent />
    </ProtectedRoute>
  );
}