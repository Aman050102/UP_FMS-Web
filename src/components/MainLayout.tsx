import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderUser from "./MainHeader";
import HeaderStaff from "./MainHeader";
import SidebarUser from "./SidebarUser";
import SidebarStaff from "./SidebarStaff";

interface MainLayoutProps {
  role: "user" | "staff";
}

export default function MainLayout({ role }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = localStorage.getItem("display_name") || "ผู้ใช้งาน";
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-main font-kanit">
      {/* เลือก Header ตาม Role */}
      {role === "staff" ? (
        <HeaderStaff onToggleMenu={toggleMenu} displayName={displayName} />
      ) : (
        <HeaderUser onToggleMenu={toggleMenu} displayName={displayName} />
      )}

      <div className="flex flex-1 overflow-hidden mt-header">
        {/* เลือก Sidebar ตาม Role */}
        {role === "staff" ? (
          <SidebarStaff
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
        ) : (
          <SidebarUser open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
