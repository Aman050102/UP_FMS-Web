import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Printer,
  Search,
  Calendar,
  Users,
  Table as TableIcon,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

interface CheckinRow {
  id: number;
  session_date: string;
  facility: string;
  sub_facility: string;
  student_count: number;
  staff_count: number;
}

const FAC_NAME: Record<string, string> = {
  outdoor: "สนามกลางแจ้ง",
  badminton: "สนามแบดมินตัน",
  pool: "สระว่ายน้ำ",
  track: "ลู่และลาน",
};

export default function CheckinReportPage() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  // State
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
  });
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pie" | "bar" | "line">("pie");
  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchCheckins = async () => {
      setIsLoading(true);
      const qs = new URLSearchParams({
        from: dateFrom,
        to: dateTo,
        facility: facilityFilter === "all" ? "" : facilityFilter,
      });

      try {
        const res = await fetch(`${API_BASE}/api/admin/checkins?${qs}`);
        const result = await res.json();

        // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมาจาก Hono + Drizzle
        const actualData = Array.isArray(result) ? result : result.data || [];

        setRows(
          actualData.map((r: any) => ({
            ...r,
            student_count: Number(r.student_count || 0),
            staff_count: Number(r.staff_count || 0),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheckins();
  }, [dateFrom, dateTo, facilityFilter, API_BASE]);

  // Search Logic
  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        FAC_NAME[r.facility]?.includes(searchQuery) ||
        r.sub_facility?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  // Statistics Calculation
  const summary = useMemo(() => {
    const counts = { outdoor: 0, badminton: 0, pool: 0, track: 0, total: 0 };
    rows.forEach((r) => {
      const sum = r.student_count + r.staff_count;
      if (counts.hasOwnProperty(r.facility)) {
        (counts as any)[r.facility] += sum;
        counts.total += sum;
      }
    });
    return counts;
  }, [rows]);

  // Chart Data Configuration
  const chartData = useMemo(() => {
    const labels = Object.values(FAC_NAME);
    const dataValues = [summary.outdoor, summary.badminton, summary.pool, summary.track];
    const colors = ["#2e7d32", "#1565c0", "#0f766e", "#ef6c00"];

    if (viewMode === "line") {
      // สำหรับ Line Chart แสดงแนวโน้มรายวัน (Group by date)
      const dateMap: Record<string, number> = {};
      rows.forEach(r => {
        dateMap[r.session_date] = (dateMap[r.session_date] || 0) + (r.student_count + r.staff_count);
      });
      const sortedDates = Object.keys(dateMap).sort();
      return {
        labels: sortedDates,
        datasets: [{
          label: "จำนวนผู้ใช้รวม",
          data: sortedDates.map(d => dateMap[d]),
          borderColor: "#5D4B9C",
          backgroundColor: "rgba(93, 75, 156, 0.1)",
          fill: true,
          tension: 0.4,
        }]
      };
    }

    return {
      labels,
      datasets: [
        {
          label: "จำนวนคน",
          data: dataValues,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [viewMode, summary, rows]);

  return (
    <main className="min-h-screen bg-[#F1F5F9] font-kanit p-4 md:p-8 space-y-6">
      {/* Filters Area */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Calendar size={14} /> ช่วงวันที่รายงาน
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Search size={14} /> กรองข้อมูลสนาม
            </label>
            <input
              type="text"
              placeholder="ค้นหาชื่อสนามหรือสนามย่อย..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content: Chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center relative">
          <div className="w-full flex justify-between items-center mb-8 no-print">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(["pie", "bar", "line"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "pie" ? "วงกลม" : mode === "bar" ? "แท่ง" : "เส้น"}
                </button>
              ))}
            </div>

          </div>

          <div className="w-full max-w-[500px] min-h-[300px] relative flex items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse text-slate-300 font-bold">กำลังโหลดข้อมูล...</div>
            ) : (
              <>
                {viewMode === "pie" && (
                  <div className="w-full max-w-[380px] relative">
                    <Doughnut
                      data={chartData}
                      options={{
                        cutout: "75%",
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                      <span className="text-5xl font-black text-slate-800">{summary.total.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Users</span>
                    </div>
                  </div>
                )}
                {viewMode === "bar" && <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />}
                {viewMode === "line" && <Line data={chartData} />}
              </>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">ยอดเข้าใช้สะสม</span>
            <div className="text-6xl font-black mt-2 leading-none">
              {summary.total.toLocaleString()}
            </div>
            <p className="mt-4 text-xs opacity-70 font-medium">กองกิจการนิสิต มหาวิทยาลัยพะเยา</p>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-2 gap-4">
            {Object.entries(FAC_NAME).map(([key, name]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{name}</span>
                <div className="text-2xl font-black text-indigo-600 group-hover:scale-110 transition-transform origin-left">
                  {(summary as any)[key].toLocaleString()}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Data Table Area */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TableIcon size={18} className="text-indigo-600" /> รายละเอียดข้อมูลดิบ
          </h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {filteredRows.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="p-4 font-bold">วันที่</th>
                <th className="p-4 font-bold">สนามหลัก</th>
                <th className="p-4 font-bold">สนามย่อย</th>
                <th className="p-4 font-bold text-center">นิสิต</th>
                <th className="p-4 font-bold text-center">บุคลากร</th>
                <th className="p-4 font-bold text-right">รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.length > 0 ? (
                filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-medium text-slate-600">{r.session_date}</td>
                    <td className="p-4 font-bold text-indigo-600">{FAC_NAME[r.facility] || r.facility}</td>
                    <td className="p-4 text-slate-500">{r.sub_facility || "-"}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{r.student_count}</td>
                    <td className="p-4 text-center font-bold text-slate-700">{r.staff_count}</td>
                    <td className="p-4 text-right font-black text-indigo-600">{r.student_count + r.staff_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">ไม่พบข้อมูลในช่วงเวลาที่เลือก</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
          section { border: 1px solid #eee !important; box-shadow: none !important; border-radius: 12px !important; }
        }
      `}</style>
    </main>
  );
}
