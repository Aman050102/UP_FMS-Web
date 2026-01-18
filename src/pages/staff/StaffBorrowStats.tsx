import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Calendar, Download, Package, TrendingUp } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

export default function StaffBorrowStats() {
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [rows, setRows] = useState<{ equipment: string; qty: number }[]>([]);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev";
      const res = await fetch(`${API_BASE}/api/staff/borrow-records/stats?from=${dateFrom}&to=${dateTo}&action=borrow`);
      const data = await res.json();
      if (data?.ok) {
        setRows(data.rows || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const handleDownloadExcel = () => {
    if (rows.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการดาวน์โหลด");
      return;
    }
    const header = ["ลำดับ", "รายการอุปกรณ์", "จำนวนครั้งที่ยืม"];
    const csvContent = [
      header.join(","),
      ...rows.map((r, i) => `${i + 1},${r.equipment},${r.qty}`),
      `,รวมทั้งสิ้น,${total}`,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `equipment_report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = {
    labels: rows.length > 0 ? rows.map((r) => r.equipment) : ["No Data"],
    datasets: [
      {
        data: rows.length > 0 ? rows.map((r) => r.qty) : [1],
        backgroundColor: rows.length > 0
          ? ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"]
          : ["#f1f5f9"],
        hoverOffset: 20,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-4 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1000px] mx-auto bg-surface p-6 md:p-10 rounded-[32px] shadow-sm border border-border-main">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-3 bg-primary-soft text-primary px-4 py-1.5 rounded-full text-sm font-bold">
            <Package size={16} />
            <span>Equipment Insights</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center bg-bg-main px-4 py-2 rounded-xl border border-border-main text-text-muted">
              <Calendar size={14} />
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs md:text-sm font-bold text-text-main mx-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-xs px-1">to</span>
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs md:text-sm font-bold text-text-main mx-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <button
              onClick={handleDownloadExcel}
              className="w-10 h-10 rounded-full border border-border-main bg-surface flex items-center justify-center text-text-main hover:bg-text-main hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title="Download Report"
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Chart Section (3/5 columns) */}
          <section className="lg:col-span-3 space-y-8">
            <div className="relative h-[320px] w-full flex items-center justify-center">
              <Doughnut
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  cutout: "82%",
                  plugins: { legend: { display: false } },
                }}
              />
              <div className="absolute text-center">
                <span className="block text-5xl md:text-6xl font-extrabold tracking-tighter text-text-main leading-none">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[2px]">Total Borrows</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] as string }}
                  />
                  <span className="text-text-muted truncate flex-1">{r.equipment}</span>
                  <span className="font-bold text-text-main">{r.qty}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Table Section (2/5 columns) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-text-main font-bold border-b border-border-main pb-4">
              <TrendingUp size={18} className="text-primary" />
              <h3>Detailed Report</h3>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-text-muted border-b border-border-main">
                  <th className="pb-4 text-left font-bold">Equipment</th>
                  <th className="pb-4 text-right font-bold">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {rows.map((r, i) => (
                  <tr key={i} className="group hover:bg-bg-main/50 transition-colors">
                    <td className="py-4 text-text-main font-medium">{r.equipment}</td>
                    <td className="py-4 text-right font-bold text-primary">{r.qty.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 bg-gradient-to-r from-primary to-indigo-400 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-2">
              <span className="text-sm font-medium opacity-90">สรุปยอดรวมทั้งสิ้น</span>
              <strong className="text-2xl font-extrabold">{total.toLocaleString()} <small className="text-xs font-normal">รายการ</small></strong>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
