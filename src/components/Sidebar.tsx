import { Link, useLocation } from "react-router-dom";
import {
  Home, LayoutDashboard, Package, ClipboardList, BarChart3,
  MessageSquare, CalendarCheck, CheckCircle, Trophy, User as UserIcon
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function Sidebar({ open, onClose, role }: any) {
  const location = useLocation();
  const displayName = localStorage.getItem("display_name") || "ผู้ใช้งาน";

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-6 py-4 transition-all duration-200 ${location.pathname === path
      ? "bg-primary-soft text-primary font-bold border-r-4 border-primary"
      : "text-text-main hover:bg-bg-main"
    }`;

  const menus = {
    user: [
      { to: "/user/menu", label: "หน้าแรก", icon: <Home size={20} /> },
      { to: "/booking", label: "ระบบการจองสนามกีฬา", icon: <CalendarCheck size={20} /> },
    ],
    assistant: [
      { to: "/assistant/menu", label: "หน้าแรก (SA)", icon: <Home size={20} /> },
      { to: "/assistant/checkin", label: "เช็คอินสนาม", icon: <CheckCircle size={20} /> },
      { to: "/assistant/equipment", label: "ยืมอุปกรณ์", icon: <Trophy size={20} /> },
      { to: "/assistant/checkin_feedback", label: "แบบประเมิน", icon: <MessageSquare size={20} /> },
    ],
    staff: [
      { to: "/staff/menu", label: "หน้าแรก", icon: <Home size={20} /> },
      { to: "/staff/dashboard", label: "ข้อมูลการเข้าใช้สนาม", icon: <LayoutDashboard size={20} /> },
      { to: "/staff/equipment", label: "จัดการอุปกรณ์กีฬา", icon: <Package size={20} /> },
      { to: "/staff/borrow-ledger", label: "บันทึกการยืม–คืน", icon: <ClipboardList size={20} /> },
      { to: "/staff/document-management", label: "จัดการเอกสาร", icon: <BarChart3 size={20} /> },
      { to: "/staff/feedback", label: "อ่านฟีดแบ็กนิสิต", icon: <MessageSquare size={20} /> },
      { to: "/staff/booking-manage", label: "จัดการการจองสนาม", icon: <CalendarCheck size={20} /> },
    ]
  };

  const currentMenu = menus[role as keyof typeof menus] || menus.user;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-[1001]" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[1002] flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-header flex items-center px-8 border-b justify-center">
          <img src={dsaLogo} alt="Logo" className="h-[60px] object-contain" />
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {currentMenu.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(item.to)} onClick={onClose}>
              {item.icon} <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t mt-auto flex items-center gap-3 text-primary font-bold bg-primary-soft/20">
          <UserIcon size={20} />
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase opacity-60">{role} Account</span>
            <span className="truncate text-sm">{displayName}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
