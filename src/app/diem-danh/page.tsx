'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Student {
  mssv: string;
  full_name: string;
  email: string;
  role: string;
  user_id: string;
}

type AttendanceStatus = 'Có mặt' | 'Muộn' | 'Vắng';

function DiemDanhContent() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('mssv', { ascending: true });

      if (error) {
        console.error('Lỗi chi tiết từ Supabase:', error.message, error.details);
        return;
      }

      if (data) {
        setStudents(data as Student[]);

        const initialAttendance: Record<string, AttendanceStatus> = {};
        (data as Student[]).forEach((student) => {
          initialAttendance[student.mssv] = 'Có mặt';
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

  const updateStatus = (mssv: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [mssv]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceData = students.map((student) => ({
        mssv: student.mssv,
        full_name: student.full_name,
        status: attendance[student.mssv],
      }));

      const { error } = await supabase
        .from('attendance_logs')
        .insert(attendanceData);

      if (error) {
        console.error('Lỗi lưu dữ liệu:', error.message);
        alert('Lỗi: ' + error.message);
        return;
      }

      alert('Đã điểm danh thành công cho 44 anh em!');
      router.push('/');
    } catch (error) {
      console.error('Lỗi không mong muốn:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
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
                  <tr key={student.mssv} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 md:px-6 py-3 text-sm md:text-base text-foreground font-medium">{student.mssv}</td>
                    <td className="px-4 md:px-6 py-3 text-sm md:text-base text-foreground">{student.full_name}</td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex justify-center flex-wrap gap-1 md:gap-2">
                        <button
                          onClick={() => updateStatus(student.mssv, 'Có mặt')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.mssv] === 'Có mặt'
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 hover:bg-green-600/50 text-slate-300'
                          }`}
                        >
                          Có
                        </button>
                        <button
                          onClick={() => updateStatus(student.mssv, 'Muộn')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.mssv] === 'Muộn'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-slate-700 hover:bg-yellow-600/50 text-slate-300'
                          }`}
                        >
                          Muộn
                        </button>
                        <button
                          onClick={() => updateStatus(student.mssv, 'Vắng')}
                          className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
                            attendance[student.mssv] === 'Vắng'
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