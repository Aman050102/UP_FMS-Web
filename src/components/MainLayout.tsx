import { useState } from "react";
import { Outlet } from "react-router-dom";
import MainHeader from "./MainHeader";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  // รับบทบาทของประเภทหน้าที่กำลังเปิดอยู่
  role: "user" | "staff" | "assistant" | "admin";
}

export default function MainLayout({ role }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = localStorage.getItem("display_name") || "ผู้ใช้งาน";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc] font-kanit">
      <MainHeader
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        displayName={displayName}
        role={role}
      />
      <div className="flex flex-1 overflow-hidden mt-header">
        <Sidebar
          role={role} // ส่ง role หน้าปัจจุบันไปให้ Sidebar แสดงเมนูให้ตรง
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
