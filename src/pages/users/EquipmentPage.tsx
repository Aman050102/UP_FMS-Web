import { useState, useEffect } from "react";
import {
  Package,
  User,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  Dribbble,
  Trophy,
  Activity,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

// รายชื่อคณะ/หน่วยงาน มหาวิทยาลัยพะเยา
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
  const [activeTab, setActiveTab] = useState<"borrow" | "return" | "history">(
    "borrow",
  );
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
  const [borrowItems, setBorrowItems] = useState<
    { name: string; qty: number }[]
  >([]);

  const refreshData = () => {
    fetch(`${API}/api/equipment/stock/`)
      .then((res) => res.json())
      .then((data) => data.ok && setStocks(data.equipments));

    if (activeTab === "return") {
      fetch(`${API}/api/equipment/pending-returns/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            const grouped = data.rows.reduce((acc: any, curr: any) => {
              if (!acc[curr.student_id])
                acc[curr.student_id] = {
                  id: curr.student_id,
                  faculty: curr.faculty,
                  items: [],
                };
              acc[curr.student_id].items.push(curr);
              return acc;
            }, {});
            setPendingReturns(Object.values(grouped));
          }
        });
    }

    if (activeTab === "history") {
      fetch(`${API}/api/staff/borrow-records/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.days.length > 0)
            setBorrowHistory(data.days[0].rows);
        });
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handleBorrowSubmit = async () => {
    if (!studentInfo.id || !studentInfo.faculty || borrowItems.length === 0)
      return alert("กรุณาระบุรหัสนิสิต คณะ และเลือกอุปกรณ์");
    try {
      for (const item of borrowItems) {
        await fetch(`${API}/api/equipment/borrow/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentInfo.id,
            name: studentInfo.name,
            faculty: studentInfo.faculty,
            equipment: item.name,
            qty: item.qty,
          }),
        });
      }
      alert("ยืมอุปกรณ์สำเร็จ");
      setBorrowItems([]);
      refreshData();
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการยืม");
    }
  };

  const handleReturnItem = async (
    sid: string,
    faculty: string,
    itemName: string,
    qty: number,
  ) => {
    const res = await fetch(`${API}/api/equipment/return/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: sid,
        faculty,
        equipment: itemName,
        qty,
      }),
    });
    if (res.ok) {
      alert("คืนอุปกรณ์สำเร็จ");
      refreshData();
    }
  };

  const getSportIcon = (name: string) => {
    const n = (name || "").toLowerCase();
    const iconClass = "p-1.5 bg-primary-soft text-primary rounded-lg shrink-0";
    if (n.includes("บาส")) return <Dribbble size={32} className={iconClass} />;
    if (n.includes("แบด") || n.includes("ไม้"))
      return <Trophy size={32} className={iconClass} />;
    if (n.includes("บอล") || n.includes("ฟุต"))
      return <Activity size={32} className={iconClass} />;
    return <Package size={32} className={iconClass} />;
  };

  const handleUpdateBorrowQty = (itemName: string, delta: number) => {
    const exist = borrowItems.find((i) => i.name === itemName);
    const stockItem = stocks.find((s) => s.name === itemName);

    if (exist) {
      const newQty = exist.qty + delta;
      if (newQty > (stockItem?.stock || 0) && delta > 0)
        return alert("สินค้าในสต็อกไม่พอ");
      if (newQty <= 0)
        setBorrowItems(borrowItems.filter((i) => i.name !== itemName));
      else
        setBorrowItems(
          borrowItems.map((i) =>
            i.name === itemName ? { ...i, qty: newQty } : i,
          ),
        );
    } else if (delta > 0) {
      if ((stockItem?.stock || 0) <= 0) return alert("สินค้าหมด");
      setBorrowItems([...borrowItems, { name: itemName, qty: 1 }]);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5 font-kanit">
      {/* Tabs Navigation */}
      <nav className="flex gap-5 border-b border-border-main mb-6">
        {(["borrow", "return", "history"] as const).map((tab) => (
          <button
            key={tab}
            className={`pb-2.5 px-1 font-semibold transition-all cursor-pointer border-b-2 ${
              activeTab === tab
                ? "text-text-main border-primary"
                : "text-text-muted border-transparent hover:text-text-main"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "borrow"
              ? "ยืมอุปกรณ์"
              : tab === "return"
                ? "คืนอุปกรณ์"
                : "ประวัติการยืม-คืน"}
          </button>
        ))}
      </nav>

      <div className="space-y-5">
        {/* --- TAB: BORROW --- */}
        {activeTab === "borrow" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {/* ข้อมูลผู้ยืม */}
            <section className="bg-surface border border-border-main rounded-xl p-5 shadow-sm">
              <h4 className="text-primary flex items-center gap-2.5 text-lg font-bold mb-4">
                <User size={18} /> ข้อมูลผู้ยืม
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      className="p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={studentInfo.name}
                      onChange={(e) =>
                        setStudentInfo({ ...studentInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">
                      รหัสนิสิต / รหัสนักเรียน
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุรหัสประจำตัว"
                      className="p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={studentInfo.id}
                      onChange={(e) =>
                        setStudentInfo({ ...studentInfo, id: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">
                      คณะ / หน่วยงาน
                    </label>
                    <select
                      className="p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                      value={studentInfo.faculty}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          faculty: e.target.value,
                        })
                      }
                    >
                      <option value="">เลือกคณะ / หน่วยงาน</option>
                      {UP_FACULTIES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-muted">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="text"
                      placeholder="เบอร์โทรศัพท์ 10 หลัก"
                      maxLength={10}
                      className="p-2.5 border border-border-main rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={studentInfo.phone}
                      onChange={(e) =>
                        setStudentInfo({
                          ...studentInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* เลือกอุปกรณ์จากสต็อก */}
            <section className="bg-surface border border-border-main rounded-xl p-5 shadow-sm">
              <h4 className="text-primary flex items-center gap-2.5 text-lg font-bold mb-4">
                <Package size={18} /> เลือกอุปกรณ์จากสต็อก
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stocks.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center p-3 bg-bg-main border border-border-main rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {getSportIcon(item.name)}
                      <div className="overflow-hidden">
                        <strong className="block text-sm truncate w-full">
                          {item.name}
                        </strong>
                        <small className="text-text-muted text-xs">
                          คงเหลือ {item.stock}
                        </small>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1 px-2 rounded-full border border-border-main shadow-sm">
                      <button
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"
                        onClick={() => handleUpdateBorrowQty(item.name, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-extrabold min-w-[20px] text-center text-sm">
                        {borrowItems.find((i) => i.name === item.name)?.qty ||
                          0}
                      </span>
                      <button
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"
                        onClick={() => handleUpdateBorrowQty(item.name, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary Section */}
            {borrowItems.length > 0 && (
              <section className="bg-primary-soft/30 border-t-4 border-primary rounded-xl p-5 animate-in slide-in-from-bottom duration-300">
                <h4 className="text-text-main font-bold mb-3">
                  รายการที่เลือกยืม
                </h4>
                <div className="space-y-2 mb-4">
                  {borrowItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-dashed border-primary/20"
                    >
                      <div className="flex items-center gap-2">
                        {getSportIcon(item.name)}
                        <span className="text-sm font-medium">
                          {item.name} x {item.qty} รายการ
                        </span>
                      </div>
                      <button
                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() =>
                          handleUpdateBorrowQty(item.name, -item.qty)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-4 bg-text-main text-white rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                  onClick={handleBorrowSubmit}
                >
                  ยืนยันการยืมอุปกรณ์
                </button>
              </section>
            )}
          </div>
        )}

        {/* --- TAB: RETURN --- */}
        {activeTab === "return" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {pendingReturns.length === 0 && (
              <div className="text-center py-20 bg-surface border border-dashed border-border-main rounded-xl text-text-muted">
                ไม่มีรายการค้างคืน
              </div>
            )}
            {pendingReturns.map((user) => (
              <div
                key={user.id}
                className={`border border-border-main rounded-xl overflow-hidden bg-surface shadow-sm transition-all ${
                  expandedId === user.id ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedId(expandedId === user.id ? null : user.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <strong className="text-primary text-lg">{user.id}</strong>
                    <span className="text-sm text-text-muted hidden sm:inline">
                      {user.faculty}
                    </span>
                  </div>
                  {expandedId === user.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {expandedId === user.id && (
                  <div className="p-4 bg-gray-50 border-t border-border-main animate-in slide-in-from-top duration-300">
                    <div className="overflow-x-auto rounded-lg border border-border-main">
                      <table className="w-full text-sm">
                        <thead className="hidden md:table-header-group bg-white border-b-2 border-border-main">
                          <tr>
                            <th className="p-3 text-left">รายการ</th>
                            <th className="p-3">ค้างคืน</th>
                            <th className="p-3">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main">
                          {user.items.map((item: any, i: number) => (
                            <tr
                              key={i}
                              className="flex flex-col md:table-row bg-white md:bg-transparent mb-3 md:mb-0"
                            >
                              <td
                                className="p-3 flex justify-between md:table-cell"
                                data-label="รายการ"
                              >
                                <div className="flex items-center gap-2 md:justify-start">
                                  {getSportIcon(item.equipment)}
                                  <span className="font-medium">
                                    {item.equipment}
                                  </span>
                                </div>
                              </td>
                              <td
                                className="p-3 flex justify-between md:table-cell text-center"
                                data-label="ค้างคืน"
                              >
                                <span className="text-red-500 font-bold">
                                  {item.remaining}
                                </span>
                              </td>
                              <td
                                className="p-3 flex justify-between md:table-cell text-center"
                                data-label="จัดการ"
                              >
                                <button
                                  className="w-full md:w-auto bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition-colors cursor-pointer text-xs"
                                  onClick={() =>
                                    handleReturnItem(
                                      user.id,
                                      user.faculty,
                                      item.equipment,
                                      item.remaining,
                                    )
                                  }
                                >
                                  ยืนยันคืน
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- TAB: HISTORY --- */}
        {activeTab === "history" && (
          <div className="bg-surface border border-border-main rounded-xl p-6 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <h4 className="text-primary flex items-center gap-2.5 text-lg font-bold mb-6">
              <History size={18} /> ประวัติการทำรายการวันนี้
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border-main">
              <table className="w-full text-sm">
                <thead className="hidden md:table-header-group bg-gray-50 border-b-2 border-border-main">
                  <tr>
                    <th className="p-4 text-center">เวลา</th>
                    <th className="p-4 text-left">ผู้ยืม</th>
                    <th className="p-4 text-center">รายการ</th>
                    <th className="p-4 text-center">จำนวน</th>
                    <th className="p-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {borrowHistory.map((h: any, i: number) => (
                    <tr
                      key={i}
                      className="flex flex-col md:table-row bg-white md:bg-transparent hover:bg-primary-soft/10 transition-colors"
                    >
                      <td
                        className="p-4 text-center flex justify-between md:table-cell"
                        data-label="เวลา"
                      >
                        <span className="text-text-muted">{h.time}</span>
                      </td>
                      <td
                        className="p-4 flex justify-between md:table-cell"
                        data-label="ผู้ยืม"
                      >
                        <div className="text-right md:text-left">
                          <strong className="block text-text-main">
                            {h.student_id}
                          </strong>
                          <small className="text-text-muted">{h.faculty}</small>
                        </div>
                      </td>
                      <td
                        className="p-4 text-center flex justify-between md:table-cell"
                        data-label="รายการ"
                      >
                        <span className="font-medium">{h.equipment}</span>
                      </td>
                      <td
                        className="p-4 text-center flex justify-between md:table-cell font-bold"
                        data-label="จำนวน"
                      >
                        {h.qty} ชิ้น
                      </td>
                      <td
                        className="p-4 flex justify-between md:table-cell"
                        data-label="สถานะ"
                      >
                        <div className="flex justify-center w-full">
                          <span
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              h.action === "return"
                                ? "bg-green-100 text-green-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {h.action === "return" ? (
                              <>
                                <CheckCircle2 size={14} /> คืนแล้ว
                              </>
                            ) : (
                              "🟠 กำลังยืม"
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
