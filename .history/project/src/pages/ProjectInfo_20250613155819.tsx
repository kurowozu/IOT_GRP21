import React from 'react';
import { GraduationCap, Users, Calendar, Target, Award, Sparkles } from 'lucide-react';
import { TeamMember } from '../types'; // hoặc '../types/index'

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Trần Ngọc Hân',
    role: 'Trưởng nhóm - Phát triển phần mềm',
    studentId: '6351030024',
  },
  {
    id: '2',
    name: 'Phạm Hải Dương',
    role: 'Thiết kế giao diện',
    studentId: 'SV002',

  },
  {
    id: '3',
    name: 'Lê Huỳnh Trang',
    role: 'Phát triển cơ sở dữ liệu',
    studentId: 'SV003',
  },
  {
    id: '4',
    name: 'Nguyễn Minh Lộc ',
    role: 'Lập trình ESP32',
    studentId: 'SV004',
  }
];

export const ProjectInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Project Header */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Target className="h-16 w-16 text-white" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Hệ thống cảnh báo tránh vật cản
            </h1>
            <p className="text-2xl text-slate-300 mb-6 font-light">
              Obstacle Avoidance Warning System
            </p>
            <div className="flex justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Năm học: 2024-2025</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
                <GraduationCap className="h-4 w-4 text-teal-400" />
                <span>Môn: Đồ án tốt nghiệp</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-400" />
                Mục tiêu đề tài
              </h3>
              <ul className="space-y-4 text-slate-300">
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

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-emerald-400" />
                Tính năng chính
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Giám sát thời gian thực với 2 cảm biến siêu âm</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Bảng điều khiển với 8 nút nhấn tương tác</span>
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
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-400" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Thành viên nhóm phát triển
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 hover:from-slate-700/70 hover:to-slate-800/70 transition-all duration-300 border border-slate-600/30 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${
                    index % 4 === 0 ? 'from-emerald-500 to-teal-600' :
                    index % 4 === 1 ? 'from-teal-500 to-cyan-600' :
                    index % 4 === 2 ? 'from-cyan-500 to-blue-600' :
                    'from-blue-500 to-indigo-600'
                  } rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {member.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                    <p className="text-emerald-400 text-sm font-medium mb-3">{member.role}</p>
                    <div className="space-y-1 text-sm text-slate-400">
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