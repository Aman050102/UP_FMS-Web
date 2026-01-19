import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FileText, Plus, Download, Printer, X, Search, Calendar as CalendarIcon, User, MapPin } from "lucide-react";

export default function StaffBookingManage() {
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff/bookings/all`);
      const data = await res.json();
      if (data.ok) setBookings(data.rows);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/api/staff/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert("บันทึกการจองและเตรียมไฟล์ PDF เรียบร้อย");
        setShowModal(false);
        fetchBookings();
      }
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
  };

  const calendarEvents = bookings.map((b: any) => ({
    title: `${b.fieldName} - ${b.requesterName}`,
    start: b.startDate,
    end: b.endDate,
    color: "#5D4B9C"
  }));

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto space-y-6">

        <header className="bg-surface p-6 rounded-3xl border border-border-main shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-text-main flex items-center gap-2">
              <CalendarIcon className="text-primary" /> ระบบจัดการและจองสนามกีฬา
            </h1>
            <p className="text-text-muted text-sm">ตรวจสอบความว่างและออกเอกสารขออนุมัติ (13pt)</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus size={18} /> ลงทะเบียนจองใหม่
          </button>
        </header>

        {/* Calendar View */}
        <section className="bg-surface p-6 rounded-3xl border border-border-main shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            locale="th"
            height="auto"
          />
        </section>

        {/* Summary Table */}
        <section className="bg-surface rounded-3xl border border-border-main shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-text-main">รายการจองล่าสุด</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white border-b text-text-muted font-bold">
                <tr>
                  <th className="p-4">ผู้ขอใช้สนาม</th>
                  <th className="p-4">สถานที่</th>
                  <th className="p-4">วัน-เวลา</th>
                  <th className="p-4 text-center">จัดการเอกสาร</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{b.requesterName} <br/><small className="font-normal">{b.department}</small></td>
                    <td className="p-4 text-primary font-bold">{b.fieldName}</td>
                    <td className="p-4">{b.startDate} <br/><small>{b.startTime} - {b.endTime} น.</small></td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <a href={`${API_BASE}/api/staff/booking/pdf/${b.id}`} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="โหลด PDF 13pt">
                          <Download size={18} />
                        </a>
                        <button onClick={() => window.open(`${API_BASE}/api/staff/booking/pdf/${b.id}`, "_blank")} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100">
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Booking Modal (Form ตามไฟล์ PDF มหาวิทยาลัย) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <form onSubmit={handleBookingSubmit} className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-black text-text-main">ระบุรายละเอียดการจองตามฟอร์ม</h2>
              <button type="button" onClick={() => setShowModal(false)}><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                [cite_start]<label className="text-xs font-bold text-text-muted">ชื่อ-นามสกุล ผู้ขอใช้สนาม [cite: 59]</label>
                <input name="requesterName" required className="w-full p-3 bg-bg-main border rounded-xl" placeholder="เช่น นายอามาน อาลีแก" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">สังกัดคณะ/วิทยาลัย [cite: 60]</label>
                  <input name="department" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">เบอร์โทรศัพท์ [cite: 60]</label>
                  <input name="phone" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">จองสนาม [cite: 61]</label>
                  <input name="fieldName" required className="w-full p-3 bg-bg-main border rounded-xl" placeholder="เช่น สนามฟุตบอล 1" />
                </div>
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">อาคาร [cite: 61]</label>
                  <input name="building" className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">ตั้งแต่วันที่ [cite: 62]</label>
                  <input name="startDate" type="date" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">ถึงวันที่ [cite: 62]</label>
                  <input name="endDate" type="date" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">ตั้งแต่เวลา (น.) [cite: 62]</label>
                  <input name="startTime" type="time" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
                <div>
                  [cite_start]<label className="text-xs font-bold text-text-muted">ถึงเวลา (น.) [cite: 62]</label>
                  <input name="endTime" type="time" required className="w-full p-3 bg-bg-main border rounded-xl" />
                </div>
              </div>
              <div>
                [cite_start]<label className="text-xs font-bold text-text-muted">วัตถุประสงค์เพื่อ [cite: 63]</label>
                <textarea name="purposeDetail" className="w-full p-3 bg-bg-main border rounded-xl h-20" placeholder="เช่น จัดกิจกรรมโครงการสานสายใย..."></textarea>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t mt-6">
              <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg">บันทึกและสร้างแบบฟอร์ม PDF</button>
              <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-gray-100 rounded-2xl font-bold">ยกเลิก</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
