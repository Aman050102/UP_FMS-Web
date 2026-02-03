import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Printer,
  Search,
  Calendar,
  Package,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Filter,
} from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

export default function StaffBorrowReportPage() {
  // States สำหรับ Filter
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
  const [studentSearch, setStudentSearch] = useState("");
  const [viewMode, setViewMode] = useState<"pie" | "bar">("pie");

  // States สำหรับ Data
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<{ equipment: string; qty: number }[]>([]);
  const [totalBorrow, setTotalBorrow] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch ข้อมูลทั้ง Ledger และ Stats
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลสถิติ (Stats)
      const statsRes = await fetch(
        `${API}/api/staff/borrow-records/stats?from=${dateFrom}&to=${dateTo}&action=borrow`,
      );
      const statsData = await statsRes.json();

      // 2. ดึงข้อมูลบันทึกทั้งหมด (Ledger) ในช่วงวันที่เลือก
      // หมายเหตุ: ปรับ API ให้รองรับช่วงวันที่ หรือดึงข้อมูลมา Filter เอง
      const ledgerRes = await fetch(
        `${API}/api/staff/borrow-records/?date=${dateTo}`,
      ); // ตัวอย่างดึงวันล่าสุด
      const ledgerData = await ledgerRes.json();

      if (statsData.ok) {
        setStats(statsData.rows || []);
        setTotalBorrow(statsData.total || 0);
      }
      if (ledgerData.ok) {
        // รวม rows จากทุกวันใน response (ถ้ามีหลายวัน)
        const allRows = ledgerData.days.flatMap((d: any) => d.rows);
        setRecords(allRows);
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

  // กรองข้อมูลในตารางตามรหัสนิสิต
  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.student_id.includes(studentSearch));
  }, [records, studentSearch]);

  const chartData = useMemo(
    () => ({
      labels: stats.map((s) => s.equipment),
      datasets: [
        {
          label: "จำนวนครั้งที่ยืม",
          data: stats.map((s) => s.qty),
          backgroundColor: [
            "#5D4B9C",
            "#C8A44D",
            "#2e7d32",
            "#1565c0",
            "#ef6c00",
            "#701a75",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }),
    [stats],
  );

  return (
    <main className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 space-y-6">
      {/* 1. Toolbar & Filters (แบบเดียวกับหน้าเข้าสนาม) */}
      <section className="bg-surface rounded-3xl border border-border-main p-6 shadow-sm no-print">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Calendar size={14} /> ช่วงวันที่วิเคราะห์
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="p-2.5 bg-bg-main border border-border-main rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-text-muted">-</span>
              <input
                type="date"
                className="p-2.5 bg-bg-main border border-border-main rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-text-muted flex items-center gap-1">
              <Search size={14} /> ค้นหารหัสนิสิตในตาราง
            </label>
            <input
              type="text"
              placeholder="ระบุรหัสนิสิต..."
              className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-text-main text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all cursor-pointer shadow-lg active:scale-95"
            onClick={fetchData}
          >
            {loading ? (
              "กำลังโหลด..."
            ) : (
              <>
                <Filter size={18} /> อัปเดตข้อมูล
              </>
            )}
          </button>
        </div>
      </section>

      {/* 2. Charts & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Unit */}
        <section className="lg:col-span-2 bg-surface rounded-3xl border border-border-main p-8 shadow-sm flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8 no-print">
            <div className="flex bg-bg-main p-1 rounded-xl border border-border-main">
              {["pie", "bar"].map((mode) => (
                <button
                  key={mode}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === mode ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main"}`}
                  onClick={() => setViewMode(mode as any)}
                >
                  {mode === "pie" ? "สัดส่วนการยืม" : "กราฟแท่ง"}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 border border-border-main rounded-xl font-bold text-sm hover:bg-bg-main transition-all"
              onClick={() => window.print()}
            >
              <Printer size={18} /> พิมพ์รายงาน
            </button>
          </div>

          <div className="w-full max-w-[400px] aspect-square relative flex items-center justify-center">
            {viewMode === "pie" ? (
              <>
                <Doughnut
                  data={chartData}
                  options={{
                    cutout: "75%",
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                  <span className="text-5xl font-black text-text-main leading-none">
                    {totalBorrow.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">
                    Total Borrows
                  </span>
                </div>
              </>
            ) : (
              <Bar
                data={chartData}
                options={{ plugins: { legend: { display: false } } }}
              />
            )}
          </div>
        </section>

        {/* Right: Quick Stats */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-[#5D4B9C] to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-primary/20">
            <Package size={32} className="mb-4 opacity-50" />
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">
              ยืมอุปกรณ์รวมทั้งหมด
            </span>
            <div className="text-6xl font-black mt-2 leading-none">
              {totalBorrow.toLocaleString()}
            </div>
            <p className="mt-4 text-xs opacity-70 font-medium leading-relaxed">
              ข้อมูลสรุปการยืมอุปกรณ์กีฬา <br />
              ในช่วงเวลาที่ท่านกำหนด
            </p>
          </section>

          <section className="bg-surface rounded-3xl border border-border-main p-6 shadow-sm">
            <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />{" "}
              อันดับอุปกรณ์ยอดนิยม
            </h4>
            <div className="space-y-3">
              {stats.slice(0, 5).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-bg-main/50 border border-border-main/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-border-main flex items-center justify-center text-[10px] font-black">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-text-main">
                      {s.equipment}
                    </span>
                  </div>
                  <span className="text-sm font-black text-primary">
                    {s.qty} ครั้ง
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 3. Detailed Data Table (Borrow Ledger) */}
      <section className="bg-surface rounded-[32px] border border-border-main shadow-sm overflow-hidden">
        <div className="bg-bg-main px-6 py-4 border-b border-border-main flex justify-between items-center">
          <h3 className="font-bold text-text-main flex items-center gap-2">
            <Clock size={18} className="text-primary" />{" "}
            บันทึกรายการยืม-คืนอุปกรณ์ดิบ
          </h3>
          <span className="text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-full">
            {filteredRecords.length} รายการพบในระบบ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-border-main bg-gray-50/50">
                <th className="p-4 font-bold">เวลา</th>
                <th className="p-4 font-bold">รหัสนิสิต</th>
                <th className="p-4 font-bold">รายการอุปกรณ์</th>
                <th className="p-4 font-bold text-center">สถานะ</th>
                <th className="p-4 font-bold text-right">จำนวน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-bg-main/50 transition-colors group"
                  >
                    <td className="p-4 text-text-muted font-medium italic">
                      {r.time || "-"}
                    </td>
                    <td className="p-4 font-bold text-text-main">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-text-muted" />
                        {r.student_id}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Package size={14} />
                        </div>
                        <span className="font-medium text-text-main">
                          {r.equipment}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.action === "return"
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {r.action === "return" ? (
                            <>
                              <CheckCircle2 size={12} /> คืนแล้ว
                            </>
                          ) : (
                            "กำลังยืม"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-primary">
                      {r.qty}{" "}
                      <small className="text-[10px] text-text-muted font-normal ml-1">
                        ชิ้น
                      </small>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-text-muted">
                    ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
          section { border: none !important; box-shadow: none !important; border-radius: 0 !important; }
          .grid { display: block !important; }
          .lg\\:col-span-2, .lg\\:grid-cols-3 { width: 100% !important; }
        }
      `}</style>
    </main>
  );
}

// Sub-component สำหรับ Icon (ถ้าไม่ได้ import จาก lucide-react)
function User({ size, className }: { size: number; className?: string }) {
  return <Users size={size} className={className} />;
}
