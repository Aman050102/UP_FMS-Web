import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  Settings,
  MessageSquare,
  CalendarCheck
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function SidebarStaff({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const location = useLocation();
  const displayName = localStorage.getItem("display_name") || "ผู้ดูแลระบบ";

  // ฟังก์ชันกำหนดสไตล์ของลิงก์ที่กำลังใช้งาน (Active Link)
  const linkClass = (path: string) => `flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
    location.pathname === path
    ? "bg-primary-soft text-primary font-bold border-r-4 border-primary"
    : "text-text-main hover:bg-bg-main"
  }`;

  return (
    <>
      {/* Overlay สำหรับปิด Sidebar เมื่อคลิกด้านนอก */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[1001] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-surface z-[1002] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${open ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo Section */}
        <div className="h-header flex items-center px-8 border-b border-border-main justify-center bg-white">
          <img src={dsaLogo} alt="Logo" className="h-[60px] object-contain" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <Link to="/staff/menu" className={linkClass("/staff/menu")} onClick={onClose}>
            <Home size={20} /> <span>หน้าแรก</span>
          </Link>

          <Link to="/staff/dashboard" className={linkClass("/staff/dashboard")} onClick={onClose}>
            <LayoutDashboard size={20} /> <span>ข้อมูลการเข้าใช้สนาม</span>
          </Link>

          <Link to="/staff/equipment" className={linkClass("/staff/equipment")} onClick={onClose}>
            <Package size={20} /> <span>จัดการอุปกรณ์กีฬา</span>
          </Link>

          <Link to="/staff/borrow-ledger" className={linkClass("/staff/borrow-ledger")} onClick={onClose}>
            <ClipboardList size={20} /> <span>บันทึกการยืม–คืน</span>
          </Link>

          <Link to="/staff/borrow-stats" className={linkClass("/staff/borrow-stats")} onClick={onClose}>
            <BarChart3 size={20} /> <span>จัดการเอกสาร</span>
          </Link>

          {/* เมนูใหม่ที่เพิ่มเข้ามาให้ตรงกับ StaffMenu */}
          <Link to="/staff/feedback" className={linkClass("/staff/feedback")} onClick={onClose}>
            <MessageSquare size={20} /> <span>อ่านฟีดแบ็กนิสิต</span>
          </Link>

          <Link to="/staff/booking-manage" className={linkClass("/staff/booking-manage")} onClick={onClose}>
            <CalendarCheck size={20} /> <span>จัดการการจองสนาม</span>
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-border-main mt-auto flex items-center gap-3 text-primary font-bold bg-primary-soft/20">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
            <Settings size={20}/>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] text-text-muted font-black uppercase tracking-tighter">Staff Account</span>
            <span className="truncate text-sm">{displayName}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
