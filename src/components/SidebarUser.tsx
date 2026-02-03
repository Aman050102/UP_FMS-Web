import React from "react";
import { Home, CheckCircle, Trophy, User } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function SidebarUser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const displayName = localStorage.getItem("display_name") || "ผู้ใช้งาน";
  const navLinkClass =
    "flex items-center gap-3 px-[25px] py-[15px] text-[#333] transition-colors hover:bg-bg-main font-medium";

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[2500] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-white z-[3000] shadow-[2px_0_10px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-[90px] px-5 flex items-center border-b border-[#eee]">
          <img
            src={dsaLogo}
            alt="Logo"
            className="h-[60px] cursor-pointer object-contain"
            onClick={() => navigate("/user/menu")}
          />
        </div>

        <nav className="flex-1 py-2">
          <a href="/user/menu" onClick={onClose} className={navLinkClass}>
            <Home size={20} strokeWidth={2.5} className="text-primary" />{" "}
            หน้าแรก
          </a>
          <a href="/checkin" onClick={onClose} className={navLinkClass}>
            <CheckCircle size={20} strokeWidth={2.5} className="text-primary" />{" "}
            เช็คอินสนาม
          </a>
          <a href="/equipment" onClick={onClose} className={navLinkClass}>
            <Trophy size={20} strokeWidth={2.5} className="text-primary" />{" "}
            ยืมอุปกรณ์
          </a>
          <a
            href="/checkin_feedback"
            onClick={onClose}
            className={navLinkClass}
          >
            <CheckCircle
              size={20}
              strokeWidth={2.5}
              className="text-[#ec4899]"
            />{" "}
            แบบประเมิน
          </a>
        </nav>

        <div className="mt-auto p-5 border-t border-[#eee] font-bold text-primary flex items-center gap-3 bg-primary-soft/30">
          <User size={22} strokeWidth={2.5} />{" "}
          <span className="truncate">{displayName}</span>
        </div>
      </aside>
    </>
  );
}
