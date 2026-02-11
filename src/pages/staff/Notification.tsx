import React, { useState } from "react";
import {
  Bell, Shield, UserPlus, Trash2, Search,
  CheckCircle, Clock, Filter, CheckCircle2,
  ShieldCheck,
   MailOpen, Mail, RotateCcw
} from "lucide-react";

export default function Notification() {
  const [activeTab, setActiveTab] = useState<"notify" | "access">("notify");
  const [currentUser] = useState({ role: "admin" });

  const [notifications, setNotifications] = useState([
    { id: 1, equipment: "ลูกบาสเกตบอล", qty: 2, user: "นิสิต 6501xxx", time: "10:30", type: "return", isRead: false },
    { id: 2, equipment: "ไม้แบดมินตัน", qty: 1, user: "นิสิต 6502xxx", time: "09:45", type: "borrow", isRead: true },
    { id: 3, equipment: "ลูกวอลเลย์บอล", qty: 3, user: "นิสิต 6503xxx", time: "08:15", type: "return", isRead: false },
  ]);

  const [collaborators] = useState([
    { id: "STAFF01", name: "สมชาย ใจดี", role: "Staff", avatar: "S" },
    { id: "65010xxx", name: "Achiraya", role: "Student Assistant", avatar: "SA" },
  ]);

  const clearNotifications = () => {
    if (window.confirm("คุณต้องการล้างรายการแจ้งเตือนทั้งหมดใช่หรือไม่?")) {
      setNotifications([]);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Bell className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Management System</h1>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl font-medium">
            <button onClick={() => setActiveTab('notify')} className={`px-4 py-1.5 rounded-lg text-sm ${activeTab === 'notify' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Notifications</button>
            <button onClick={() => setActiveTab('access')} className={`px-4 py-1.5 rounded-lg text-sm ${activeTab === 'access' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Access Control</button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-6">
        {activeTab === 'notify' ? (
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Activity Stream</h2>
                <p className="text-sm text-gray-500">กิจกรรมล่าสุดแบบเรียลไทม์</p>
              </div>
              <button onClick={clearNotifications} className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                <RotateCcw size={14} /> ล้างข้อมูล
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.type === 'return' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {n.type === 'return' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className={`text-sm ${!n.isRead ? 'font-bold' : ''}`}>{n.user} {n.type === 'return' ? 'คืน' : 'ยืม'} {n.equipment}</h4>
                        <p className="text-xs text-gray-400">จำนวน {n.qty} ชิ้น • {n.time} น.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold">Access Management</h2>
              {currentUser.role === "admin" && (
                <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md">
                  <UserPlus size={16} /> Add Member
                </button>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {collaborators.map((user) => (
                  <div key={user.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600">{user.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-bold text-sm">{user.name}</span>{user.role === 'Staff' && <UserShield size={14} className="text-yellow-500" />}</div>
                        <p className="text-[10px] text-gray-400">{user.id}</p>
                      </div>
                    </div>
                    {currentUser.role === "admin" && (
                      <div className="flex gap-2">
                        <select className="text-xs border rounded-lg p-1 bg-gray-50">
                          <option>Admin</option>
                          <option>Staff</option>
                          <option>Student Assistant</option>
                        </select>
                        <button className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
