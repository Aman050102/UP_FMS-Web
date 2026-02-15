import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Calendar,
  MapPin,
  Maximize2,
  X,
  Filter,
  Inbox,
  Image as ImageIcon,
  ChevronRight,
  ClipboardCheck,
  Search,
} from "lucide-react";

interface FeedbackItem {
  id: number;
  facility: string;
  problems: string;
  image_url: string;
  created_at: string;
}

const FACILITY_NAMES: Record<string, string> = {
  all: "ทุกสนาม",
  outdoor: "สนามกลางแจ้ง",
  badminton: "สนามแบดมินตัน",
  track: "สนามลู่-ลาน",
  pool: "สระว่ายน้ำ",
};

export default function StaffFeedbackView() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchDate, setSearchDate] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://up-fms-api-hono.aman02012548.workers.dev"
  ).replace(/\/$/, "");

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

  // กรองข้อมูลตามสถานที่ และ วันที่
  const filteredData = useMemo(() => {
    return feedbacks.filter((item) => {
      // เงื่อนไขสถานที่
      const matchFacility = filter === "all" || item.facility === filter;

      // เงื่อนไขวันที่ (ตัดเอาเฉพาะ YYYY-MM-DD จาก ISO string มาเทียบ)
      const itemDate = item.created_at.split("T")[0];
      const matchDate = searchDate === "" || itemDate === searchDate;

      return matchFacility && matchDate;
    });
  }, [feedbacks, filter, searchDate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-kanit p-6 md:p-10 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* 1. Official Header */}
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <ClipboardCheck className="text-primary" size={28} />
                บันทึกข้อร้องเรียนและรายงานการใช้งาน
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                ส่วนตรวจสอบหลักฐานภาพถ่ายและความคิดเห็นจากผู้ใช้บริการ
              </p>
            </div>
          </div>

          {/* ฟิลเตอร์ควบคุม */}
          <div className="flex flex-wrap items-center gap-4">
            {/* กรองตามสถานที่ */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <div className="px-3 text-slate-400 border-r border-slate-100">
                <Filter size={14} />
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(FACILITY_NAMES).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filter === key
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-slate-500 hover:text-primary hover:bg-slate-50"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* ค้นหาตามวันที่ */}
            <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer w-full"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate("")}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 2. List Content */}
        {loading ? (
          <div className="text-center py-24 text-slate-400 font-bold animate-pulse">
            กำลังเรียกข้อมูลเอกสาร...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Inbox size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">
              ไม่พบรายการบันทึก{" "}
              {searchDate &&
                `ในวันที่ ${new Date(searchDate).toLocaleDateString("th-TH")}`}
            </h3>
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="mt-4 text-primary text-sm font-bold hover:underline"
              >
                ล้างการค้นหาตามวันที่
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] uppercase tracking-widest text-slate-500 font-black border-b border-slate-200">
                    <th className="px-6 py-4 w-24">ID</th>
                    <th className="px-6 py-4 w-48">วันที่รายงาน</th>
                    <th className="px-6 py-4 w-48">สถานที่/สนาม</th>
                    <th className="px-6 py-4">รายละเอียดปัญหา</th>
                    <th className="px-6 py-4 text-center w-32">ภาพหลักฐาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 font-mono text-xs text-slate-400">
                        #{item.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(item.created_at).toLocaleDateString(
                              "th-TH",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            เวลา{" "}
                            {new Date(item.created_at).toLocaleTimeString(
                              "th-TH",
                              { hour: "2-digit", minute: "2-digit" },
                            )}{" "}
                            น.
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          <MapPin size={10} />
                          {FACILITY_NAMES[item.facility] || item.facility}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md italic">
                          "{item.problems || "ไม่ระบุรายละเอียด"}"
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setSelectedImage(item.image_url)}
                            className="relative w-16 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                          >
                            <img
                              src={item.image_url}
                              alt="Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                              <Maximize2 size={12} />
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                End of Report — Total {filteredData.length} records
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold text-sm hover:opacity-70 transition-opacity">
              <X size={24} /> ปิดหน้าต่าง
            </button>
            <img
              src={selectedImage}
              alt="Full proof"
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border border-white/20 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
