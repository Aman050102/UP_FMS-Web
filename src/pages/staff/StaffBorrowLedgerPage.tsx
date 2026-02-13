import { useState, useEffect, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Search, Calendar, Package, Clock, TrendingUp, Filter, BarChart3, PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

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
      const statsRes = await fetch(`${API}/api/equipment/stats?${params}`);
      const statsData = await statsRes.json();

      const historyRes = await fetch(`${API}/api/equipment/history-range?${params}`);
      const historyData = await historyRes.json();

      if (statsData.ok) {
        setStats(statsData.rows || []);
        setTotalBorrow(statsData.total || 0);
      }
      if (historyData.ok) {
        setRecords(historyData.rows || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => (r.student_id || "").toLowerCase().includes(studentSearch.toLowerCase()));
  }, [records, studentSearch]);

  const chartData = {
    labels: stats.length > 0 ? stats.map((s) => s.equipment) : ["ไม่มีข้อมูล"],
    datasets: [{
      label: "จำนวน (ชิ้น)",
      data: stats.length > 0 ? stats.map((s) => s.qty) : [0],
      backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#64748b"],
      hoverOffset: 20
    }]
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-kanit p-4 md:p-8 space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[300px] grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> เริ่มต้น</span>
              <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> สิ้นสุด</span>
              <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Search size={12} /> ค้นหารหัส</span>
            <input type="text" placeholder="รหัสนิสิต..." className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
          </div>
          <button onClick={fetchData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
            <Filter size={16} /> {loading ? "..." : "กรองข้อมูล"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">สถิติอุปกรณ์</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('pie')} className={`p-2 rounded ${viewMode === 'pie' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><PieChart size={16} /></button>
              <button onClick={() => setViewMode('bar')} className={`p-2 rounded ${viewMode === 'bar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><BarChart3 size={16} /></button>
            </div>
          </div>
          <div className="max-w-[350px] mx-auto">
            {viewMode === "pie" ? <Doughnut data={chartData} options={{ cutout: '70%' }} /> : <Bar data={chartData} />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={24} className="mb-4 opacity-50" />
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">ยืมรวมในช่วงนี้</span>
            <div className="text-6xl font-black mt-1">{totalBorrow.toLocaleString()} <span className="text-lg font-normal opacity-60">ชิ้น</span></div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Package size={18} className="text-indigo-600" /> ยอดนิยม</h4>
            <div className="space-y-3">
              {stats.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-600">{idx + 1}. {item.equipment}</span>
                  <span className="text-sm font-black text-indigo-600">{item.qty} ชิ้น</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} /> ประวัติการทำรายการ</h3>
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">{filteredRecords.length} รายการ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 bg-slate-50/30">
              <tr>
                <th className="p-4 font-bold">วัน-เวลา</th>
                <th className="p-4 font-bold">ผู้ทำรายการ</th>
                <th className="p-4 font-bold">อุปกรณ์</th>
                <th className="p-4 font-bold text-center">ประเภท</th>
                <th className="p-4 font-bold text-right">จำนวน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-400">
                    {r.created_at ? new Date(r.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                  </td>
                  <td className="p-4 font-bold text-slate-700">{r.student_id} <small className="block font-normal text-slate-400 text-[10px]">{r.faculty}</small></td>
                  <td className="p-4 font-medium">{r.equipment}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${r.action === 'stat' ? 'bg-blue-100 text-blue-600' :
                        r.action === 'return' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {r.action === 'stat' ? 'สถิติ' : r.action === 'return' ? 'คืนแล้ว' : 'กำลังยืม'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-indigo-600">{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
