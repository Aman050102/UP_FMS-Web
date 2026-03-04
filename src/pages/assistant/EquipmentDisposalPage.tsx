import React, { useState, useEffect } from "react";
import { AlertTriangle, Camera, Package, Hash, Send, X, User } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

export default function AssistantDisposalRequestPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const storedName = localStorage.getItem("full_name") || "ไม่ระบุชื่อ";

  const [formData, setFormData] = useState({
    equipment_id: "",
    qty: 1,
    reason: "",
    reporter_name: storedName,
    image_base64: ""
  });

  useEffect(() => {
    const name = localStorage.getItem("full_name");
    if (name) {
      setFormData(prev => ({ ...prev, reporter_name: name }));
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/api/staff/equipment/stock`)
      .then(res => res.json())
      .then(data => { if (data.ok) setStocks(data.equipments); });
  }, []);

  // ฟังก์ชันแปลงไฟล์รูปภาพเป็น Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("ขนาดรูปภาพต้องไม่เกิน 2MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image_base64: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.equipment_id || !formData.reason)
      return alert("กรุณาระบุอุปกรณ์และสาเหตุที่ชำรุด");

    setLoading(true);
    try {
      const selected = stocks.find(s => s.id === parseInt(formData.equipment_id));
      const res = await fetch(`${API}/api/equipment/disposal-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, equipment_name: selected?.name })
      });

      if (res.ok) {
        alert("ส่งรายงานเรียบร้อยแล้ว");
        setFormData({ ...formData, equipment_id: "", qty: 1, reason: "", image_base64: "" });
        setImagePreview(null);
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[650px] mx-auto p-6 font-kanit animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-2xl">
          <AlertTriangle className="text-red-500" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">แจ้งอุปกรณ์ชำรุด</h1>
          <p className="text-gray-400 text-sm">บันทึกข้อมูลอุปกรณ์เสียหายเพื่อขอตัดสต็อก</p>
        </div>
      </div>

      <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
        {/* รายข้อมูลผู้แจ้ง (Auto-fill) */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <User size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ผู้แจ้งรายการ</p>
            <p className="text-sm font-bold text-gray-700">{formData.reporter_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* เลือกอุปกรณ์ */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
              <Package size={14} /> รายการอุปกรณ์
            </label>
            <select
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm font-medium"
              value={formData.equipment_id}
              onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
            >
              <option value="">เลือกอุปกรณ์...</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* จำนวน */}
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
              <Hash size={14} /> จำนวน
            </label>
            <input
              type="number" min="1"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all text-center font-bold"
              value={formData.qty}
              onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) })}
            />
          </div>

          {/* รายละเอียด */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">อาการชำรุด / เหตุผลที่ส่งจำหน่าย</label>
            <textarea
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm min-h-[100px]"
              placeholder="ระบุรายละเอียดความเสียหาย..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          {/* อัปโหลดรูปภาพ */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
              <Camera size={14} /> แนบรูปภาพหลักฐาน (ถ้ามี)
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="text-gray-300 mb-2" size={24} />
                  <p className="text-xs text-gray-400">คลิกเพื่อถ่ายภาพหรือเลือกไฟล์</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-gray-100">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setFormData({ ...formData, image_base64: "" }); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-red-500 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-[0.98] disabled:opacity-50 mt-4"
        >
          {loading ? <span className="animate-pulse">กำลังประมวลผล...</span> : <><Send size={18} /> ยืนยันการแจ้งชำรุด</>}
        </button>
      </div>
    </div>
  );
}
