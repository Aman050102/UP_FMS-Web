import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderStaff from "./HeaderStaff";
import SidebarStaff from "./SidebarStaff";

export default function MainLayoutStaff() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = localStorage.getItem("display_name") || "เจ้าหน้าที่";
  const BACKEND = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="app-layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 1. Header อยู่บนสุดเพียงที่เดียว */}
      <HeaderStaff
        onToggleMenu={toggleMenu}
        displayName={displayName}
        BACKEND={BACKEND}
      />

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* 2. Sidebar เมนูอยู่ด้านซ้ายเสมอ */}
        <SidebarStaff
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        {/* 3. ส่วนเนื้อหาหลักที่จะเปลี่ยนไปตามหน้าที่เลือก (Outlet) */}
        <main
          className="content-area"
          style={{
            flex: 1,
            paddingTop: "80px", // เว้นระยะให้ Header
            background: "#f8fafc",
            transition: "all 0.3s ease",
            minHeight: "100vh"
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Overlay เมื่อเปิดเมนูในมือถือ */}
      {isMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 998
          }}
        />
      )}
    </div>
  );
}
