import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderStaff from "../../components/HeaderStaff";
import "../../styles/equipment.css"; // ใช้ CSS ตัวเดียวกัน

const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

export default function StaffBorrowLedgerPage() {
  const [displayName] = useState(localStorage.getItem("display_name") || "เจ้าหน้าที่");
  const [studentId, setStudentId] = useState("");
  const [datePick, setDatePick] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: datePick });
      if (studentId.trim()) params.append("student_id", studentId.trim());
      const res = await fetch(`${API}/api/staff/borrow-records/?${params.toString()}`);
      const data = await res.json();
      if (data.ok) setDays(data.days || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [datePick]);

  return (
    <div className="equipment-container">
      <HeaderStaff displayName={displayName} BACKEND={API} />

      <nav className="tab-header" style={{ marginTop: '20px' }}>
        <Link to="/staff/equipment" style={{ textDecoration: 'none', color: 'inherit' }}>
            <button>จัดการอุปกรณ์</button>
        </Link>
        <Link to="/staff/borrow-ledger" className="active" style={{ textDecoration: 'none', color: 'inherit' }}>
            <button className="active">บันทึกการยืม-คืน</button>
        </Link>
      </nav>

      <div className="borrow-vertical-flow">
        <section className="panel info-section">
          <h4 className="title-sm">ตัวกรองข้อมูล</h4>
          <div className="input-row" style={{ alignItems: 'flex-end' }}>
            <div className="field-group">
                <label>ค้นหารหัสนิสิต</label>
                <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="ระบุรหัส 8 หลัก..." />
            </div>
            <div className="field-group">
                <label>ระบุวันที่</label>
                <input type="date" value={datePick} onChange={e => setDatePick(e.target.value)} />
            </div>
            <button className="btn-return-line" onClick={fetchRecords} style={{ height: '42px', padding: '0 30px' }}>ค้นหา</button>
          </div>
        </section>

        <div className="history-layout">
           {days.map((day: any) => (
             <section className="panel history-table-panel" key={day.date}>
                <h4 className="title-sm">รายการวันที่ {day.date} ({day.rows.length} รายการ)</h4>
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>เวลา</th>
                            <th>รหัสนิสิต</th>
                            <th>อุปกรณ์</th>
                            <th>ประเภท</th>
                            <th>จำนวน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {day.rows.map((row: any) => (
                            <tr key={row.id}>
                                <td>{row.time}</td>
                                <td><b>{row.student_id}</b></td>
                                <td>{row.equipment}</td>
                                <td>
                                    <span className={row.action === "return" ? "status-complete" : "txt-pending"}>
                                        {row.action === "return" ? "🟢 คืนแล้ว" : "🟠 กำลังยืม"}
                                    </span>
                                </td>
                                <td>{row.qty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </section>
           ))}
        </div>
      </div>
    </div>
  );
}
