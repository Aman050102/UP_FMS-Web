import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderStaff from "./HeaderStaff";
import SidebarStaff from "./SidebarStaff";

export default function MainLayoutStaff() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ดึงชื่อจาก LocalStorage และกำหนด URL Backend ของ Cloudflare
  const displayName = localStorage.getItem("display_name") || "เจ้าหน้าที่";
  const BACKEND = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="app-layout" style={{ position: 'relative' }}>
      {/* 1. Sidebar วางไว้ด้านบนสุดของโครงสร้างเพื่อให้ Layer (z-index) อยู่บนสุด */}
      <SidebarStaff
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* 2. Header รับฟังก์ชันเปิดเมนู */}
      <HeaderStaff
        onToggleMenu={toggleMenu}
        displayName={displayName}
        BACKEND={BACKEND}
      />

      {/* 3. ส่วนเนื้อหาหลัก */}
      <main
        className="content-area"
        style={{
          paddingTop: "80px",
          minHeight: "100vh",
          background: "#f8fafc",
          transition: "margin 0.3s ease"
        }}
      >
        <Outlet />
      </main>

      {/* 4. Overlay ม่านดำสำหรับปิดเมนู เมื่อเปิด Sidebar */}
      {isMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 998 // ต้องน้อยกว่า z-index ของ Sidebar ในไฟล์ CSS
          }}
        />
      )}
    </div>
  );
}
