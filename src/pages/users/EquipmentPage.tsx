import React, { useState, useEffect } from "react";
import {
  Package, User, Minus, Plus, Trash2, ChevronDown, ChevronUp, History, CheckCircle2, Dribbble, Trophy, Activity
} from "lucide-react";
import "../../styles/equipment.css";

// เชื่อมต่อ URL Cloudflare
const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<"borrow" | "return" | "history">("borrow");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [faculties, setFaculties] = useState<string[]>([]);
  const [stocks, setStocks] = useState<{name: string, stock: number}[]>([]);
  const [pendingReturns, setPendingReturns] = useState<any[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);

  const [studentInfo, setStudentInfo] = useState({ id: "", name: "", faculty: "", phone: "" });
  const [borrowItems, setBorrowItems] = useState<{ name: string, qty: number }[]>([]);

  const refreshData = () => {
    fetch(`${API}/api/equipment/stock/`).then(res => res.json()).then(data => data.ok && setStocks(data.equipments));

    if (activeTab === "return") {
      fetch(`${API}/api/equipment/pending-returns/`).then(res => res.json()).then(data => {
        if (data.ok) {
          const grouped = data.rows.reduce((acc: any, curr: any) => {
            if (!acc[curr.student_id]) acc[curr.student_id] = { id: curr.student_id, faculty: curr.faculty, items: [] };
            acc[curr.student_id].items.push(curr);
            return acc;
          }, {});
          setPendingReturns(Object.values(grouped));
        }
      });
    }
    if (activeTab === "history") {
      fetch(`${API}/api/staff/borrow-records/`).then(res => res.json()).then(data => data.ok && setBorrowHistory(data.days[0]?.rows || []));
    }
  };

  useEffect(() => {
    fetch(`${API}/api/faculties/`).then(res => res.json()).then(data => data.ok && setFaculties(data.faculties));
    refreshData();
  }, [activeTab]);

  const handleBorrowSubmit = async () => {
    if (!studentInfo.id || borrowItems.length === 0) return alert("กรุณาระบุรหัสนิสิตและอุปกรณ์");
    try {
      for (const item of borrowItems) {
        await fetch(`${API}/api/equipment/borrow/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...studentInfo, equipment: item.name, qty: item.qty })
        });
      }
      alert("ยืมอุปกรณ์สำเร็จ");
      setBorrowItems([]);
      refreshData();
    } catch (e) { alert("เกิดข้อผิดพลาดในการยืม"); }
  };

  const handleReturnItem = async (sid: string, faculty: string, itemName: string, qty: number) => {
    const res = await fetch(`${API}/api/equipment/return/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: sid, faculty, equipment: itemName, qty })
    });
    if (res.ok) { alert("คืนอุปกรณ์สำเร็จ"); refreshData(); }
  };

  const getSportIcon = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("บาส")) return <Dribbble size={20} className="icon-sport" />;
    if (n.includes("แบด") || n.includes("ไม้")) return <Trophy size={20} className="icon-sport" />;
    if (n.includes("บอล") || n.includes("ฟุต")) return <Activity size={20} className="icon-sport" />;
    return <Package size={20} className="icon-sport" />;
  };

  const handleUpdateBorrowQty = (itemName: string, delta: number) => {
    const exist = borrowItems.find(i => i.name === itemName);
    if (exist) {
      const newQty = exist.qty + delta;
      if (newQty <= 0) setBorrowItems(borrowItems.filter(i => i.name !== itemName));
      else setBorrowItems(borrowItems.map(i => i.name === itemName ? { ...i, qty: newQty } : i));
    } else if (delta > 0) {
      setBorrowItems([...borrowItems, { name: itemName, qty: 1 }]);
    }
  };

  return (
    <div className="equipment-container">
      <nav className="tab-header">
        <button className={activeTab === "borrow" ? "active" : ""} onClick={() => setActiveTab("borrow")}>ยืมอุปกรณ์</button>
        <button className={activeTab === "return" ? "active" : ""} onClick={() => setActiveTab("return")}>คืนอุปกรณ์</button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>ประวัติการยืม-คืน</button>
      </nav>

      <div className="content-layout">
        {activeTab === "borrow" && (
          <div className="borrow-vertical-flow">
            <section className="panel info-section">
              <h4 className="title-sm"><User size={18} /> ข้อมูลผู้ยืม</h4>
              <div className="borrow-form-inputs">
                <div className="input-row">
                  <div className="field-group"><label>ชื่อ-นามสกุล</label>
                    <input type="text" placeholder="ชื่อ-นามสกุล" value={studentInfo.name} onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} />
                  </div>
                  <div className="field-group"><label>รหัสนิสิต</label>
                    <input type="text" placeholder="รหัสนิสิต" maxLength={8} value={studentInfo.id} onChange={e => setStudentInfo({...studentInfo, id: e.target.value})} />
                  </div>
                </div>
                <div className="input-row">
                  <div className="field-group"><label>คณะ / หน่วยงาน</label>
                    <select value={studentInfo.faculty} onChange={e => setStudentInfo({...studentInfo, faculty: e.target.value})}>
                      <option value="">เลือกคณะ</option>
                      {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="field-group"><label>เบอร์โทรศัพท์</label>
                    <input type="text" placeholder="เบอร์โทรศัพท์" maxLength={10} value={studentInfo.phone} onChange={e => setStudentInfo({...studentInfo, phone: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            <section className="panel stock-section">
              <h4 className="title-sm"><Package size={18} /> เลือกอุปกรณ์จากสต็อก</h4>
              <div className="stock-grid-minimal">
                {stocks.map(item => (
                  <div key={item.name} className="stock-card-mini">
                    <div className="info-with-icon">{getSportIcon(item.name)}
                      <div className="txt"><strong>{item.name}</strong><small>คงเหลือ {item.stock}</small></div>
                    </div>
                    <div className="qty-picker">
                      <button className="q-btn" onClick={() => handleUpdateBorrowQty(item.name, -1)}><Minus size={14} /></button>
                      <span className="q-val">{borrowItems.find(i => i.name === item.name)?.qty || 0}</span>
                      <button className="q-btn" onClick={() => handleUpdateBorrowQty(item.name, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {borrowItems.length > 0 && (
              <section className="panel summary-section">
                <h4 className="title-sm">รายการที่เลือกยืม</h4>
                <div className="summary-list">
                  {borrowItems.map((item, idx) => (
                    <div key={idx} className="summary-row">
                      <div className="summary-item-name">{getSportIcon(item.name)}<span>{item.name} x {item.qty} รายการ</span></div>
                      <button className="remove-btn" onClick={() => handleUpdateBorrowQty(item.name, -item.qty)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <button className="submit-btn-large" onClick={handleBorrowSubmit}>ยืนยันการยืมอุปกรณ์</button>
              </section>
            )}
          </div>
        )}

        {activeTab === "return" && (
          <div className="return-layout">
            <div className="accordion-list">
              {pendingReturns.map(user => (
                <div key={user.id} className={`acc-item ${expandedId === user.id ? 'open' : ''}`}>
                  <div className="acc-header" onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                    <div className="header-text"><strong>{user.id}</strong> <span>{user.faculty}</span></div>
                    {expandedId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <div className="acc-body">
                    <table className="return-table-detail">
                      <thead><tr><th>รายการ</th><th>ค้าง</th><th>จัดการ</th></tr></thead>
                      <tbody>
                        {user.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td><div className="item-with-icon-only">{getSportIcon(item.equipment)}<span>{item.equipment}</span></div></td>
                            <td className="txt-pending">{item.remaining}</td>
                            <td><button className="btn-return-line" onClick={() => handleReturnItem(user.id, user.faculty, item.equipment, item.remaining)}>ยืนยันคืน</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-layout">
            <div className="panel history-table-panel">
              <h4 className="title-sm"><History size={18} /> รายการประวัติวันนี้</h4>
              <table className="history-table">
                <thead><tr><th>เวลา</th><th>ผู้ยืม</th><th>รายการ</th><th>จำนวน</th><th>สถานะ</th></tr></thead>
                <tbody>
                  {borrowHistory.map((h: any, i: number) => (
                    <tr key={i}>
                      <td>{h.time}</td>
                      <td><strong>{h.student_id}</strong><br /><small>{h.faculty}</small></td>
                      <td>{h.equipment}</td>
                      <td>{h.qty} ชิ้น</td>
                      <td><span className={h.action === "return" ? "status-complete" : "status-pending"}>
                        {h.action === "return" ? <><CheckCircle2 size={16} /> คืนแล้ว</> : "กำลังยืม"}
                      </span></td>
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
