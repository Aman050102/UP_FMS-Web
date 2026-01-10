import React, { useState, useEffect, useMemo } from "react";
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
import { ChevronDown, Printer } from "lucide-react";
import "../../styles/checkin_report.css";

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
  Filler,
);

// --- Types ---
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
  purple50: "rgba(93,75,156,.45)",
  gold: "#C8A44D",
  gold50: "rgba(200,164,77,.45)",
  cyan: "#5FA3B4",
  cyan50: "rgba(95,163,180,.45)",
};

export default function CheckinReportPage() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  // --- States ---
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

  // --- Data Fetching ---
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
  }, [dateFrom, dateTo, facilityFilter]);

  // --- Logic & Calculations ---
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

  // --- Chart Data Preparation ---
  const chartData = useMemo(() => {
    if (viewMode === "pie") {
      if (facilityFilter === "all") {
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
              borderColor: "#201936",
              borderWidth: 2,
            },
          ],
        };
      } else {
        const studentSum = filteredRows.reduce(
          (a, b) => a + b.student_count,
          0,
        );
        const staffSum = filteredRows.reduce((a, b) => a + b.staff_count, 0);
        return {
          labels: ["นิสิต", "บุคลากร"],
          datasets: [
            {
              data: [studentSum, staffSum],
              backgroundColor: [PALETTE.purple, PALETTE.gold],
              borderColor: "#201936",
              borderWidth: 2,
            },
          ],
        };
      }
    }
    // Bar and Line logic would follow similar tallying patterns as your original JS
    return { labels: [], datasets: [] };
  }, [viewMode, facilityFilter, summary, filteredRows]);

  return (
    <main className="checkin-report-wrap" data-page="checkin-report">
      <section className="card">
        <div className="toolbar">
          <div className="input-group">
            <label>ช่วงวันที่:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span>-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>สนาม:</label>
            <input
              type="text"
              placeholder="ค้นหาชื่อสนาม"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chips">
            {["all", "outdoor", "badminton", "track", "pool"].map((key) => (
              <button
                key={key}
                className={`chip ${facilityFilter === key ? "selected" : ""}`}
                onClick={() => setFacilityFilter(key)}
                data-k={key}
              >
                <small>
                  {key === "all" ? "ทั้งหมด" : FAC_NAME[key] || key}
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-actions">
            <div className="view-toggle">
              {(["pie", "bar", "line"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`btn btn-outline ${viewMode === mode ? "active" : ""}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "pie"
                    ? "กราฟวงกลม"
                    : mode === "bar"
                      ? "กราฟแท่ง"
                      : "กราฟเส้น"}
                </button>
              ))}
            </div>
            <button
              className="btn btn-lg btn-primary"
              onClick={() => window.print()}
            >
              <Printer size={18} /> พิมพ์รายงาน (PDF)
            </button>
          </div>

          <div className="chart-wrap">
            <div style={{ width: "400px", height: "400px" }}>
              {viewMode === "pie" && (
                <Doughnut data={chartData} options={{ cutout: "50%" }} />
              )}
              {viewMode === "bar" && <Bar data={chartData} />}
              {viewMode === "line" && <Line data={chartData} />}
            </div>
          </div>
        </div>
      </section>

      <section className="bigbox">
        สนามทั้งหมด <b>{summary.total.toLocaleString()}</b>
      </section>

      <section className="card stats">
        <div className="stat">
          <small>รวมรายการ</small>
          <b>{summary.total}</b>
        </div>
        <div className="stat" style={{ color: "var(--outdoor)" }}>
          <small>กลางแจ้ง</small>
          <b>{summary.outdoor}</b>
        </div>
        <div className="stat" style={{ color: "var(--badminton)" }}>
          <small>แบดมินตัน</small>
          <b>{summary.badminton}</b>
        </div>
        <div className="stat" style={{ color: "var(--pool)" }}>
          <small>สระว่ายน้ำ</small>
          <b>{summary.pool}</b>
        </div>
        <div className="stat" style={{ color: "var(--track)" }}>
          <small>ลู่-ลาน</small>
          <b>{summary.track}</b>
        </div>
      </section>

      <section className="card table-card">
        <div className="table-headband">
          รายการผู้เข้าใช้สนาม ({filteredRows.length} รายการ)
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เวลา</th>
                <th>วันที่</th>
                <th>สนาม</th>
                <th>สนามย่อย</th>
                <th>นิสิต</th>
                <th>บุคลากร</th>
                <th style={{ textAlign: "right" }}>รวม</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, i) => (
                <tr key={i}>
                  <td>
                    {new Date(r.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{r.session_date}</td>
                  <td>{FAC_NAME[r.facility] || r.facility}</td>
                  <td>{r.sub_facility || "-"}</td>
                  <td>{r.student_count}</td>
                  <td>{r.staff_count}</td>
                  <td className="text-primary-700">
                    {r.student_count + r.staff_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
