import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Clock, CheckCircle2, Trash2, X,
  MessageSquare, FileBarChart, Loader2, ChevronRight, Info
} from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  time: string;
  type: 'borrow' | 'return' | 'feedback' | 'summary';
  isRead: boolean;
}

export default function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoti, setSelectedNoti] = useState<NotificationItem | null>(null);

  const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/staff/notifications`);
      const data = await res.json();
      if (data.ok) setNotifications(data.rows);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const clearAllNotifications = async () => {
    if (!window.confirm("ต้องการลบการแจ้งเตือนทั้งหมดใช่หรือไม่?")) return;
    try {
      const res = await fetch(`${API}/api/staff/notifications/clear-all`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API}/api/staff/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // กรองรายการที่ถูกลบออกจากสถานะทันที
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (selectedNoti?.id === id) setSelectedNoti(null);
      } else {
        alert("ไม่สามารถลบรายการได้");
      }
    } catch (err) { console.error(err); }
  };

  const handleItemClick = async (n: NotificationItem) => {
    setSelectedNoti(n);

    if (!n.isRead) {
      try {
        await fetch(`${API}/api/staff/notifications/${n.id}/read`, { method: 'PATCH' });
        setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-kanit p-6">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3 italic text-slate-800">
              <Bell className="text-[#5f5aa2] fill-[#5f5aa2]/10" /> Activity Stream
            </h2>
            <p className="text-sm text-slate-400">รายการแจ้งเตือนใหม่ ({notifications.filter(n => !n.isRead).length})</p>
          </div>
          <button onClick={clearAllNotifications} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
            <Trash2 size={14} /> ล้างข้อมูลทั้งหมด
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#5f5aa2]" /></div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-medium italic">
              ไม่มีการแจ้งเตือนค้างอยู่ในระบบ
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`group relative p-5 rounded-[1.8rem] border transition-all flex items-center gap-4 cursor-pointer
                ${!n.isRead
                    ? 'bg-white border-[#5f5aa2]/40 shadow-lg shadow-[#5f5aa2]/5 scale-[1.01]'
                    : 'bg-slate-50/50 border-slate-100 opacity-60 grayscale-[0.5]'}`}
              >
                {!n.isRead && (
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-[#5f5aa2] rounded-full"></div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                  ${n.type === 'summary' ? 'bg-indigo-100 text-indigo-600' :
                    n.type === 'feedback' ? 'bg-pink-100 text-pink-600' :
                      n.type === 'return' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {n.type === 'summary' ? <FileBarChart size={24} /> :
                    n.type === 'feedback' ? <MessageSquare size={24} /> :
                      n.type === 'return' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm transition-all ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-400'}`}>
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {n.time}
                      </span>
                      <button
                        onClick={(e) => deleteNotification(e, n.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 flex items-center gap-1 truncate ${!n.isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                    {n.content} <ChevronRight size={10} className="text-[#5f5aa2] opacity-50" />
                  </p>
                </div>

                {!n.isRead && (
                  <div className="w-2.5 h-2.5 bg-[#5f5aa2] rounded-full animate-pulse shadow-[0_0_10px_#5f5aa2]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNoti && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[5000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-left">
            <div className={`p-8 flex justify-between items-start
              ${selectedNoti.type === 'summary' ? 'bg-indigo-50 text-indigo-700' :
                selectedNoti.type === 'feedback' ? 'bg-pink-50 text-pink-700' :
                  selectedNoti.type === 'return' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-current">
                  {selectedNoti.type === 'summary' ? <FileBarChart size={28} /> :
                    selectedNoti.type === 'feedback' ? <MessageSquare size={28} /> :
                      selectedNoti.type === 'return' ? <CheckCircle2 size={28} /> : <Clock size={28} />}
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight">{selectedNoti.title}</h3>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <Clock size={10} /> {selectedNoti.time}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedNoti(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Info size={12} /> รายละเอียดข้อมูล
                </label>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {selectedNoti.content}
                </div>
              </div>

              <button
                onClick={() => {
                  const path = selectedNoti.type === 'feedback' ? '/staff/feedback' :
                    selectedNoti.type === 'summary' ? '/staff/dashboard' : '/staff/borrow-ledger';
                  navigate(path);
                  setSelectedNoti(null);
                }}
                className="w-full py-4 bg-[#5f5aa2] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4e4a8a] transition-all shadow-lg shadow-indigo-100 cursor-pointer"
              >
                ตรวจสอบข้อมูลต้นฉบับ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
