import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell, User, LogOut, ShieldCheck, Settings,
  Check, X, Clock, MoreVertical, CheckCircle2
} from "lucide-react";
import "../styles/header.css";

export default function HeaderStaff({ displayName, onToggleMenu }: any) {
  const navigate = useNavigate();
  const [showNotify, setShowNotify] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeNotifyTab, setActiveNotifyTab] = useState("pending");

  // ข้อมูลจำลองสำหรับการแจ้งเตือนอนุมัติบัญชี
  const [notifications, setNotifications] = useState([
    { id: 1, name: "Aman Akelaii", role: "นิสิตช่วยงาน", time: "2 ชม. ที่แล้ว", avatar: "A", type: "register" },
    { id: 2, name: "Somsak Jaidee", role: "นิสิตช่วยงาน", time: "5 ชม. ที่แล้ว", avatar: "S", type: "register" }
  ]);

  const handleApprove = (id: number) => {
    // ในอนาคตเชื่อมต่อกับ API Cloudflare D1
    setNotifications(prev => prev.filter(n => n.id !== id));
    alert("อนุมัติผู้ใช้งานเรียบร้อยแล้ว");
  };

  const handleReject = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="topbar">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={onToggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <img src="/img/dsa.png" alt="Logo" className="brand-logo" onClick={() => navigate("/staff/menu")} />
      </div>

      <div className="header-right">
        {/* --- ระบบการแจ้งเตือน (Notification Center) --- */}
        <div className="dropdown-wrapper">
          <button
            className={`icon-circle-btn ${showNotify ? 'active' : ''}`}
            onClick={() => { setShowNotify(!showNotify); setShowProfile(false); }}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>

          {showNotify && (
            <div className="dropdown-panel notify-panel">
              <div className="dropdown-header-complex">
                <div className="header-top">
                  <h3>การแจ้งเตือน</h3>
                  <button className="settings-btn-ghost"><Settings size={16} /></button>
                </div>
                <div className="notify-tabs">
                  <button
                    className={activeNotifyTab === "all" ? "active" : ""}
                    onClick={() => setActiveNotifyTab("all")}
                  >
                    ทั้งหมด <span className="count-tag">{notifications.length}</span>
                  </button>
                  <button
                    className={activeNotifyTab === "pending" ? "active" : ""}
                    onClick={() => setActiveNotifyTab("pending")}
                  >
                    รออนุมัติ
                  </button>
                </div>
              </div>

              <div className="dropdown-content custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle2 size={48} strokeWidth={1} color="#cbd5e1" />
                    <p>ไม่มีการแจ้งเตือนใหม่ในขณะนี้</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notify-row-fancy">
                      <div className="avatar-wrapper">
                        <div className="avatar-squircle-gradient">{n.avatar}</div>
                        <div className="status-indicator online"></div>
                      </div>
                      <div className="notify-detail">
                        <p className="notify-text">
                          <strong>{n.name}</strong>
                          <span className="action-text"> ได้ส่งคำขออนุมัติบัญชีใหม่</span>
                        </p>
                        <div className="notify-meta">
                          <span className="role-tag">{n.role}</span>
                          <span className="dot">•</span>
                          <span className="time-text"><Clock size={12} /> {n.time}</span>
                        </div>
                        <div className="action-card">
                          <button className="btn-approve-filled" onClick={() => handleApprove(n.id)}>
                            <Check size={14} /> อนุมัติ
                          </button>
                          <button className="btn-reject-ghost" onClick={() => handleReject(n.id)}>
                            ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                <button>ดูประวัติการแจ้งเตือนทั้งหมด</button>
              </div>
            </div>
          )}
        </div>

        {/* --- ส่วนโปรไฟล์บัญชี (Profile Dropdown) --- */}
        <div className="dropdown-wrapper">
          <button className="profile-circle-trigger" onClick={() => { setShowProfile(!showProfile); setShowNotify(false); }}>
            <div className="avatar-main">{displayName[0]}</div>
          </button>

          {showProfile && (
            <div className="dropdown-panel profile-panel">
              <div className="user-profile-summary">
                <div className="avatar-large">{displayName[0]}</div>
                <div className="user-info-text">
                  <h4>{displayName}</h4>
                  <span>Admin / ผู้ดูแลระบบ</span>
                </div>
              </div>
              <div className="menu-list">
                <button className="menu-btn"><User size={18} /> <span>ข้อมูลส่วนตัว</span></button>
                <button className="menu-btn"><Settings size={18} /> <span>ตั้งค่าระบบ</span></button>
                <hr className="divider" />
                <button className="menu-btn logout" onClick={() => { localStorage.clear(); window.location.href="/login"; }}>
                  <LogOut size={18} /> <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
