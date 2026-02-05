import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Printer, Search, Calendar, Package, Users, Clock, CheckCircle2, TrendingUp, Filter,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API = (
  import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

export default function StaffBorrowReportPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [studentSearch, setStudentSearch] = useState("");
  const [viewMode, setViewMode] = useState<"pie" | "bar">("pie");

  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<{ equipment: string; qty: number }[]>([]);
  const [totalBorrow, setTotalBorrow] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo });

      // 1. ดึงสถิติสรุป (Stats)
      const statsRes = await fetch(`${API}/api/equipment/stats?${params}`);
      const statsData = await statsRes.json();

      // 2. ดึงประวัติรายการทั้งหมด (Ledger)
      const historyRes = await fetch(`${API}/api/staff/borrow-records`);
      const historyData = await historyRes.json();

      if (statsData.ok) {
        // ✅ ปรับปรุง: บังคับให้เป็น Number เพื่อให้กราฟแสดงผลได้
        const formattedStats = (statsData.rows || []).map((item: any) => ({
          equipment: item.equipment,
          qty: Number(item.qty) || 0
        }));
        setStats(formattedStats);
        setTotalBorrow(Number(statsData.total) || 0);
      }

      if (historyData.ok && historyData.days?.[0]?.rows) {
        const allRows = historyData.days[0].rows.filter((r: any) => {
          const rowDate = r.created_at?.split("T")[0];
          return rowDate >= dateFrom && rowDate <= dateTo;
        });
        setRecords(allRows);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.student_id?.includes(studentSearch));
  }, [records, studentSearch]);

  const chartData = useMemo(() => {
    // ✅ ปรับปรุง: ถ้าไม่มีข้อมูลให้แสดงค่าว่างเพื่อป้องกันกราฟค้าง
    const labels = stats.length > 0 ? stats.map((s) => s.equipment) : ["ไม่มีข้อมูล"];
    const data = stats.length > 0 ? stats.map((s) => s.qty) : [0];

    return {
      labels,
      datasets: [
        {
          label: "จำนวนชิ้นที่ยืม",
          data: data,
          backgroundColor: ["#5D4B9C", "#C8A44D", "#2e7d32", "#1565c0", "#ef6c00", "#701a75", "#94a3b8"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [stats]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-kanit p-4 md:p-8 space-y-6">
      {/* 1. Toolbar & Filters */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={14} /> ช่วงวันที่รายงาน
            </label>
            <div className="flex items-center gap-2">
              <input type="date" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className="text-slate-300">ถึง</span>
              <input type="date" className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Search size={14} /> ค้นหารหัสนิสิต
            </label>
            <input type="text" placeholder="ระบุรหัสนิสิตเพื่อกรองตาราง..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg active:scale-95 disabled:opacity-50" onClick={fetchData} disabled={loading}>
            <Filter size={18} /> {loading ? "กำลังโหลด..." : "อัปเดตข้อมูล"}
          </button>
        </div>
      </section>

      {/* 2. Charts & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-10 no-print">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(["pie", "bar"] as const).map((mode) => (
                <button key={mode} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`} onClick={() => setViewMode(mode)}>
                  {mode === "pie" ? "สัดส่วนอุปกรณ์" : "กราฟแท่งเปรียบเทียบ"}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[420px] aspect-square relative flex items-center justify-center">
            {viewMode === "pie" ? (
              <>
                <Doughnut data={chartData} options={{ cutout: "75%", plugins: { legend: { position: "bottom" } } }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                  <span className="text-6xl font-black text-slate-800 leading-none">{totalBorrow.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Total Items</span>
                </div>
              </>
            ) : (
              <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <TrendingUp size={32} className="mb-4 opacity-50" />
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">ยืมอุปกรณ์รวมทั้งหมด</span>
            <div className="text-7xl font-black mt-2 leading-none">{totalBorrow.toLocaleString()}<span className="text-xl ml-2 opacity-60">ชิ้น</span></div>
            <p className="mt-6 text-[10px] opacity-70 font-medium border-t border-white/20 pt-4">สถิติสะสมตามช่วงเวลาที่กำหนด</p>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><Package size={18} className="text-indigo-600" /> อุปกรณ์ยอดนิยม</h4>
            <div className="space-y-4">
              {stats.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{i + 1}. {s.equipment}</span>
                  <span className="text-sm font-black text-indigo-600">{s.qty.toLocaleString()} ครั้ง</span>
                </div>
              ))}
              {stats.length === 0 && <p className="text-center text-slate-400 text-sm py-4 italic">ไม่พบข้อมูล</p>}
            </div>
          </section>
        </div>
      </div>

      {/* 3. Detailed Data Table */}
      <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base"><Clock size={18} className="text-indigo-600" /> ตารางประวัติการทำรายการ</h3>
          <span className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-full uppercase">{filteredRecords.length} Items Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50/30">
                <th className="p-5 font-bold">วัน-เวลา</th>
                <th className="p-5 font-bold">ผู้ทำรายการ</th>
                <th className="p-5 font-bold">รายการอุปกรณ์</th>
                <th className="p-5 font-bold text-center">สถานะ</th>
                <th className="p-5 font-bold text-right">จำนวน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 text-slate-400 font-medium">{r.created_at?.replace('T', ' ').slice(0, 16)}</td>
                  <td className="p-5"><div className="flex flex-col"><span className="font-bold text-slate-700">{r.student_id}</span><span className="text-[10px] text-slate-400">{r.faculty}</span></div></td>
                  <td className="p-5"><div className="flex items-center gap-2"><Package size={14} className="text-indigo-400" /><span className="font-bold text-slate-800">{r.equipment}</span></div></td>
                  <td className="p-5 text-center">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full mx-auto text-[10px] font-black uppercase tracking-widest ${r.action === "return" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {r.action === "return" ? <CheckCircle2 size={12} /> : "●"} {r.action === "return" ? "คืนแล้ว" : "กำลังยืม"}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-indigo-600 text-lg">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </main>
  );
}

function UsersIcon({ size, className }: { size: number; className?: string }) {
  return <Users size={size} className={className} />;
}
