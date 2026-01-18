import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, ImageIcon, Send } from "lucide-react";

const FACILITY_OPTIONS = [
  { k: "outdoor", name: "สนามกลางแจ้ง" },
  { k: "badminton", name: "สนามแบดมินตัน" },
  { k: "track", name: "สนามลู่-ลาน" },
  { k: "pool", name: "สระว่ายน้ำ" },
];

export default function CheckinFeedback() {
  const navigate = useNavigate();
  const [facility, setFacility] = useState("outdoor");
  const [problems, setProblems] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("กรุณาแนบรูปภาพใบลงทะเบียน");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      alert("ขอบคุณสำหรับความคิดเห็น");
      setLoading(false);
      navigate("/user/menu");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 animate-in fade-in duration-500">
      <main className="max-w-[800px] mx-auto">
        <section className="bg-surface rounded-3xl border border-border-main shadow-sm overflow-hidden">

          {/* Form Header */}
          <div className="bg-primary/5 p-8 border-b border-border-main text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main mb-2">
              แบบฟอร์มแสดงความคิดเห็น
            </h1>
            <p className="text-text-muted">
              แสดงความคิดเห็นและแนบหลักฐานการใช้บริการสนามกีฬา
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-main rounded-2xl border border-border-main">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted flex items-center gap-2">
                   สถานที่ที่ใช้งาน
                </label>
                <select
                  className="w-full p-3 bg-white border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                >
                  {FACILITY_OPTIONS.map((opt) => (
                    <option key={opt.k} value={opt.k}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted">วันที่ดำเนินการ</label>
                <div className="p-3 bg-white border border-border-main rounded-xl text-primary font-bold">
                  {todayStr}
                </div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={onSubmit}>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-text-main flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary" />
                  ส่งรูปภาพใบลงทะเบียน (Proof of Registration)
                </label>

                {!imagePreview ? (
                  <label className="group block w-full aspect-video md:aspect-[21/9] border-2 border-dashed border-border-main rounded-2xl hover:border-primary hover:bg-primary-soft/30 transition-all cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
                      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-soft group-hover:text-primary transition-all">
                        <Camera size={32} />
                      </div>
                      <div className="text-center">
                        <span className="block text-text-main font-bold">คลิกเพื่อถ่ายรูปหรือเลือกรูปภาพ</span>
                        <span className="text-xs text-text-muted">รองรับไฟล์ภาพ JPG, PNG</span>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="relative group animate-in zoom-in-95 duration-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full aspect-video md:aspect-[21/9] rounded-2xl object-cover border-2 border-primary shadow-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      onClick={() => setImagePreview(null)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Suggestions Section */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-text-main flex items-center gap-2">
                   ปัญหาที่พบหรือข้อเสนอแนะเพิ่มเติม
                </label>
                <textarea
                  className="w-full min-h-[150px] p-4 bg-white border border-border-main rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 resize-none"
                  placeholder="ระบุรายละเอียดเพิ่มเติมที่คุณต้องการแจ้งเจ้าหน้าที่ (ถ้ามี)..."
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:bg-gray-300 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                  disabled={loading || !imagePreview}
                >
                  <Send size={20} />
                  {loading ? "กำลังบันทึก..." : "ยืนยันการส่งข้อมูล"}
                </button>
                <button
                  type="button"
                  className="px-8 py-4 bg-gray-100 text-text-muted rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => navigate("/user/menu")}
                >
                  กลับหน้าหลัก
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
