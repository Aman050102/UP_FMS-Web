import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, LogOut, X, Camera, User,
  ChevronDown, Home, Settings, Users, Check
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

export default function HeaderStaff({ displayName, onToggleMenu }: any) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // จำลองสิทธิ์ที่ได้รับ (ในระบบจริงควรดึงจาก Auth Context หรือ LocalStorage)
  // ทุกคนจะมี 'นิสิตปัจจุบัน' เป็นพื้นฐาน
  const [userRoles] = useState([
    { id: 'user', label: 'นิสิตปัจจุบัน', path: '/user/menu' },
    { id: 'staff', label: 'เจ้าหน้าที่ (Staff)', path: '/staff/menu' },
    { id: 'admin', label: 'ผู้ดูแลระบบ (Admin)', path: '/staff/notifications' },
  ]);

  // สมมติว่าปัจจุบันเราอยู่ที่หน้า Staff
  const currentActiveRole = "staff";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/pending-users/`, { credentials: "include" });
      const data = await res.json();
      if (data.ok) setNotifications(data.users);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUsers();
    const timer = setInterval(fetchUsers, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-[#5f5aa2] flex items-center justify-between px-4 z-50 shadow-md">
      {/* ฝั่งซ้าย: Logo & Menu */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors" onClick={onToggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <img src={dsaLogo} alt="Logo" className="h-[45px] cursor-pointer brightness-0 invert" onClick={() => navigate("/staff/menu")} />
      </div>

      {/* ฝั่งขวา: Profile & Roles */}
      <div className="flex items-center gap-3">
        <button
          className="p-2.5 rounded-full text-white hover:bg-white/10 relative transition-all"
          onClick={() => navigate("/staff/notifications")}
        >
          <Bell size={22} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-[#5f5aa2] animate-pulse">
              {notifications.length}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 p-1.5 pr-3 rounded-xl transition-all border border-white/10 group"
          >
            <div className="w-[32px] h-[32px] rounded-full overflow-hidden border-2 border-white/50 shadow-sm">
              {profileImg ? <img src={profileImg} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">{displayName?.[0] || 'A'}</div>}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{displayName}</span>
            <ChevronDown size={16} className={`text-white/70 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown สไตล์ iService */}
          {showProfile && (
            <div className="absolute top-[50px] right-0 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[3000] animate-in fade-in zoom-in-95 duration-200">
              {/* Home Page Link */}
              <button onClick={() => navigate("/")} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors border-b border-gray-50">
                <Home size={18} className="text-gray-400" />
                <span className="text-[15px] font-medium">Home page</span>
              </button>

              {/* กลุ่มสิทธิ์การใช้งาน (Role Switcher) */}
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Users size={16} />
                  <span className="text-[13px] font-bold">กลุ่มสิทธิ์การใช้งาน</span>
                </div>
                <div className="space-y-1">
                  {userRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => { navigate(role.path); setShowProfile(false); }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${currentActiveRole === role.id ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <span className="text-[14px]">{role.label}</span>
                      {currentActiveRole === role.id && <Check size={16} className="text-green-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* การตั้งค่า & ออกจากระบบ */}
              <div className="pt-1">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors">
                  <Settings size={18} className="text-gray-400" />
                  <span className="text-[14px] font-medium">การตั้งค่า</span>
                </button>
                <button
                  onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-[14px] font-bold">ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setProfileImg(reader.result as string);
          reader.readAsDataURL(file);
        }
      }} />
    </header>
  );
}
