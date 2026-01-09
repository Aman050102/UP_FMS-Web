import React from "react";
import { Link } from "react-router-dom";
import { Home, LayoutDashboard, Package, ClipboardList, BarChart3, Settings } from "lucide-react";
import "../styles/sidebar.css";

export default function SidebarStaff({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const displayName = localStorage.getItem("display_name") || "ผู้ดูแลระบบ";

  return (
    <>
      {/* Overlay สำหรับปิด Sidebar เมื่อคลิกพื้นที่ว่าง */}
      {open && <div className="sidebar-overlay" onClick={onClose} style={{ zIndex: 1001 }} />}

      <aside className={`sidebar ${open ? "open" : ""}`} style={{ zIndex: 1002 }}>
        <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
            <img src="/img/dsa.png" alt="Logo" style={{ height: '50px' }} />
        </div>

        <div className="sidebar-menu-list" style={{ padding: '10px 0' }}>
          <Link to="/staff/menu" className="sidebar-link" onClick={onClose}>
            <Home size={20} color="#5f5aa2" /> <span>หน้าแรก</span>
          </Link>
          <Link to="/staff/menu" className="sidebar-link" onClick={onClose}>
            <LayoutDashboard size={20} color="#333" /> <span>แดชบอร์ด</span>
          </Link>
          <Link to="/staff/equipment" className="sidebar-link" onClick={onClose}>
            <Package size={20} color="#333" /> <span>จัดการอุปกรณ์</span>
          </Link>
          <Link to="/staff/borrow-ledger" className="sidebar-link" onClick={onClose}>
            <ClipboardList size={20} color="#333" /> <span>ยืม–คืน</span>
          </Link>
          <Link to="/staff/borrow-stats" className="sidebar-link" onClick={onClose}>
            <BarChart3 size={20} color="#333" /> <span>รายงาน</span>
          </Link>
        </div>

        <div className="sidebar-user" style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid #eee', fontWeight: 'bold', color: '#5f5aa2', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} />
            <span>{displayName}</span>
        </div>
      </aside>
    </>
  );
}
