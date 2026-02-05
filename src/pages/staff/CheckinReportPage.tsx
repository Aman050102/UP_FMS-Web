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
  FileDown,
  Table as TableIcon,
} from "lucide-react";
// เรียกใช้เครื่องมือ Export ที่สร้างไว้
import { exportToExcel, exportToPDF } from "../../utils/exportTools";

// Register Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
);

interface CheckinRow {
  ts: string;
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

const PALETTE = {
  purple: "#5D4B9C",
  gold: "#C8A44D",
};

export default function CheckinReportPage() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  });
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pie" | "bar" | "line">("pie");
  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCheckins = async () => {
      const qs = new URLSearchParams({
        from: dateFrom,
        to: dateTo,
        facility: facilityFilter === "all" ? "" : facilityFilter,
      });
      try {
        const res = await fetch(`${API_BASE}/api/admin/checkins/?${qs}`);
        const data = await res.json();
        setRows(
          data.map((r: any) => ({
            ...r,
            student_count: Number(r.student_count || 0),
            staff_count: Number(r.staff_count || 0),
          })),
        );
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchCheckins();
  }, [dateFrom, dateTo, facilityFilter, API_BASE]);

  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        FAC_NAME[r.facility]?.includes(searchQuery) ||
        r.sub_facility?.includes(searchQuery),
    );
  }, [rows, searchQuery]);

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

  const chartData = useMemo(() => {
    if (viewMode === "pie") {
      return {
        labels: Object.values(FAC_NAME),
        datasets: [
          {
            data: [
              summary.outdoor,
              summary.badminton,
              summary.pool,
              summary.track,
            ],
            backgroundColor: ["#2e7d32", "#1565c0", "#0f766e", "#ef6c00"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      };
    }
    // เพิ่ม Bar/Line Data ตามความเหมาะสม
    return { labels: [], datasets: [] };
  }, [viewMode, summary]);

  return (
    <main className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 space-y-6">
      {/* Filters Area */}
      <section className="bg-surface rounded-3xl border border-border-main p-6 shadow-sm no-print">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Calendar size={14} /> ช่วงวันที่รายงาน
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="p-2.5 bg-bg-main border border-border-main rounded-xl text-sm font-bold outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-text-muted">-</span>
              <input
                type="date"
                className="p-2.5 bg-bg-main border border-border-main rounded-xl text-sm font-bold outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Search size={14} /> กรองข้อมูลสนาม
            </label>
            <input
              type="text"
              placeholder="ค้นหาชื่อสนาม..."
              className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ปุ่ม Export ใหม่ 2 ปุ่ม */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                exportToExcel(filteredRows, summary, "รายงานการเข้าใช้สนามกีฬา")
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <TableIcon size={18} /> Excel
            </button>
            <button
              onClick={() =>
                exportToPDF(filteredRows, summary, "รายงานการเข้าใช้สนามกีฬา")
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <FileDown size={18} /> PDF
            </button>
          </div>
        </div>
      </section>

      {/* Main Content: Chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-surface rounded-3xl border border-border-main p-8 shadow-sm flex flex-col items-center relative">
          <div className="w-full flex justify-between items-center mb-8 no-print">
            <div className="flex bg-bg-main p-1 rounded-xl border border-border-main">
              {(["pie", "bar", "line"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === mode ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "pie" ? "วงกลม" : mode === "bar" ? "แท่ง" : "เส้น"}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-border-main rounded-xl text-sm font-bold hover:bg-bg-main cursor-pointer"
              onClick={() => window.print()}
            >
              <Printer size={18} /> พิมพ์หน้าเว็บ
            </button>
          </div>

          <div className="w-full max-w-[380px] aspect-square relative flex items-center justify-center">
            {viewMode === "pie" && (
              <Doughnut
                data={chartData}
                options={{
                  cutout: "70%",
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            )}
            {viewMode === "bar" && <Bar data={chartData} />}
            {viewMode === "line" && <Line data={chartData} />}

            {viewMode === "pie" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                <span className="text-5xl font-black text-text-main leading-none">
                  {summary.total.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">
                  Total Users
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-primary/20">
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">
              สรุปยอดเข้าใช้สนาม
            </span>
            <div className="text-6xl font-black mt-2 leading-none">
              {summary.total.toLocaleString()}
            </div>
            <p className="mt-4 text-xs opacity-70 font-medium">
              กองกิจการนิสิต มหาวิทยาลัยพะเยา
            </p>
          </section>

          <section className="bg-surface rounded-3xl border border-border-main p-6 shadow-sm grid grid-cols-2 gap-4">
            {Object.entries(FAC_NAME).map(([key, name]) => (
              <div
                key={key}
                className="p-4 bg-bg-main rounded-2xl border border-border-main"
              >
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {name}
                </span>
                <div className="text-2xl font-black text-primary">
                  {(summary as any)[key]}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Data Table Area */}
      <section className="bg-surface rounded-3xl border border-border-main shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-bg-main px-6 py-4 border-b border-border-main flex justify-between items-center">
          <h3 className="font-bold text-text-main flex items-center gap-2">
            <Users size={18} className="text-primary" />{" "}
            รายละเอียดข้อมูลการเข้าใช้สนาม
          </h3>
          <span className="text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-full">
            {filteredRows.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border-main bg-gray-50/50">
                <th className="p-4 font-bold">วันที่</th>
                <th className="p-4 font-bold">สนาม</th>
                <th className="p-4 font-bold">สนามย่อย</th>
                <th className="p-4 font-bold text-center">นิสิต</th>
                <th className="p-4 font-bold text-center">บุคลากร</th>
                <th className="p-4 font-bold text-right">รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {filteredRows.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-bg-main/50 transition-colors group"
                >
                  <td className="p-4 font-medium text-text-main">
                    {r.session_date}
                  </td>
                  <td className="p-4 font-bold text-primary">
                    {FAC_NAME[r.facility] || r.facility}
                  </td>
                  <td className="p-4 text-text-muted">
                    {r.sub_facility || "-"}
                  </td>
                  <td className="p-4 text-center font-bold text-text-main">
                    {r.student_count}
                  </td>
                  <td className="p-4 text-center font-bold text-text-main">
                    {r.staff_count}
                  </td>
                  <td className="p-4 text-right font-black text-primary group-hover:scale-105 transition-transform origin-right">
                    {r.student_count + r.staff_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
          section { border: none !important; box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </main>
  );
}
