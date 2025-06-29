import React from 'react';
import { GraduationCap, Users, Calendar, Target, Award, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  studentId: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Trần Ngọc Hân',
    role: 'Phát triển backend',
    studentId: '6351030024',
  },
  {
    id: '2',
    name: 'Phạm Hải Dương',
    role: 'Thiết kế giao diện',
    studentId: '6351030013',
  },
  {
    id: '3',
    name: 'Lê Huỳnh Trang',
    role: 'Phát triển cơ sở dữ liệu',
    studentId: '6351030076',
  },
  {
    id: '4',
    name: 'Nguyễn Minh Lộc',
    role: 'Lập trình ESP32',
    studentId: '6351030040',
  }
];

export const ProjectInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Project Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative p-6 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl shadow-lg">
                {/* Thay Target icon bằng ảnh logo trường */}
                <img
                  src="https://utc2.edu.vn/assets/logo-icon-GCU48TCC.png"
                  alt="Logo Trường Đại học"
                  className="h-16 w-16 object-contain mx-auto"
                />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4">
              HỆ THỐNG CẢNH BÁO VA CHẠM SỚM GIỮA PHƯƠNG TIỆN GIAO THÔNG BẰNG IOT
            </h1>
            <p className="text-2xl text-slate-600 mb-6 font-light">
              IOT TRONG CÔNG NGHIỆP VÀ GIAO THÔNG
            </p>
            <div className="flex justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span>Năm học: 2025</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <GraduationCap className="h-4 w-4 text-teal-500" />
                <span>Môn: Đồ án môn học cuối kỳ </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-400" />
                Mục tiêu đề tài
              </h3>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Phát triển hệ thống cảnh báo thông minh sử dụng cảm biến siêu âm</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Tạo giao diện web trực quan để giám sát và điều khiển</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Xây dựng cơ sở dữ liệu lưu trữ và phân tích dữ liệu</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Hiển thị biểu đồ thống kê và báo cáo chi tiết</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-emerald-500" />
                Tính năng chính
              </h3>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Giám sát thời gian thực với 2 cảm biến siêu âm</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Bảng điều khiển với 6 nút nhấn tương tác</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cơ sở dữ liệu lưu trữ lịch sử hoạt động</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Biểu đồ trực quan và báo cáo thống kê</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Thành viên nhóm phát triển
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/30">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${
                    index % 4 === 0 ? 'from-emerald-300 to-teal-300' :
                    index % 4 === 1 ? 'from-teal-300 to-cyan-300' :
                    index % 4 === 2 ? 'from-cyan-300 to-blue-300' :
                    'from-blue-300 to-indigo-300'
                  } rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {member.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{member.name}</h3>
                    <p className="text-emerald-600 text-sm font-medium mb-3">{member.role}</p>
                    <div className="space-y-1 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-teal-400 rounded-full"></span>
                        MSSV: {member.studentId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};