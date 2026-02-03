import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Camera, X, User } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function HeaderUser({ displayName, onToggleMenu }: any) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const userEmail = localStorage.getItem("userEmail") || "user@up.ac.th";

  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-surface flex items-center justify-between px-4 z-50 shadow-sm border-b border-border-main">
      {/* ส่วนซ้าย: ปุ่มเมนูและโลโก้ */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-bg-main transition-colors cursor-pointer text-text-main"
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
          className="h-[55px] cursor-pointer object-contain"
          onClick={() => navigate("/user/menu")}
        />
      </div>

      {/* ส่วนขวา: โปรไฟล์ */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="flex items-center cursor-pointer"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-bold border-2 border-white shadow-sm transition-transform hover:scale-105">
              {profileImg ? (
                <img
                  src={profileImg}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{displayName?.[0] || "U"}</span>
              )}
            </div>
          </button>

          {showProfile && (
            <div className="absolute top-[55px] right-0 w-[320px] bg-[#f0f3f8] rounded-[28px] shadow-2xl p-4 z-[3000] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-5 px-2 text-[#5f6368] text-sm font-medium">
                <span className="truncate">{userEmail}</span>
                <button
                  className="cursor-pointer hover:text-text-main"
                  onClick={() => setShowProfile(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center text-4xl border-4 border-white overflow-hidden shadow-md">
                    {profileImg ? (
                      <img
                        src={profileImg}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{displayName?.[0] || "U"}</span>
                    )}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 bg-white border border-[#dadce0] rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[#1a73e8] shadow-sm hover:scale-110 transition-transform"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[#202124]">
                  {displayName}
                </h2>
                <p className="text-sm text-text-muted">
                  นิสิต / ผู้ใช้งานทั่วไป
                </p>
              </div>
              <div className="space-y-2">
                <button
                  className="w-full bg-white hover:bg-red-50 transition-colors p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-red-500 cursor-pointer shadow-sm border border-transparent hover:border-red-100"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                >
                  <LogOut size={18} /> <span>ออกจากระบบ</span>
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
