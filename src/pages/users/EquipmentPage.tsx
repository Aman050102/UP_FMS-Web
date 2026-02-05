import React, { useState, useEffect } from "react";
import {
  Package,
  User,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Calendar,
  Clock,
  Dribbble,
  Trophy,
  Activity,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

const UP_FACULTIES = [
  "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ",
  "คณะเทคโนโลยีสารสนเทศและการสื่อสาร",
  "คณะนิติศาสตร์",
  "คณะพยาบาลศาสตร์",
  "คณะแพทยศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะบริหารธุรกิจและนิเทศศาสตร์",
  "คณะวิทยาศาสตร์",
  "คณะวิทยาศาสตร์การแพทย์",
  "คณะวิศวกรรมศาสตร์",
  "คณะศิลปศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์",
  "คณะสหเวชศาสตร์",
  "คณะพลังงานและสิ่งแวดล้อม",
  "คณะทันตแพทยศาสตร์",
  "คณะรัฐศาสตร์และสังคมศาสตร์",
  "คณะสาธารณสุขศาสตร์",
  "วิทยาลัยการศึกษา",
  "โรงเรียนสาธิตมหาวิทยาลัยพะเยา",
];

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<"borrow" | "return" | "history">("borrow");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [stocks, setStocks] = useState<{ name: string; stock: number }[]>([]);
  const [pendingReturns, setPendingReturns] = useState<any[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);

  const [studentInfo, setStudentInfo] = useState({
    id: "",
    name: "",
    faculty: "",
    phone: "",
  });
  const [borrowItems, setBorrowItems] = useState<{ name: string; qty: number }[]>([]);

  // เพิ่ม State สำหรับการทำรายการย้อนหลัง
  const [isBackdate, setIsBackdate] = useState(false);
  const [backdateValue, setBackdateValue] = useState("");

  const refreshData = async () => {
    try {
      const stockRes = await fetch(`${API}/api/staff/equipment/stock`);
      const stockData = await stockRes.json();
      if (stockData.ok) setStocks(stockData.equipments);

      if (activeTab === "return") {
        const returnRes = await fetch(`${API}/api/equipment/pending-returns`);
        const returnData = await returnRes.json();
        if (returnData.ok) {
          const grouped = returnData.rows.reduce((acc: any, curr: any) => {
            if (!acc[curr.student_id])
              acc[curr.student_id] = { id: curr.student_id, faculty: curr.faculty, items: [] };
            acc[curr.student_id].items.push(curr);
            return acc;
          }, {});
          setPendingReturns(Object.values(grouped));
        }
      }

      if (activeTab === "history") {
        const historyRes = await fetch(`${API}/api/staff/borrow-records`);
        const historyData = await historyRes.json();
        if (historyData.ok && historyData.days.length > 0)
          setBorrowHistory(historyData.days[0].rows);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handleBorrowSubmit = async () => {
    if (!studentInfo.id || !studentInfo.faculty || borrowItems.length === 0)
      return alert("กรุณาระบุรหัสนิสิต คณะ และเลือกอุปกรณ์");

    // ตรวจสอบการเลือกวันที่ย้อนหลัง
    if (isBackdate && !backdateValue) {
      return alert("กรุณาระบุวันที่และเวลาที่ต้องการบันทึกย้อนหลัง");
    }

    try {
      for (const item of borrowItems) {
        await fetch(`${API}/api/equipment/borrow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentInfo.id,
            name: studentInfo.name,
            faculty: studentInfo.faculty,
            equipment: item.name,
            qty: item.qty,
            // ส่งค่า borrow_date ไปยัง API (ถ้าเป็นย้อนหลังจะส่งค่าวันที่ ถ้าไม่ส่งจะเป็น null/ปัจจุบัน)
            borrow_date: isBackdate ? backdateValue : null,
          }),
        });
      }
      alert(isBackdate ? "บันทึกรายการย้อนหลังสำเร็จ" : "ยืมอุปกรณ์สำเร็จ");
      setBorrowItems([]);
      setStudentInfo({ id: "", name: "", faculty: "", phone: "" });
      setIsBackdate(false);
      setBackdateValue("");
      refreshData();
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการยืม");
    }
  };

  const handleReturnItem = async (sid: string, faculty: string, itemName: string, qty: number) => {
    try {
      const res = await fetch(`${API}/api/equipment/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: sid, faculty, equipment: itemName, qty }),
      });
      if (res.ok) {
        alert("คืนอุปกรณ์สำเร็จ");
        refreshData();
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการคืน");
    }
  };

  const getSportIcon = (name: string) => {
    const n = (name || "").toLowerCase();
    const iconClass = "p-1.5 bg-primary-soft text-primary rounded-lg shrink-0";
    if (n.includes("บาส")) return <Dribbble size={32} className={iconClass} />;
    if (n.includes("แบด") || n.includes("ไม้")) return <Trophy size={32} className={iconClass} />;
    if (n.includes("บอล") || n.includes("ฟุต")) return <Activity size={32} className={iconClass} />;
    return <Package size={32} className={iconClass} />;
  };

  const handleUpdateBorrowQty = (itemName: string, delta: number) => {
    const exist = borrowItems.find((i) => i.name === itemName);
    const stockItem = stocks.find((s) => s.name === itemName);

    if (exist) {
      const newQty = exist.qty + delta;
      if (newQty > (stockItem?.stock || 0) && delta > 0) return alert("สินค้าในสต็อกไม่พอ");
      if (newQty <= 0) setBorrowItems(borrowItems.filter((i) => i.name !== itemName));
      else setBorrowItems(borrowItems.map((i) => (i.name === itemName ? { ...i, qty: newQty } : i)));
    } else if (delta > 0) {
      if ((stockItem?.stock || 0) <= 0) return alert("สินค้าหมด");
      setBorrowItems([...borrowItems, { name: itemName, qty: 1 }]);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5 font-kanit">
      <nav className="flex gap-5 border-b border-border-main mb-6">
        {(["borrow", "return", "history"] as const).map((tab) => (
          <button
            key={tab}
            className={`pb-2.5 px-1 font-semibold transition-all cursor-pointer border-b-2 ${activeTab === tab ? "text-text-main border-primary" : "text-text-muted border-transparent hover:text-text-main"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "borrow" ? "ยืมอุปกรณ์" : tab === "return" ? "คืนอุปกรณ์" : "ประวัติการยืม-คืน"}
          </button>
        ))}
      </nav>

      <div className="space-y-5">
        {activeTab === "borrow" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {/* ข้อมูลผู้ยืม */}
            <section className="bg-white border border-border-main rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-primary flex items-center gap-2.5 text-lg font-bold">
                  <User size={18} /> ข้อมูลผู้ยืม
                </h4>
                {/* ปุ่มเปิดโหมดลงบันทึกย้อนหลัง */}
                <button
                  onClick={() => setIsBackdate(!isBackdate)}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all border ${isBackdate ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-gray-50 text-gray-400 border-gray-100"
                    }`}
                >
                  {isBackdate ? "● กำลังบันทึกย้อนหลัง" : "เพิ่มรายการย้อนหลัง"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* แสดงช่องเลือกวันที่เมื่อเปิดโหมด Backdate */}
                {isBackdate && (
                  <div className="md:col-span-2 space-y-1.5 p-3 bg-orange-50/50 border border-orange-100 rounded-lg animate-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-orange-600 flex items-center gap-1.5 uppercase">
                      <Calendar size={14} /> วันที่และเวลาที่ยืมย้อนหลัง
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full p-2.5 border border-orange-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-500/20"
                      value={backdateValue}
                      onChange={(e) => setBackdateValue(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">ชื่อ-นามสกุล</label>
                  <input type="text" className="w-full p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20" value={studentInfo.name} onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">รหัสนิสิต / รหัสนักเรียน</label>
                  <input type="text" className="w-full p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20" value={studentInfo.id} onChange={(e) => setStudentInfo({ ...studentInfo, id: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">คณะ / หน่วยงาน</label>
                  <select className="w-full p-2.5 border border-border-main rounded-lg bg-white" value={studentInfo.faculty} onChange={(e) => setStudentInfo({ ...studentInfo, faculty: e.target.value })}>
                    <option value="">เลือกคณะ / หน่วยงาน</option>
                    {UP_FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">เบอร์โทรศัพท์</label>
                  <input type="text" maxLength={10} className="w-full p-2.5 border border-border-main rounded-lg" value={studentInfo.phone} onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })} />
                </div>
              </div>
            </section>

            {/* เลือกจากสต็อกจริง */}
            <section className="bg-white border border-border-main rounded-xl p-5 shadow-sm">
              <h4 className="text-primary flex items-center gap-2.5 text-lg font-bold mb-4">
                <Package size={18} /> เลือกอุปกรณ์จากคลัง
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stocks.map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 border border-border-main rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getSportIcon(item.name)}
                      <div className="overflow-hidden">
                        <strong className="block text-sm truncate">{item.name}</strong>
                        <small className={`text-[10px] font-bold ${item.stock > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                          {item.stock > 0 ? `คงเหลือ ${item.stock}` : "สินค้าหมด"}
                        </small>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 px-2 rounded-full border border-border-main shadow-sm">
                      <button className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer" onClick={() => handleUpdateBorrowQty(item.name, -1)}><Minus size={12} /></button>
                      <span className="font-extrabold text-sm min-w-[15px] text-center">{borrowItems.find((i) => i.name === item.name)?.qty || 0}</span>
                      <button className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer" onClick={() => handleUpdateBorrowQty(item.name, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ตะกร้าที่เลือกยืม */}
            {borrowItems.length > 0 && (
              <section className="bg-primary/5 border-t-4 border-primary rounded-xl p-5 animate-in slide-in-from-bottom duration-300">
                <h4 className="font-bold mb-3 flex items-center justify-between">
                  <span>รายการที่กำลังจะยืม</span>
                  {isBackdate && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">บันทึกย้อนหลัง</span>}
                </h4>
                <div className="space-y-2 mb-4">
                  {borrowItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-primary/20">
                      <span className="text-sm font-medium">{item.name} x {item.qty} ชิ้น</span>
                      <button className="text-red-500 p-1 hover:bg-red-50 rounded-md" onClick={() => handleUpdateBorrowQty(item.name, -item.qty)}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all cursor-pointer" onClick={handleBorrowSubmit}>
                  {isBackdate ? "ยืนยันบันทึกรายการย้อนหลัง" : "ยืนยันการทำรายการยืม"}
                </button>
              </section>
            )}
          </div>
        )}

        {/* TAB: RETURN */}
        {activeTab === "return" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {pendingReturns.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-border-main rounded-xl text-text-muted">ไม่มีรายการค้างคืน</div>
            ) : (
              pendingReturns.map((user) => (
                <div key={user.id} className="border border-border-main rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                    <div className="flex items-center gap-4"><strong className="text-primary text-lg">{user.id}</strong><span className="text-sm text-text-muted">{user.faculty}</span></div>
                    {expandedId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  {expandedId === user.id && (
                    <div className="p-4 bg-gray-50 border-t border-border-main">
                      <table className="w-full text-sm bg-white rounded-lg">
                        <tbody className="divide-y divide-gray-100">
                          {user.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="p-3 font-medium">{item.equipment}</td>
                              <td className="p-3 text-center text-red-500 font-bold">{item.remaining} ชิ้น</td>
                              <td className="p-3 text-right"><button className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold" onClick={() => handleReturnItem(user.id, user.faculty, item.equipment, item.remaining)}>คืน</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white border border-border-main rounded-xl p-6 shadow-sm overflow-x-auto animate-in fade-in duration-300">
            <h4 className="text-primary flex items-center gap-2.5 font-bold mb-6"><History size={18} /> ประวัติการทำรายการวันนี้</h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><th className="p-3 text-left">เวลา</th><th className="p-3 text-left">ผู้ยืม</th><th className="p-3 text-left">รายการ</th><th className="p-3">จำนวน</th><th className="p-3">สถานะ</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {borrowHistory.map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 text-gray-400">{h.time}</td>
                    <td className="p-3 font-bold">{h.student_id}<br /><small className="font-normal text-gray-400">{h.faculty}</small></td>
                    <td className="p-3">{h.equipment}</td>
                    <td className="p-3 text-center font-bold">{h.qty}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${h.action === 'return' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {h.action === 'return' ? '✓ คืนแล้ว' : '● กำลังยืม'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
