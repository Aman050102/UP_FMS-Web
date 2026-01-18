import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, ClipboardList, Clock, User, Package, CheckCircle2 } from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

export default function StaffBorrowLedgerPage() {
  const [studentId, setStudentId] = useState("");
  const [datePick, setDatePick] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: datePick });
      if (studentId.trim()) params.append("student_id", studentId.trim());
      const res = await fetch(
        `${API}/api/staff/borrow-records/?${params.toString()}`,
      );
      const data = await res.json();
      if (data.ok) setDays(data.days || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [datePick]);

  return (
    <div className="max-w-[1100px] mx-auto p-5 font-kanit animate-in fade-in duration-500">
      {/* หมายเหตุ: ลบ <HeaderStaff /> ออกแล้วเพื่อให้ใช้ร่วมกับ MainLayout ได้อย่างถูกต้อง
         ปุ่มเปิดเมนูด้านซ้ายจะกลับมาใช้งานได้ตามปกติครับ
      */}

      {/* Navigation Tabs */}
      <nav className="flex gap-4 mb-8 border-b border-border-main">
        <Link to="/staff/equipment" className="pb-3 px-2 border-b-2 border-transparent text-text-muted hover:text-text-main transition-all">
          จัดการอุปกรณ์
        </Link>
        <Link to="/staff/borrow-ledger" className="pb-3 px-2 border-b-2 border-primary text-primary font-bold transition-all">
          บันทึกการยืม-คืน
        </Link>
      </nav>

      <div className="space-y-6">
        {/* Filter Section */}
        <section className="bg-surface border border-border-main rounded-2xl p-6 shadow-sm ring-4 ring-primary/5">
          <h4 className="text-lg font-bold text-primary flex items-center gap-2 mb-6">
            <Search size={20} /> ตัวกรองข้อมูล
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted ml-1 flex items-center gap-1">
                <User size={12}/> ค้นหารหัสนิสิต
              </label>
              <input
                className="p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-main/50 text-text-main"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="ระบุรหัส 8 หลัก..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted ml-1 flex items-center gap-1">
                <Calendar size={12}/> ระบุวันที่
              </label>
              <input
                type="date"
                className="p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-main/50 font-bold text-text-main"
                value={datePick}
                onChange={(e) => setDatePick(e.target.value)}
              />
            </div>
            <button
              className="py-3.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              onClick={fetchRecords}
            >
              {loading ? "กำลังค้นหา..." : <><Search size={18}/> ค้นหา</>}
            </button>
          </div>
        </section>

        {/* Results List */}
        <div className="space-y-8">
          {days.length === 0 && !loading && (
            <div className="py-20 text-center bg-surface border border-dashed border-border-main rounded-2xl text-text-muted">
              ไม่พบรายการข้อมูลที่ค้นหา
            </div>
          )}

          {days.map((day: any) => (
            <section className="bg-surface border border-border-main rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300" key={day.date}>
              <header className="bg-gradient-to-r from-primary/10 to-transparent p-4 border-b border-border-main flex justify-between items-center">
                <h4 className="font-bold text-text-main flex items-center gap-2">
                  <ClipboardList size={18} className="text-primary"/>
                  รายการวันที่ {day.date}
                </h4>
                <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-border-main text-primary">
                  {day.rows.length} รายการ
                </span>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="hidden md:table-header-group bg-gray-50 border-b border-border-main">
                    <tr>
                      <th className="p-4 text-center font-bold text-text-muted">เวลา</th>
                      <th className="p-4 text-left font-bold text-text-muted">รหัสนิสิต</th>
                      <th className="p-4 text-left font-bold text-text-muted">อุปกรณ์</th>
                      <th className="p-4 text-center font-bold text-text-muted">สถานะ</th>
                      <th className="p-4 text-center font-bold text-text-muted">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {day.rows.map((row: any) => (
                      <tr key={row.id} className="flex flex-col md:table-row bg-white hover:bg-primary-soft/10 transition-colors">
                        <td className="p-4 flex justify-between md:table-cell text-center text-text-muted border-b md:border-b-0 border-gray-100">
                          <span className="md:hidden font-bold text-primary">เวลา</span>
                          <span className="flex items-center gap-1 justify-center"><Clock size={14}/> {row.time}</span>
                        </td>
                        <td className="p-4 flex justify-between md:table-cell font-bold text-text-main border-b md:border-b-0 border-gray-100">
                          <span className="md:hidden font-bold text-primary">รหัสนิสิต</span>
                          <span className="flex items-center gap-1"><User size={14}/> {row.student_id}</span>
                        </td>
                        <td className="p-4 flex justify-between md:table-cell text-text-main border-b md:border-b-0 border-gray-100">
                          <span className="md:hidden font-bold text-primary">อุปกรณ์</span>
                          <span className="flex items-center gap-1"><Package size={14}/> {row.equipment}</span>
                        </td>
                        <td className="p-4 flex justify-between md:table-cell text-center border-b md:border-b-0 border-gray-100">
                          <span className="md:hidden font-bold text-primary">สถานะ</span>
                          <div className="flex justify-center w-full">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              row.action === "return" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                            }`}>
                              {row.action === "return" ? <><CheckCircle2 size={14}/> คืนแล้ว</> : "🟠 กำลังยืม"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 flex justify-between md:table-cell text-center font-bold text-text-main">
                          <span className="md:hidden font-bold text-primary">จำนวน</span>
                          {row.qty} ชิ้น
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
