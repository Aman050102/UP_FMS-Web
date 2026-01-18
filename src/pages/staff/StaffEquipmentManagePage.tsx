import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Trash2, Edit3, X, Save, Boxes } from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

export default function StaffEquipmentManagePage() {
  const [displayName] = useState(localStorage.getItem("display_name") || "เจ้าหน้าที่");
  const [items, setItems] = useState<any[]>([]);
  const [equipName, setEquipName] = useState("");
  const [equipStock, setEquipStock] = useState("10");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API}/api/equipment/stock/`);
      const data = await res.json();
      if (data.ok) setItems(data.equipments);
    } catch (e) {
      console.error("Load failed");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSave = async () => {
    if (!equipName) return alert("กรุณาระบุชื่ออุปกรณ์");
    setLoading(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `${API}/api/staff/equipment/${editingId}/`
        : `${API}/api/staff/equipment/`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: equipName,
          stock: parseInt(equipStock),
          total: parseInt(equipStock),
        }),
      });

      if (res.ok) {
        setEquipName("");
        setEquipStock("10");
        setEditingId(null);
        fetchList();
      } else {
        const data = await res.json();
        alert(data.error || "บันทึกไม่สำเร็จ");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้ออกจากระบบ?")) return;
    try {
      const res = await fetch(`${API}/api/staff/equipment/${id}/`, { method: "DELETE" });
      if (res.ok) fetchList();
    } catch (e) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5 font-kanit animate-in fade-in duration-500">

      {/* Sub-navigation Tabs */}
      <nav className="flex gap-4 mb-8 border-b border-border-main">
        <Link to="/staff/equipment" className="pb-3 px-2 border-b-2 border-primary text-primary font-bold transition-all">
          จัดการอุปกรณ์
        </Link>
        <Link to="/staff/borrow-ledger" className="pb-3 px-2 border-b-2 border-transparent text-text-muted hover:text-text-main transition-all">
          บันทึกการยืม-คืน
        </Link>
      </nav>

      <div className="space-y-6">
        {/* ส่วนเพิ่ม/แก้ไขอุปกรณ์ (Form Panel) */}
        <section className="bg-surface border border-border-main rounded-2xl p-6 shadow-sm ring-4 ring-primary/5">
          <h4 className="text-lg font-bold text-primary flex items-center gap-2 mb-6">
            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
            {editingId ? "แก้ไขข้อมูลอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่เข้าระบบ"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted ml-1">ชื่ออุปกรณ์</label>
              <input
                className="p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-main/50"
                value={equipName}
                onChange={(e) => setEquipName(e.target.value)}
                placeholder="เช่น ลูกบาสเกตบอล (Mikasa)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted ml-1">จำนวนสต็อกทั้งหมด</label>
              <input
                type="number"
                className="p-3 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-bg-main/50 text-center font-bold"
                value={equipStock}
                onChange={(e) => setEquipStock(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
              onClick={handleSave}
              disabled={loading}
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? "บันทึกการแก้ไข" : "เพิ่มเข้าคลังอุปกรณ์"}
            </button>
            {editingId && (
              <button
                className="px-6 py-3.5 bg-gray-100 text-text-muted rounded-xl font-bold hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-2"
                onClick={() => { setEditingId(null); setEquipName(""); setEquipStock("10"); }}
              >
                <X size={18} /> ยกเลิก
              </button>
            )}
          </div>
        </section>

        {/* ตารางแสดงรายการ (Inventory List) */}
        <section className="bg-surface border border-border-main rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
            <Boxes size={20} className="text-primary" /> รายการอุปกรณ์ในคลังปัจจุบัน
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.length === 0 && (
              <div className="col-span-full py-20 text-center text-text-muted italic bg-bg-main rounded-xl border border-dashed border-border-main">
                ไม่มีอุปกรณ์ในระบบ
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-bg-main/30 border border-border-main rounded-xl hover:border-primary transition-all group animate-in zoom-in-95 duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    <Package size={24} />
                  </div>
                  <div>
                    <strong className="block text-text-main">{item.name}</strong>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      <span className="font-bold text-primary bg-primary-soft px-1.5 rounded">คงเหลือ: {item.stock}</span>
                      <span>/</span>
                      <span>ทั้งหมด: {item.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="p-2.5 bg-white text-text-muted rounded-lg border border-border-main hover:text-primary hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      setEditingId(item.id);
                      setEquipName(item.name);
                      setEquipStock(item.total.toString());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    title="แก้ไข"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="p-2.5 bg-white text-red-400 rounded-lg border border-border-main hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                    onClick={() => deleteItem(item.id)}
                    title="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
