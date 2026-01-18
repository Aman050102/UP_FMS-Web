import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, X, Clock, Camera, User } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

export default function HeaderStaff({ displayName, onToggleMenu }: any) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNotify, setShowNotify] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const userEmail = localStorage.getItem("userEmail") || "admin@dsa.com";

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
    <header className="fixed top-0 left-0 right-0 h-header bg-surface flex items-center justify-between px-4 z-50 shadow-sm border-b border-border-main">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-bg-main transition-colors cursor-pointer text-text-main" onClick={onToggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <img src={dsaLogo} alt="Logo" className="h-[55px] cursor-pointer object-contain" onClick={() => navigate("/staff/menu")} />
      </div>

      <div className="flex items-center gap-3">
        {/* ส่วนแจ้งเตือน */}
        <div className="relative">
          <button className={`p-2.5 rounded-full transition-all cursor-pointer relative ${showNotify ? "bg-primary-soft text-primary" : "hover:bg-bg-main text-text-main"}`} onClick={() => { setShowNotify(!showNotify); setShowProfile(false); }}>
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-surface animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotify && (
            <div className="absolute top-[55px] right-0 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[3000]">
              <div className="p-4 border-b border-gray-50 font-bold text-sm text-text-main flex justify-between items-center bg-bg-main/30">
                คำขอสมัครสมาชิก <span className="text-primary bg-primary-soft px-2 py-0.5 rounded-full text-xs">{notifications.length} รายการ</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm italic">ไม่มีรายการรออนุมัติ</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold shrink-0">{n.username?.[0]}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{n.fullName || n.username}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10}/> {new Date(n.createdAt).toLocaleDateString()}</span>
                          <button className="text-[11px] bg-primary text-white px-3 py-1 rounded-lg font-bold hover:opacity-90 transition-opacity" onClick={() => navigate('/staff/menu')}>จัดการ</button>
                        </div>
                      </div>
                    </div>
                  )) // <-- ปิดวงเล็บของ .map ตรงนี้ครับ
                )}
              </div>
            </div>
          )}
        </div>

        {/* ส่วนโปรไฟล์ */}
        <div className="relative">
          <button className="flex items-center cursor-pointer" onClick={() => { setShowProfile(!showProfile); setShowNotify(false); }}>
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-bold border-2 border-white shadow-sm transition-transform hover:scale-105">
              {profileImg ? <img src={profileImg} className="w-full h-full rounded-full object-cover" /> : <span>{displayName?.[0] || "A"}</span>}
            </div>
          </button>

          {showProfile && (
            <div className="absolute top-[55px] right-0 w-[320px] bg-[#f0f3f8] rounded-[28px] shadow-2xl p-4 z-[3000] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-5 px-2 text-[#5f6368] text-sm font-medium">
                <span className="truncate">{userEmail}</span>
                <button className="cursor-pointer hover:text-text-main" onClick={() => setShowProfile(false)}><X size={20} /></button>
              </div>
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center text-4xl border-4 border-white overflow-hidden shadow-md">
                    {profileImg ? <img src={profileImg} className="w-full h-full object-cover" /> : <span>{displayName?.[0] || "A"}</span>}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border border-[#dadce0] rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[#1a73e8] shadow-sm hover:scale-110 transition-transform" onClick={() => fileInputRef.current?.click()}>
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[#202124]">{displayName}</h2>
                <p className="text-xs text-primary font-bold bg-primary-soft inline-block px-3 py-1 rounded-full mt-1">Staff Administrator</p>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-white hover:bg-gray-50 transition-colors p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-[#475569] border border-gray-100 cursor-pointer shadow-sm" onClick={() => navigate("/user/menu")}>
                  <User size={18} /> <span>สลับไปฝั่งนิสิต</span>
                </button>
                <button className="w-full bg-white hover:bg-red-50 transition-colors p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-red-500 cursor-pointer shadow-sm border border-transparent hover:border-red-100" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
                  <LogOut size={18} /> <span>ออกจากระบบ</span>
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
