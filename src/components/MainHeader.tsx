import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, LogOut, X, Camera, User,
  ChevronDown, Home, Settings, Users, Check
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function MainHeader({ displayName, onToggleMenu, role }: any) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);

  const userEmail = localStorage.getItem("userEmail") || "user@up.ac.th";

  // ตรวจสอบว่าเป็น Staff หรือ Admin หรือไม่ (เพื่อแสดงปุ่มแจ้งเตือน)
  const isStaffOrAdmin = role === "staff" || role === "admin";

  // รายชื่อสิทธิ์การใช้งาน (จำลองตามภาพ iService)
  const userRoles = [
    { id: 'user', label: 'นิสิตช่วยงาน (SA)', path: '/user/menu' },
    { id: 'staff', label: 'เจ้าหน้าที่ (Staff)', path: '/staff/menu' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-[#5f5aa2] flex items-center justify-between px-4 z-50 shadow-md">
      {/* ส่วนซ้าย: ปุ่มเมนูและโลโก้ */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          onClick={onToggleMenu}
        >
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

      {/* ส่วนขวา: การแจ้งเตือนและโปรไฟล์ */}
      <div className="flex items-center gap-3">

        {/* แสดงกระดิ่งแจ้งเตือนเฉพาะ Staff/Admin เท่านั้น */}
        {isStaffOrAdmin && (
          <button
            className="p-2.5 rounded-full text-white hover:bg-white/10 relative transition-all cursor-pointer"
            onClick={() => navigate("/staff/notifications")}
          >
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#5f5aa2]">
              !
            </span>
          </button>
        )}

        <div className="relative">
          <button
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 p-1.5 pr-3 rounded-xl transition-all border border-white/10 group cursor-pointer"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="w-[32px] h-[32px] rounded-full overflow-hidden border-2 border-white/50 shadow-sm">
              {profileImg ? (
                <img src={profileImg} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                  {displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block truncate max-w-[100px]">
              {displayName}
            </span>
            <ChevronDown size={16} className={`text-white/70 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute top-[50px] right-0 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[3000] animate-in fade-in zoom-in-95 duration-200 text-[#1e293b]">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                <p className="font-bold text-sm text-gray-800">{displayName}</p>
              </div>

              {/* เมนูสลับสิทธิ์การใช้งาน (Role Switcher) */}
              <div className="px-2 py-2 border-b border-gray-50">
                <div className="px-3 py-1 flex items-center gap-2 text-gray-400 mb-1">
                  <Users size={14} />
                  <span className="text-[12px] font-bold uppercase tracking-wider">กลุ่มสิทธิ์การใช้งาน</span>
                </div>
                {userRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { navigate(r.path); setShowProfile(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${role === r.id ? 'bg-green-50 text-green-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <span className="text-[14px]">{r.label}</span>
                    {role === r.id && <Check size={16} className="text-green-600" />}
                  </button>
                ))}
              </div>

              {/* จัดการบัญชีและออกจากระบบ */}
              <div className="p-1">
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-gray-600 transition-colors rounded-lg">
                  <Settings size={18} className="text-gray-400" />
                  <span className="text-[14px]">การตั้งค่า</span>
                </button>
                <button
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors rounded-lg font-bold"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                >
                  <LogOut size={18} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImg(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />
    </header>
  );
}
