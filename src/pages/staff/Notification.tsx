import React, { useState } from "react";
import {
  Bell, Shield, UserPlus, Trash2, Search,
  CheckCircle, Clock, Filter, CheckCircle2,
  ShieldCheck, MailOpen, Mail, RotateCcw,
  MoreHorizontal, ChevronDown, X, User, Check
} from "lucide-react";

// กำหนดประเภทข้อมูล
interface NotificationItem {
  id: number;
  equipment: string;
  qty: number;
  user: string;
  time: string;
  type: 'borrow' | 'return';
  isRead: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  username: string;
  role: 'Admin' | 'Staff' | 'Student Assistant';
  avatar: string;
}

export default function Notification() {
  const [activeTab, setActiveTab] = useState<"notify" | "access">("notify");
  const [currentUser] = useState({ role: "admin" }); // จำลองว่าเราเป็น Admin

  // --- State สำหรับระบบแจ้งเตือน ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, equipment: "ลูกบาสเกตบอล", qty: 2, user: "นิสิต 6501xxx", time: "10:30", type: "return", isRead: false },
    { id: 2, equipment: "ไม้แบดมินตัน", qty: 1, user: "นิสิต 6502xxx", time: "09:45", type: "borrow", isRead: true },
    { id: 3, equipment: "ลูกวอลเลย์บอล", qty: 3, user: "นิสิต 6503xxx", time: "08:15", type: "return", isRead: false },
  ]);

  // --- State สำหรับระบบจัดการสิทธิ์ ---
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: "STAFF01", name: "สมชาย ใจดี", username: "somchai_up", role: "Staff", avatar: "S" },
    { id: "65010xxx", name: "AchirayaSE67", username: "achiraya_se", role: "Student Assistant", avatar: "A" },
  ]);

  // --- State สำหรับ Modal เพิ่มคน ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>("Student Assistant");

  // ข้อมูลจำลองในฐานข้อมูล (สำหรับค้นหา)
  const systemUsers = [
    { id: "65010001", name: "Anton", username: "anton_up", avatar: "A" },
    { id: "65010002", name: "vessvess", username: "vess_vess", avatar: "V" },
    { id: "65010003", name: "adyx0us", username: "adyx_up", avatar: "A" },
    { id: "65010004", name: "paperboy65", username: "paper_b", avatar: "P" },
  ];

  const filteredSearch = systemUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Functions ---
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    if (window.confirm("ต้องการล้างรายการแจ้งเตือนทั้งหมดใช่หรือไม่?")) setNotifications([]);
  };

  const handleAddCollaborator = () => {
    if (!selectedUser) return;
    const newMember: Collaborator = {
      ...selectedUser,
      role: selectedRole,
    };
    setCollaborators([...collaborators, newMember]);
    setIsModalOpen(false);
    setSelectedUser(null);
    setSearchQuery("");
    alert(`มอบสิทธิ์ให้ ${selectedUser.name} เป็น ${selectedRole} เรียบร้อยแล้ว`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-kanit text-[#1e293b]">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#5f5aa2] p-2 rounded-lg">
              <Bell className="text-white" size={18} />
            </div>
            <h1 className="text-md font-bold tracking-tight">Management System</h1>
          </div>

          <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button onClick={() => setActiveTab('notify')} className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'notify' ? 'bg-white text-[#5f5aa2] shadow-sm' : 'text-gray-400'}`}>Notifications</button>
            <button onClick={() => setActiveTab('access')} className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'access' ? 'bg-white text-[#5f5aa2] shadow-sm' : 'text-gray-400'}`}>Manage Access</button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-10 px-6">
        {activeTab === 'notify' ? (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Activity Stream</h2>
                <p className="text-sm text-slate-400">รายการแจ้งเตือนแบบเรียลไทม์ (ไม่รวมข้อมูลย้อนหลัง)</p>
              </div>
              <button onClick={clearNotifications} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <RotateCcw size={14} /> ล้างการแจ้งเตือน
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center px-8">
                <div className="flex gap-6">
                  <span className="text-[10px] uppercase font-bold text-[#5f5aa2] flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#5f5aa2] rounded-full animate-pulse"></div> ทั้งหมด ({notifications.length})
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300">ยังไม่อ่าน ({notifications.filter(n => !n.isRead).length})</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-24 text-center text-slate-300 italic text-sm">ไม่มีรายการแจ้งเตือนใหม่</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-gray-50/80 ${!n.isRead ? 'bg-[#f1f0fb]/30' : ''}`}>
                      <div className="flex items-center gap-5">
                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${n.type === 'return' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {n.type === 'return' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                          {!n.isRead && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#5f5aa2] border-2 border-white rounded-full"></div>}
                        </div>
                        <div>
                          <h4 className={`text-[15px] ${!n.isRead ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                            {n.user} {n.type === 'return' ? 'ส่งคืน' : 'ยืม'} {n.equipment}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">จำนวน {n.qty} ชิ้น • {n.time} น.</p>
                        </div>
                      </div>
                      {!n.isRead ? <Mail size={16} className="text-[#5f5aa2]" /> : <MailOpen size={16} className="text-slate-200" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Manage Access</h2>
                <p className="text-sm text-gray-400">จัดการสิทธิ์เจ้าหน้าที่และนิสิตช่วยงาน (SA)</p>
              </div>
              {currentUser.role === "admin" && (
                <button onClick={() => setIsModalOpen(true)} className="bg-[#2da44e] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-[#2c974b] transition-all">
                  Add people
                </button>
              )}
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 px-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-300" size={18} />
                  <input type="text" placeholder="Find a collaborator..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm focus:border-indigo-300" />
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {collaborators.map((user) => (
                  <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : user.role === 'Staff' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600 hover:underline cursor-pointer">{user.name}</span>
                          <span className="text-xs text-slate-300 font-medium">@{user.username}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold tracking-wider">{user.role}</p>
                      </div>
                    </div>
                    {currentUser.role === "admin" && (
                      <div className="flex items-center gap-4">
                        <select className="bg-gray-100 border-none text-[11px] font-black text-gray-500 rounded-xl px-4 py-1.5 cursor-pointer focus:ring-0">
                          <option>Admin</option><option>Staff</option><option>Student Assistant</option>
                        </select>
                        <button className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- GitHub Style Modal: Add People --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-slate-800">Add people to system</h3>
              <button onClick={() => { setIsModalOpen(false); setSelectedUser(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-5">
              {!selectedUser ? (
                <>
                  <p className="text-center text-[13px] font-bold text-slate-700 mb-4">Search by username, full name, or id</p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-blue-500" size={18} />
                    <input autoFocus type="text" placeholder="Find people" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-blue-500 rounded-xl text-sm outline-none shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all" />
                  </div>
                  <div className="max-h-[220px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                    {searchQuery.length > 0 ? filteredSearch.map(u => (
                      <div key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600">{u.avatar}</div>
                        <div className="flex-1 text-sm"><p className="font-bold text-slate-800">{u.name}</p><p className="text-xs text-slate-400">@{u.username}</p></div>
                        <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100">Select</span>
                      </div>
                    )) : <div className="py-12 text-center text-slate-300 text-sm">Type to search for members</div>}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">{selectedUser.avatar}</div>
                    <div className="flex-1"><p className="font-bold text-slate-900">{selectedUser.name}</p><p className="text-xs text-slate-500">@{selectedUser.username}</p></div>
                    <button onClick={() => setSelectedUser(null)} className="text-xs font-bold text-blue-600 hover:underline">Change</button>
                  </div>
                  <label className="block text-xs font-bold text-slate-700 mb-3">Choose a role</label>
                  <div className="space-y-2">
                    {[
                      { id: 'Admin', desc: 'จัดการสิทธิ์และสต็อกทั้งหมด' },
                      { id: 'Staff', desc: 'จัดการสต็อกและดูรายงาน' },
                      { id: 'Student Assistant', desc: 'ยืม-คืนและบันทึกสถิติ' }
                    ].map(r => (
                      <label key={r.id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedRole === r.id ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <input type="radio" checked={selectedRole === r.id} onChange={() => setSelectedRole(r.id)} className="mt-1 w-4 h-4 text-blue-600" />
                        <div><p className="text-sm font-bold text-slate-800">{r.id}</p><p className="text-[10px] text-slate-500 leading-tight">{r.desc}</p></div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setIsModalOpen(false); setSelectedUser(null); }} className="px-5 py-2 text-sm font-bold text-slate-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddCollaborator} disabled={!selectedUser} className="px-6 py-2 text-sm font-bold text-white bg-[#2da44e] rounded-xl hover:bg-[#2c974b] disabled:opacity-50 transition-all shadow-sm">Add to organization</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
