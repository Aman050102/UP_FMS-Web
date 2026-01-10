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
import { Calendar, Download, Package } from "lucide-react"; // เปลี่ยนเป็นไอคอน Download
import "../../styles/borrow_stats.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

export default function StaffBorrowStats() {
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [dateTo, setDateTo] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  );
  const [rows, setRows] = useState<{ equipment: string; qty: number }[]>([]);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL ||
        "https://up-fms-api-hono.aman02012548.workers.dev";
      const res = await fetch(
        `${API_BASE}/api/staff/borrow-records/stats?from=${dateFrom}&to=${dateTo}&action=borrow`,
      );
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

  // --- ฟังก์ชันดาวน์โหลด Excel (CSV) ---
  const handleDownloadExcel = () => {
    if (rows.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการดาวน์โหลด");
      return;
    }

    // สร้าง Header และเนื้อหา CSV
    const header = ["ลำดับ", "รายการอุปกรณ์", "จำนวนครั้งที่ยืม"];
    const csvContent = [
      header.join(","), // บรรทัดหัวตาราง
      ...rows.map((r, i) => `${i + 1},${r.equipment},${r.qty}`), // ข้อมูลในตาราง
      `,รวมทั้งสิ้น,${total}`, // บรรทัดสรุปผล
    ].join("\n");

    // สร้าง Blob และ Link สำหรับดาวน์โหลด
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // ตั้งชื่อไฟล์ตามวันที่ ปี-เดือน (เช่น report_2026-01-01_to_2026-01-31.csv)
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `equipment_report_${dateFrom}_to_${dateTo}.csv`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = {
    labels: rows.length > 0 ? rows.map((r) => r.equipment) : ["No Data"],
    datasets: [
      {
        data: rows.length > 0 ? rows.map((r) => r.qty) : [1],
        backgroundColor:
          rows.length > 0
            ? ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"]
            : ["#f1f5f9"],
        hoverOffset: 20,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="stats-container">
      <div className="stats-glass-wrapper">
        {/* Header Section */}
        <header className="stats-header-minimal no-print">
          <div className="brand-badge">
            <Package size={16} />
            <span>Equipment Insights</span>
          </div>
          <div className="header-actions">
            <div className="input-with-icon">
              <Calendar size={14} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="to-txt">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {/* เปลี่ยนเป็นปุ่มดาวน์โหลด */}
            <button
              onClick={handleDownloadExcel}
              className="btn-icon-round"
              title="Download Excel"
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        <main className="stats-grid">
          {/* Chart Section */}
          <section className="chart-wrapper">
            <div className="doughnut-focus">
              <Doughnut
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  cutout: "82%",
                  plugins: { legend: { display: false } },
                }}
              />
              <div className="center-stats">
                <span className="total-val">{total.toLocaleString()}</span>
                <span className="total-lbl">Total Borrows</span>
              </div>
            </div>
            <div className="chart-legend-grid">
              {rows.map((r, i) => (
                <div key={i} className="legend-item-min">
                  <span
                    className="dot"
                    style={{
                      backgroundColor: chartData.datasets[0].backgroundColor[
                        i
                      ] as string,
                    }}
                  ></span>
                  <span className="label">{r.equipment}</span>
                  <span className="val">{r.qty}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Table Section */}
          <section className="table-wrapper">
            <h3 className="sub-title">Detailed Report</h3>
            <table className="stats-table-min">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th className="align-right">Usage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.equipment}</td>
                    <td className="align-right">{r.qty.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="summary-banner">
              <span>สรุปยอดรวมทั้งสิ้น</span>
              <strong>{total.toLocaleString()} รายการ</strong>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
