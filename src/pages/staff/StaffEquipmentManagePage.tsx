import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Minus, Save, Trash2 } from "lucide-react";
import HeaderStaff from "../../components/HeaderStaff";
import "../../styles/staff-equipment.css";

// ---------------- Backend Configuration ----------------
const BACKEND = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";
const API_LIST = `${BACKEND}/api/staff/equipments/`;
const API_ITEM = (id: number) => `${BACKEND}/api/staff/equipment/${id}/`;

interface EquipmentItem {
  id: number;
  name: string;
  stock: number;
  total: number;
}

export default function StaffEquipmentManagePage() {
  const [displayName] = useState(localStorage.getItem("display_name") || "เจ้าหน้าที่");
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [equipName, setEquipName] = useState("");
  const [equipStock, setEquipStock] = useState("10");
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [showSheet, setShowSheet] = useState(false);

  // ---------------- Lifecycle ----------------
  useEffect(() => {
    document.body.setAttribute("data-page", "staff-equipment");
    fetchList();
    return () => document.body.removeAttribute("data-page");
  }, []);

  // ---------------- API Actions ----------------
  const fetchList = async () => {
    try {
      const res = await fetch(API_LIST, { credentials: "include" });
      const data = await res.json();
      if (data.ok) setItems(data.rows || []);
    } catch { console.error("โหลดข้อมูลล้มเหลว"); }
  };

  const getCsrfToken = () => document.cookie.match(/(?:^|;)\s*csrftoken=([^;]+)/)?.[1] || "";

  const openToast = () => {
    setShowSheet(true);
    setTimeout(() => setShowSheet(false), 1500);
  };

  const handleAdd = async () => {
    const name = equipName.trim();
    const stock = parseInt(equipStock);
    if (!name) return alert("กรุณากรอกชื่ออุปกรณ์");

    const existed = items.find(i => i.name.toLowerCase() === name.toLowerCase());
    try {
      const url = existed ? API_ITEM(existed.id) : API_ITEM(0);
      const method = existed ? "PATCH" : "POST";
      const body = existed
        ? { stock: existed.stock + stock, total: existed.total + stock }
        : { name, stock, total: stock };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setEquipName(""); setEquipStock("10"); openToast(); fetchList();
      }
    } catch { alert("เกิดข้อผิดพลาดในการบันทึก"); }
  };

  const updateRow = async (row: EquipmentItem) => {
    try {
      await fetch(API_ITEM(row.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify({
          name: row.name,
          stock: row.stock,
          total: Math.max(row.total, row.stock)
        }),
      });
      openToast();
      fetchList();
    } catch { alert("บันทึกไม่สำเร็จ"); }
  };

  const deleteRow = async (id: number) => {
    if (!confirm("ต้องการลบอุปกรณ์นี้ออกจากระบบหรือไม่?")) return;
    await fetch(API_ITEM(id), {
        method: "DELETE",
        headers: { "X-CSRFToken": getCsrfToken() },
        credentials: "include"
    });
    fetchList();
  };

  return (
    <div className="staff-equipment-page">
      {/* 1. เชื่อมต่อ HeaderStaff ให้เหมือนหน้าเมนู */}
      <HeaderStaff displayName={displayName} BACKEND={BACKEND} />

      <main className="wrap">
        {/* 2. Navigation Tabs (YouTube Style) */}
        <nav className="mainmenu">
          <ul>
            <li>
              <Link className="tab active" to="/staff/equipment">
                จัดการอุปกรณ์กีฬา
              </Link>
            </li>
            <li>
              <Link className="tab" to="/staff/borrow-ledger">
                บันทึกการยืม-คืน
              </Link>
            </li>
          </ul>
        </nav>

        <header className="menu-welcome">
          <h1>จัดการคลังอุปกรณ์กีฬา</h1>
          <p>เพิ่ม แก้ไข หรืออัปเดตจำนวนสต็อกอุปกรณ์ในระบบ</p>
        </header>

        {/* 3. ส่วนเพิ่มอุปกรณ์ */}
        <section className="panel add-panel">
          <h4 className="title-sm"><Plus size={20} /> เพิ่มอุปกรณ์ใหม่</h4>
          <div className="add-row">
            <input
              className="input name-input"
              placeholder="ชื่ออุปกรณ์ (เช่น ลูกบาสเกตบอล)"
              value={equipName}
              onChange={e => setEquipName(e.target.value)}
            />
            <input
              className="input stock-input"
              type="number"
              value={equipStock}
              onChange={e => setEquipStock(e.target.value)}
            />
            <button className="btn primary" onClick={handleAdd}>เพิ่มเข้าคลัง</button>
          </div>
        </section>

        {/* 4. รายการอุปกรณ์ทั้งหมด */}
        <section className="panel equip-panel">
          <h4 className="title-sm"><Package size={20} /> รายการในคลังปัจจุบัน</h4>
          <div className="table-head">
            <span>ชื่ออุปกรณ์ (ดับเบิลคลิกเพื่อแก้ชื่อ)</span>
            <span>สต็อกคงเหลือ / ทั้งหมด</span>
            <span style={{textAlign:'right'}}>เครื่องมือ</span>
          </div>
          <div className="list">
            {items.length === 0 && <div className="empty">ไม่มีรายการอุปกรณ์ในระบบ</div>}
            {items.map(row => (
              <div key={row.id} className="row">
                <div className="name-wrap">
                  {editingNameId === row.id ? (
                    <input
                      className="name-edit"
                      value={editingNameValue}
                      autoFocus
                      onChange={e => setEditingNameValue(e.target.value)}
                      onBlur={() => {
                        setEditingNameId(null);
                        updateRow({...row, name: editingNameValue});
                      }}
                    />
                  ) : (
                    <span
                      className="name"
                      onDoubleClick={() => {
                        setEditingNameId(row.id);
                        setEditingNameValue(row.name);
                      }}
                    >
                      {row.name}
                    </span>
                  )}
                </div>
                <div className="inline-edit">
                  <button className="icon-btn steper" onClick={() => updateRow({...row, stock: row.stock - 1})}><Minus size={14}/></button>
                  <span className="stock-display">{row.stock} / {row.total}</span>
                  <button className="icon-btn steper" onClick={() => updateRow({...row, stock: row.stock + 1})}><Plus size={14}/></button>
                </div>
                <div className="actions">
                  <button className="icon-btn save" onClick={() => updateRow(row)} title="บันทึก"><Save size={16}/></button>
                  <button className="icon-btn danger" onClick={() => deleteRow(row.id)} title="ลบ"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {showSheet && (
        <div className="sheet show">
          <div className="sheet-card">
            <div className="sheet-title">ดำเนินการสำเร็จ</div>
            <div className="sheet-icon">✔</div>
          </div>
        </div>
      )}
    </div>
  );
}
