import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import HeaderStaff from "../../components/HeaderStaff";
import "../../styles/staff_ledger.css";

const BACKEND: string = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";
const API_RECORDS = `${BACKEND}/api/staff/borrow-records/`;

interface LedgerRow {
  id: number;
  time: string;
  student_id: string;
  faculty: string;
  equipment: string;
  action: "borrow" | "return";
  qty: number;
}

interface LedgerDay {
  date: string;
  rows: LedgerRow[];
}

export default function StaffBorrowLedgerPage() {
  const [displayName] = useState(localStorage.getItem("display_name") || "เจ้าหน้าที่");
  const [studentId, setStudentId] = useState("");
  const [datePick, setDatePick] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState<LedgerDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-page", "staff-borrow-ledger");
    fetchRecords();
    return () => document.body.removeAttribute("data-page");
  }, [datePick]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: datePick });
      if (studentId.trim()) params.append("student_id", studentId.trim());

      const res = await fetch(`${API_RECORDS}?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.ok) setDays(data.days || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="staff-ledger-page">
      <HeaderStaff displayName={displayName} BACKEND={BACKEND} />
      <main className="wrap">
        <nav className="mainmenu">
          <ul>
            <li><Link className="tab" to="/staff/equipment">จัดการอุปกรณ์กีฬา</Link></li>
            <li><Link className="tab active" to="/staff/borrow-ledger">✓ บันทึกการยืม-คืน</Link></li>
          </ul>
        </nav>

        <h1 className="page-title">ประวัติการยืม–คืนอุปกรณ์</h1>

        <div className="filter-row">
          <label className="fld">
            <span>รหัสนิสิต</span>
            <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="ค้นหารหัสนิสิต..." />
          </label>
          <label className="fld">
            <span>เลือกวันที่</span>
            <input type="date" value={datePick} onChange={e => setDatePick(e.target.value)} />
          </label>
          <button className="btn primary" onClick={fetchRecords}>ค้นหาข้อมูล</button>
        </div>

        <section className="panel">
          {loading ? (
            <div className="empty">กำลังโหลดข้อมูล...</div>
          ) : days.length === 0 ? (
            <div className="empty">ไม่พบประวัติการทำรายการในวันที่เลือก</div>
          ) : (
            days.map((day, idx) => (
              <article key={idx} className="day-card">
                <header className="day-title">
                  <div className="date">รายการวันที่ {day.date}</div>
                  <div className="count">ทั้งหมด {day.rows.length} รายการ</div>
                </header>
                <div className="table-wrap">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>เวลา</th>
                        <th>รหัสนิสิต</th>
                        <th>คณะ/หน่วยงาน</th>
                        <th>อุปกรณ์</th>
                        <th>ประเภท</th>
                        <th>จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.rows.map(row => (
                        <tr key={row.id}>
                          <td><span className="time-badge">{row.time}</span></td>
                          <td><strong>{row.student_id}</strong></td>
                          <td className="fac">{row.faculty}</td>
                          <td>{row.equipment}</td>
                          <td>
                            <span className={row.action === "return" ? "status-return" : "status-borrow"}>
                              {row.action === "return" ? "🟢 คืน" : "🟠 ยืม"}
                            </span>
                          </td>
                          <td>{row.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
