import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderStaff from "./HeaderStaff";
import SidebarStaff from "./SidebarStaff";

export default function MainLayoutStaff() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ดึงชื่อจาก LocalStorage และกำหนด URL Backend
  const displayName = localStorage.getItem("display_name") || "เจ้าหน้าที่";
  const BACKEND = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="app-layout">
      {/* ส่วนหัว: รับ toggleMenu ไปใช้กับปุ่ม Hamburger */}
      <HeaderStaff
        onToggleMenu={toggleMenu}
        displayName={displayName}
        BACKEND={BACKEND}
      />

      {/* เมนูด้านซ้าย: แสดงผลตามสถานะ isMenuOpen */}
      <SidebarStaff
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* พื้นหลังมืด (Overlay) เมื่อเปิดเมนู */}
      {isMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 998
          }}
        />
      )}

      {/* ส่วนเนื้อหาหลัก: เว้นระยะ paddingTop ให้พอดีกับ Header */}
      <main
        className="content-area"
        style={{
          paddingTop: "80px",
          minHeight: "100vh",
          background: "#f8fafc", // สีพื้นหลังโทนเดียวกับหน้ายืมคืน
          transition: "margin 0.3s ease"
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
