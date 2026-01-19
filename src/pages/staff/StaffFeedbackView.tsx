import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Calendar,
  MapPin,
  Maximize2,
  X,
  Filter,
  Inbox
} from "lucide-react";

interface FeedbackItem {
  id: number;
  facility: string;
  problems: string;
  image_url: string;
  created_at: string;
}

const FACILITY_NAMES: Record<string, string> = {
  all: "ทั้งหมด",
  outdoor: "สนามกลางแจ้ง",
  badminton: "สนามแบดมินตัน",
  track: "สนามลู่-ลาน",
  pool: "สระว่ายน้ำ",
};

export default function StaffFeedbackView() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff/feedbacks`);
      const data = await res.json();
      if (data.ok) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredData = filter === "all"
    ? feedbacks
    : feedbacks.filter(item => item.facility === filter);

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* Header & Filter Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-3xl border border-border-main shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-text-main flex items-center gap-2">
              <MessageSquare className="text-primary" />
              ความคิดเห็นและหลักฐานการใช้งาน
            </h1>
            <p className="text-text-muted text-sm">ตรวจสอบปัญหาและรูปภาพใบลงทะเบียนจากผู้ใช้</p>
          </div>

          <div className="flex items-center gap-2 bg-bg-main p-1.5 rounded-2xl border border-border-main w-full md:w-auto overflow-x-auto">
            <Filter size={16} className="ml-2 text-text-muted shrink-0" />
            {Object.entries(FACILITY_NAMES).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filter === key
                    ? "bg-primary text-white shadow-md"
                    : "text-text-muted hover:text-text-main hover:bg-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </header>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-20 font-bold text-text-muted">กำลังโหลดข้อมูล...</div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-surface rounded-[40px] border-2 border-dashed border-border-main">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Inbox size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-muted">ไม่พบข้อมูลฟีดแบ็ก</h3>
            <p className="text-sm text-gray-400">ยังไม่มีการส่งฟีดแบ็กในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <article
                key={item.id}
                className="group bg-surface rounded-3xl border border-border-main shadow-sm hover:shadow-xl hover:border-primary/30 transition-all overflow-hidden flex flex-col"
              >
                {/* Image Preview Area */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url || "https://via.placeholder.com/400x225?text=No+Image"}
                    alt="Proof"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setSelectedImage(item.image_url)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30">
                      <Maximize2 size={24} />
                    </div>
                  </button>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-primary shadow-sm">
                    ID: #{item.id}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6 space-y-4 flex-1 flex flex-col text-sm text-text-main">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <MapPin size={14} />
                      {FACILITY_NAMES[item.facility] || item.facility}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-medium">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString("th-TH", { day: '2-digit', month: 'short', year: '2-digit' })}
                    </div>
                  </div>

                  <div className="bg-bg-main p-4 rounded-2xl border border-border-main flex-1">
                    <p className="italic leading-relaxed">
                      {item.problems || "— ไม่มีรายละเอียดเพิ่มเติม —"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[2000] flex items-center justify-center p-4 md:p-10 animate-in zoom-in-95 duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full proof"
            className="max-w-full max-h-full rounded-2xl shadow-2xl border-2 border-white/10"
          />
        </div>
      )}
    </div>
  );
}
