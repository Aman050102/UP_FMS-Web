import React from "react";

export default function HeaderBase({
  onToggleMenu,
  displayName,
  BACKEND,
}: any) {
  return (
    <header className="fixed top-0 left-0 right-0 h-header bg-surface flex items-center justify-between px-4 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      {/* ฝั่งซ้าย: ปุ่มเมนู + โลโก้ */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-bg-main transition-colors cursor-pointer flex items-center justify-center text-text-main"
          onClick={onToggleMenu}
          type="button"
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <img
          src="/img/dsa.png"
          alt="Logo"
          className="h-[60px] object-contain cursor-pointer"
        />
      </div>

      {/* ฝั่งขวา: ชื่อผู้ใช้ + ปุ่มออก */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm font-medium text-text-main">
          {displayName}
        </span>
        <form action={`${BACKEND}/logout/`} method="post">
          <button
            type="submit"
            className="bg-primary text-white px-3.5 py-1.5 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
