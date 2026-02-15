import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  MessageSquare,
  CalendarCheck,
  CheckCircle,
  Trophy,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import dsaLogo from "../assets/dsa.png";

export default function Sidebar({ open, onClose, role }: any) {
  const location = useLocation();
  const displayName = localStorage.getItem("display_name") || "ผู้ใช้งาน";

  // ตรวจสอบสิทธิ์สูงสุดของผู้ใช้จากเครื่อง (เพื่อแถมปุ่มพิเศษให้ Admin ในทุกประเภทหน้า)
  const userRole = localStorage.getItem("user_role")?.toLowerCase();
  const isAdmin = userRole === "admin";

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
      location.pathname === path
        ? "bg-primary-soft text-primary font-bold border-r-4 border-primary"
        : "text-text-main hover:bg-bg-main"
    }`;

  // นิยามเมนูแยกตาม "ประเภทหน้า" อย่างชัดเจน
  const menus = {
    user: [
      { to: "/user/menu", label: "หน้าแรก", icon: <Home size={20} /> },
      {
        to: "/user/booking",
        label: "ระบบการจองสนามกีฬา",
        icon: <CalendarCheck size={20} />,
      },
    ],
    assistant: [
      {
        to: "/assistant/menu",
        label: "หน้าแรก (SA)",
        icon: <Home size={20} />,
      },
      {
        to: "/assistant/checkin",
        label: "เช็คอินสนาม",
        icon: <CheckCircle size={20} />,
      },
      {
        to: "/assistant/equipment",
        label: "ยืมอุปกรณ์",
        icon: <Trophy size={20} />,
      },
      {
        to: "/assistant/checkin_feedback",
        label: "แบบประเมิน",
        icon: <MessageSquare size={20} />,
      },
    ],
    staff: [
      { to: "/staff/menu", label: "หน้าแรก", icon: <Home size={20} /> },
      {
        to: "/staff/dashboard",
        label: "ข้อมูลการเข้าใช้สนาม",
        icon: <LayoutDashboard size={20} />,
      },
      {
        to: "/staff/equipment",
        label: "จัดการอุปกรณ์กีฬา",
        icon: <Package size={20} />,
      },
      {
        to: "/staff/borrow-ledger",
        label: "บันทึกการยืม–คืน",
        icon: <ClipboardList size={20} />,
      },
      {
        to: "/staff/document-management",
        label: "จัดการเอกสาร",
        icon: <BarChart3 size={20} />,
      },
      {
        to: "/staff/feedback",
        label: "อ่านฟีดแบ็กนิสิต",
        icon: <MessageSquare size={20} />,
      },
      {
        to: "/staff/booking-manage",
        label: "จัดการการจองสนาม",
        icon: <CalendarCheck size={20} />,
      },
    ],
  };

  // เลือกใช้กลุ่มเมนูตาม "role หน้าปัจจุบัน" ที่ได้รับมาจาก Layout
  let currentMenu = [...(menus[role as keyof typeof menus] || menus.user)];

  // ถ้าผู้ใช้มีสิทธิ์สูงสุดเป็น Admin ให้เพิ่มเมนู "จัดการสิทธิ์สมาชิก" เข้าไปในทุกๆ ประเภทหน้าที่เปิดอยู่
  if (isAdmin) {
    currentMenu.push({
      to: "/admin/manage-access",
      label: "จัดการสิทธิ์สมาชิก",
      icon: <ShieldCheck size={20} className="text-indigo-600" />,
    });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[1001]" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[1002] flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-header flex items-center px-8 border-b justify-center bg-white">
          <img src={dsaLogo} alt="Logo" className="h-[60px] object-contain" />
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          {currentMenu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(item.to)}
              onClick={onClose}
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t mt-auto flex items-center gap-3 text-primary font-bold bg-primary-soft/20">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
            <UserIcon size={20} />
          </div>
          <div className="flex flex-col overflow-hidden leading-tight text-left">
            <span className="text-[10px] uppercase opacity-60 font-black tracking-wider">
              {role} View
            </span>
            <span className="truncate text-sm">{displayName}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
