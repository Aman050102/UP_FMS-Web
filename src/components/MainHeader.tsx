import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  ChevronDown,
  Users,
  Check,
  Settings,
  ShieldAlert,
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function MainHeader({ onToggleMenu, role }: any) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null); // เพิ่ม ref สำหรับตรวจสอบการคลิกภายนอก

  const [headerInfo, setHeaderInfo] = useState({
    displayName: localStorage.getItem("display_name") || "ผู้ใช้งาน",
    userEmail: localStorage.getItem("user_email") || "user@up.ac.th",
    profileImage: localStorage.getItem("user_image") || null,
  });

  const API = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://up-fms-api-hono.aman02012548.workers.dev"
  ).replace(/\/$/, "");

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API}/api/staff/notifications`);
      const data = await res.json();
      if (data.ok) {
        const unread = data.rows.filter(
          (n: any) => n.is_read === 0 || n.is_read === false,
        ).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);

    const handleUpdate = () => {
      setHeaderInfo({
        displayName: localStorage.getItem("display_name") || "ผู้ใช้งาน",
        userEmail: localStorage.getItem("user_email") || "user@up.ac.th",
        profileImage: localStorage.getItem("user_image") || null,
      });
    };

    // ฟังก์ชันจัดการการคลิกภายนอกเมนู
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };

    window.addEventListener("profileUpdated", handleUpdate);
    document.addEventListener("mousedown", handleClickOutside); // ดักจับการคลิกทั่วทั้งเอกสาร

    return () => {
      window.removeEventListener("profileUpdated", handleUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const userRole = localStorage.getItem("user_role")?.toLowerCase();
  const isAdmin = userRole === "admin";

  const allRoles = [
    { id: "staff", label: "เจ้าหน้าที่ (Staff)", path: "/staff/menu" },
    { id: "assistant", label: "นิสิตช่วยงาน (SA)", path: "/assistant/menu" },
    { id: "user", label: "นิสิตและบุคลากรทั่วไป", path: "/user/menu" },
  ];

  const accessibleRoles = isAdmin
    ? allRoles
    : allRoles.filter((r) => r.id === "user" || r.id === userRole);
  const isStaffOrAdmin = userRole === "staff" || isAdmin;

  const renderAvatar = (sizeClass: string, textClass: string) => {
    const hasImage =
      headerInfo.profileImage && headerInfo.profileImage !== "null";
    const initial = headerInfo.displayName.trim().charAt(0).toUpperCase();

    return (
      <div
        className={`${sizeClass} rounded-full bg-[#5f5aa2] flex items-center justify-center text-white ${textClass} font-bold overflow-hidden border border-white/20 shadow-inner`}
      >
        {hasImage ? (
          <img
            src={headerInfo.profileImage!}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-[#5f5aa2] flex items-center justify-between px-4 z-50 shadow-md font-kanit">
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          onClick={onToggleMenu}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <img
          src={dsaLogo}
          alt="Logo"
          className="h-[45px] cursor-pointer object-contain brightness-0 invert"
          onClick={() => navigate(`/${role}/menu`)}
        />
      </div>

      <div className="flex items-center gap-3">
        {isStaffOrAdmin && (
          <button
            className="p-2.5 rounded-full text-white hover:bg-white/10 relative cursor-pointer"
            onClick={() => navigate("/staff/notifications")}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#5f5aa2] animate-in zoom-in duration-300">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* หุ้มส่วนโปรไฟล์ด้วย ref เพื่อตรวจสอบขอบเขตการคลิก */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 p-1.5 pr-3 rounded-xl border border-white/10 group cursor-pointer text-left transition-all"
            onClick={() => setShowProfile(!showProfile)}
          >
            {renderAvatar("w-[32px] h-[32px]", "text-xs")}
            <div className="flex flex-col leading-tight hidden sm:block">
              <span className="text-white text-sm font-medium">
                {headerInfo.displayName}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/70 transition-transform ${showProfile ? "rotate-180" : ""}`}
            />
          </button>

          {showProfile && (
            <div className="absolute top-[50px] right-0 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[3000] text-[#1e293b] text-left animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50 mb-1 flex items-center gap-3">
                {renderAvatar("w-10 h-10", "text-lg")}
                <div className="overflow-hidden">
                  <p className="text-[11px] text-indigo-500 font-bold truncate">
                    {headerInfo.userEmail}
                  </p>
                  <p className="font-bold text-sm text-gray-800 truncate">
                    {headerInfo.displayName}
                  </p>
                </div>
              </div>

              <div className="px-2 py-2 border-b border-gray-50">
                <div className="px-3 py-1 flex items-center gap-2 text-gray-400 mb-1">
                  <Users size={14} />
                  <span className="text-[12px] font-bold uppercase">
                    กลุ่มสิทธิ์การใช้งาน
                  </span>
                </div>
                {accessibleRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      navigate(r.path);
                      setShowProfile(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${role === r.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-gray-50 text-gray-600"}`}
                  >
                    <span className="text-[14px]">{r.label}</span>
                    {role === r.id && (
                      <Check size={16} className="text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-1">
                {isAdmin && (
                  <button
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 text-indigo-600 rounded-lg font-bold text-left"
                    onClick={() => {
                      navigate("/admin/manage-access");
                      setShowProfile(false);
                    }}
                  >
                    <ShieldAlert size={18} />
                    <span className="text-[14px]">จัดการสิทธิ์สมาชิก</span>
                  </button>
                )}
                <button
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-gray-600 rounded-lg text-left"
                  onClick={() => {
                    navigate("/profile-settings");
                    setShowProfile(false);
                  }}
                >
                  <Settings size={18} className="text-gray-400" />
                  <span className="text-[14px]">จัดการโปรไฟล์</span>
                </button>
                <button
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-500 rounded-lg font-bold text-left"
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
    </header>
  );
}
