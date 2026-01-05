import React, { useState } from "react";
import {
  Package, Search, Plus, Minus, Trash2, Smartphone, Building2, User,
  ChevronDown, ChevronUp, History, CheckCircle2, Dribbble, Trophy, Activity
} from "lucide-react";
import "../../styles/equipment.css";

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<"borrow" | "return" | "history">("borrow");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- States ---
  const [studentInfo, setStudentInfo] = useState({ id: "", name: "", faculty: "", phone: "" });
  const [borrowItems, setBorrowItems] = useState<{ name: string, qty: number }[]>([]);
  const [returnQtys, setReturnQtys] = useState<{ [key: string]: number }>({});

  // --- Mock Data (ข้อมูลจำลองป้องกันหน้าขาว) ---
  const stocks = [
    { name: "ลูกบาสเกตบอล", stock: 10 },
    { name: "ไม้แบดมินตัน", stock: 15 },
    { name: "ลูกฟุตบอล", stock: 5 }
  ];

  const pendingReturns = [
    {
      id: "65000001",
      name: "อามาน อาลีแก",
      items: [
        { name: "ลูกบาสเกตบอล", qty: 2, totalBorrowed: 2, status: "pending" },
        { name: "ไม้แบดมินตัน", qty: 1, totalBorrowed: 1, status: "pending" }
      ]
    }
  ];

  const borrowHistory = [
    { id: "65000001", name: "อามาน อาลีแก", item: "นกหวีด", qty: 1, date: "02/01/2024", status: "returned" },
    { id: "65000002", name: "สมชาย ทดสอบ", item: "ลูกฟุตบอล", qty: 2, date: "01/01/2024", status: "returned" }
  ];

  // --- Helpers ---
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
      {/* Tabs Navigation */}
      <nav className="tab-header">
        <button className={activeTab === "borrow" ? "active" : ""} onClick={() => setActiveTab("borrow")}>ยืมอุปกรณ์</button>
        <button className={activeTab === "return" ? "active" : ""} onClick={() => setActiveTab("return")}>คืนอุปกรณ์</button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>ประวัติการยืม-คืน</button>
      </nav>

      <div className="content-layout">
        {/* --- แท็บยืมอุปกรณ์ --- */}
        {activeTab === "borrow" && (
          <div className="borrow-vertical-flow">
            <section className="panel info-section">
              <h4 className="title-sm"><User size={18} /> ข้อมูลผู้ยืม</h4>
              <div className="borrow-form-inputs">
                <div className="input-row">
                  <div className="field-group">
                    <label>ชื่อ-นามสกุล</label>
                    <input type="text" placeholder="ชื่อ-นามสกุล" value={studentInfo.name} onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} />
                  </div>
                  <div className="field-group">
                    <label>รหัสนิสิต</label>
                    <input type="text" placeholder="รหัส 8 หลัก" maxLength={8} value={studentInfo.id} onChange={e => setStudentInfo({...studentInfo, id: e.target.value})} />
                  </div>
                </div>
                <div className="input-row">
                  <div className="field-group">
                    <label>คณะ / หน่วยงาน</label>
                    <select value={studentInfo.faculty} onChange={e => setStudentInfo({...studentInfo, faculty: e.target.value})}>
                      <option value="">เลือกคณะ</option>
                      <option value="IT">เทคโนโลยีสารสนเทศ</option>
                      <option value="Nurse">พยาบาลศาสตร์</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input type="text" placeholder="08XXXXXXXX" maxLength={10} value={studentInfo.phone} onChange={e => setStudentInfo({...studentInfo, phone: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            <section className="panel stock-section">
              <h4 className="title-sm"><Package size={18} /> เลือกอุปกรณ์จากสต็อก</h4>
              <div className="stock-grid-minimal">
                {stocks.map(item => (
                  <div key={item.name} className="stock-card-mini">
                    <div className="info-with-icon">
                      {getSportIcon(item.name)}
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
                <button className="submit-btn-large">ยืนยันการยืมอุปกรณ์</button>
              </section>
            )}
          </div>
        )}

        {/* --- แท็บคืนอุปกรณ์ --- */}
        {activeTab === "return" && (
          <div className="return-layout">
            <div className="search-bar"><Search size={18} /><input placeholder="ค้นหาด้วยรหัสหรือชื่อ..." /></div>
            <div className="accordion-list">
              {pendingReturns.map(user => (
                <div key={user.id} className={`acc-item ${expandedId === user.id ? 'open' : ''}`}>
                  <div className="acc-header" onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                    <div className="header-text"><strong>{user.id}</strong> <span>{user.name}</span></div>
                    {expandedId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <div className="acc-body">
                    <table className="return-table-detail">
                      <thead>
                        <tr><th>รายการ</th><th>ยืม</th><th>ค้าง</th><th>ระบุคืน</th><th>จัดการ</th></tr>
                      </thead>
                      <tbody>
                        {user.items.map((item, i) => (
                          <tr key={i}>
                            <td data-label="รายการ"><div className="item-with-icon-only">{getSportIcon(item.name)}<span>{item.name}</span></div></td>
                            <td data-label="ยืม">{item.totalBorrowed}</td>
                            <td data-label="ค้าง" className="txt-pending">{item.qty}</td>
                            <td data-label="ระบุคืน"><input type="number" className="input-qty-return" defaultValue={item.qty} /></td>
                            <td data-label="จัดการ"><button className="btn-return-line">ยืนยัน</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="return-footer-actions"><button className="btn-return-all-main">คืนที่เหลือทั้งหมด</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- แท็บประวัติการยืม-คืน --- */}
        {activeTab === "history" && (
          <div className="history-layout">
            <div className="panel history-table-panel">
              <h4 className="title-sm"><History size={18} /> รายการประวัติทั้งหมด</h4>
              <table className="history-table">
                <thead>
                  <tr><th>วันที่คืน</th><th>ผู้ยืม</th><th>รายการ</th><th>จำนวน</th><th>สถานะ</th></tr>
                </thead>
                <tbody>
                  {borrowHistory.map((h, i) => (
                    <tr key={i}>
                      <td data-label="วันที่">{h.date}</td>
                      <td data-label="ผู้ยืม"><strong>{h.id}</strong><br /><small>{h.name}</small></td>
                      <td data-label="รายการ"><div className="item-with-icon-only">{getSportIcon(h.item)}<span>{h.item}</span></div></td>
                      <td data-label="จำนวน">{h.qty} ชิ้น</td>
                      <td data-label="สถานะ"><span className="status-complete"><CheckCircle2 size={16} /> คืนแล้ว</span></td>
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
