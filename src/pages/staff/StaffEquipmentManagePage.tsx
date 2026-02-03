import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Boxes,
  LayoutGrid,
  ListFilter,
} from "lucide-react";

// กำหนด URL ของ API จาก Environment หรือค่า Default
const API = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://up-fms-api-hono.aman02012548.workers.dev"
).replace(/\/$/, "");

export default function StaffEquipmentManagePage() {
  const [items, setItems] = useState<any[]>([]);
  const [equipName, setEquipName] = useState("");
  const [equipStock, setEquipStock] = useState("10");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // ดึงรายการอุปกรณ์ทั้งหมดจากระบบ
  const fetchList = async () => {
    try {
      // ตรวจสอบว่า API URL ของคุณไม่มี / ปิดท้าย และเรียกไปที่ /stock
      const res = await fetch(`${API}/api/staff/equipment/stock`);

      // ตรวจสอบสถานะก่อนแปลงเป็น JSON
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        return;
      }

      const data = await res.json();
      if (data.ok) setItems(data.equipments);
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // ฟังก์ชันบันทึกข้อมูล (ทั้งเพิ่มใหม่และแก้ไข)
  const handleSave = async () => {
    if (!equipName) return alert("กรุณาระบุชื่ออุปกรณ์");
    if (parseInt(equipStock) < 0) return alert("จำนวนสต็อกต้องไม่ติดลบ");

    setLoading(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      // กำหนด URL ให้ตรงกับโครงสร้าง Hono Router
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
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบอุปกรณ์
  const deleteItem = async (id: number) => {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้ออกจากระบบ?")) return;
    try {
      const res = await fetch(`${API}/api/staff/equipment/${id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchList();
      } else {
        alert("ลบไม่สำเร็จ");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 font-kanit animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <LayoutGrid size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              จัดการคลังอุปกรณ์กีฬา
            </h1>
            <p className="text-gray-500 text-xs">
              ระบบควบคุมและติดตามรายการอุปกรณ์ส่วนกลาง
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Boxes size={18} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-600">
            อุปกรณ์ทั้งหมด: <span className="text-primary">{items.length}</span>{" "}
            รายการ
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Form Section (Top Panel) */}
        <section
          className={`border transition-all duration-300 rounded-[24px] shadow-sm overflow-hidden ${editingId ? "bg-orange-50/30 border-orange-200" : "bg-white border-gray-200"}`}
        >
          <div className="p-1 px-6 bg-gray-50/80 border-b border-inherit flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 py-2 flex items-center gap-2">
              {editingId ? (
                <Edit3 size={14} className="text-orange-500" />
              ) : (
                <Plus size={14} className="text-primary" />
              )}
              {editingId
                ? "Edit Mode: กำลังแก้ไขข้อมูล"
                : "Entry Mode: ลงทะเบียนอุปกรณ์ใหม่"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-[3] space-y-2 w-full">
                <label className="text-xs font-bold text-gray-500 ml-1">
                  ชื่อรายการอุปกรณ์
                </label>
                <input
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={equipName}
                  onChange={(e) => setEquipName(e.target.value)}
                  placeholder="ตัวอย่าง: ฟุตบอลหนังเบอร์ 5"
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <label className="text-xs font-bold text-gray-500 ml-1">
                  จำนวนสต็อก
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center font-black text-primary"
                  value={equipStock}
                  onChange={(e) => setEquipStock(e.target.value)}
                />
              </div>
              <div className="flex-[1.5] flex gap-2 w-full">
                <button
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50 ${
                    editingId
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100"
                      : "bg-primary hover:bg-primary-dark text-white shadow-primary/10"
                  }`}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse">กำลังบันทึก...</span>
                  ) : (
                    <>
                      {editingId ? <Save size={18} /> : <Plus size={18} />}
                      {editingId ? "บันทึกการแก้ไข" : "เพิ่มอุปกรณ์"}
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center"
                    onClick={() => {
                      setEditingId(null);
                      setEquipName("");
                      setEquipStock("10");
                    }}
                    title="ยกเลิกการแก้ไข"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Inventory Grid Section */}
        <section className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ListFilter size={18} className="text-gray-400" />
              <h4 className="font-bold text-gray-700">บัญชีรายชื่ออุปกรณ์</h4>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Package size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm italic">ไม่มีอุปกรณ์ในระบบ</p>
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                        <Package
                          size={22}
                          className="text-gray-400 group-hover:text-primary"
                        />
                      </div>
                      <div>
                        <strong className="block text-gray-800 font-bold leading-tight">
                          {item.name}
                        </strong>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          Inventory ID: #{item.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          Available
                        </span>
                        <span className="text-lg font-black text-primary leading-none">
                          {item.stock}
                        </span>
                      </div>
                      <div className="flex flex-col border-l border-gray-100 pl-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          Total
                        </span>
                        <span className="text-lg font-black text-gray-400 leading-none">
                          {item.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary-soft/40 rounded-lg transition-all"
                        onClick={() => {
                          setEditingId(item.id);
                          setEquipName(item.name);
                          setEquipStock(item.total.toString());
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
