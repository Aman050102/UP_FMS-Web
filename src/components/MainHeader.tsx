import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, LogOut, User, ChevronDown, Users, Check, Settings
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function MainHeader({ displayName, onToggleMenu, role }: any) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const userEmail = localStorage.getItem("userEmail") ;

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const userRoles = [
    { id: 'assistant', label: 'นิสิตช่วยงาน (SA)', path: '/assistant/menu' },
    { id: 'staff', label: 'เจ้าหน้าที่ (Staff)', path: '/staff/menu' },
    { id: 'user', label: 'นิสิตและบุคลากรทั่วไป', path: '/user/menu' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-[#5f5aa2] flex items-center justify-between px-4 z-50 shadow-md">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer" onClick={onToggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <img
          src={dsaLogo}
          alt="Logo"
          className="h-[45px] cursor-pointer object-contain brightness-0 invert"
          onClick={() => navigate(role === "staff" ? "/staff/menu" : "/user/menu")}
        />
      </div>

      <div className="flex items-center gap-3">
        {isStaffOrAdmin && (
          <button className="p-2.5 rounded-full text-white hover:bg-white/10 relative transition-all cursor-pointer" onClick={() => navigate("/staff/notifications")}>
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#5f5aa2]">!</span>
          </button>
        )}

        <div className="relative">
          <button className="flex items-center gap-2 bg-black/20 hover:bg-black/30 p-1.5 pr-3 rounded-xl transition-all border border-white/10 group cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
            <div className="w-[32px] h-[32px] rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
              {displayName?.[0] || "U"}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{displayName}</span>
            <ChevronDown size={16} className={`text-white/70 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute top-[50px] right-0 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[3000] text-[#1e293b]">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                <p className="font-bold text-sm text-gray-800">{displayName}</p>
              </div>

              <div className="px-2 py-2 border-b border-gray-50">
                <div className="px-3 py-1 flex items-center gap-2 text-gray-400 mb-1">
                  <Users size={14} /><span className="text-[12px] font-bold uppercase">กลุ่มสิทธิ์การใช้งาน</span>
                </div>
                {userRoles.map((r) => (
                  <button key={r.id} onClick={() => { navigate(r.path); setShowProfile(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${role === r.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                    <span className="text-[14px]">{r.label}</span>
                    {role === r.id && <Check size={16} className="text-indigo-600" />}
                  </button>
                ))}
              </div>

              <div className="p-1">
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-gray-600 rounded-lg">
                  <Settings size={18} className="text-gray-400" /><span className="text-[14px]">จัดการโปรไฟล์</span>
                </button>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-500 rounded-lg font-bold"
                  onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
                  <LogOut size={18} /><span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
