import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facility, setFacility] = useState("outdoor");
  const [problems, setProblems] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://up-fms-api-hono.aman02012548.workers.dev"
  ).replace(/\/$/, "");

  const todayStr = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleRequestPermission = () => {
    const hasPermission = localStorage.getItem("file_access_permission");
    if (!hasPermission) {
      const isConfirm = window.confirm(
        "ขออนุญาตเข้าถึงกล้องและรูปภาพ เพื่ออัปโหลดหลักฐานการเข้าใช้งานสนามกีฬา",
      );
      if (isConfirm) {
        localStorage.setItem("file_access_permission", "true");
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดรูปภาพใหญ่เกินไป กรุณาใช้รูปที่มีขนาดไม่เกิน 5MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- [จุดแก้ไข]: ตรวจสอบจาก imagePreview แทน เพื่อให้ส่งข้อมูลได้แน่นอน ---
    if (!imagePreview) {
      alert("กรุณาแนบรูปภาพใบลงทะเบียน");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // ดึงไฟล์จาก ref ถ้าไม่มีให้แปลงจาก base64 preview (กรณีไฟล์หลุดจาก memory)
    let fileToSend = fileInputRef.current?.files?.[0];

    if (fileToSend) {
      formData.append("file", fileToSend);
    } else {
      // ป้องกันกรณีไฟล์ใน input หลุดแต่ยังมีรูปโชว์อยู่
      const res = await fetch(imagePreview);
      const blob = await res.blob();
      formData.append(
        "file",
        new File([blob], "feedback_image.jpg", { type: "image/jpeg" }),
      );
    }

    formData.append("facility", facility);
    formData.append("problems", problems);

    try {
      const response = await fetch(`${API}/api/feedback/submit`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        alert("ขอบคุณสำหรับความคิดเห็น ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
        navigate("/user/menu");
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error: any) {
      alert(`ไม่สามารถส่งข้อมูลได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-4 md:p-8 animate-in fade-in duration-500">
      <main className="max-w-[800px] mx-auto text-left">
        <section className="bg-surface rounded-3xl border border-border-main shadow-sm overflow-hidden">
          <div className="bg-primary/5 p-8 border-b border-border-main text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main mb-2">
              แบบฟอร์มแสดงความคิดเห็น
            </h1>
            <p className="text-text-muted">
              แสดงความคิดเห็นและแนบหลักฐานการใช้บริการสนามกีฬา
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-8">
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
                <label className="text-sm font-bold text-text-muted">
                  วันที่ดำเนินการ
                </label>
                <div className="p-3 bg-white border border-border-main rounded-xl text-primary font-bold">
                  {todayStr}
                </div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-text-main flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary" />
                  ส่งรูปภาพใบลงทะเบียน (Proof of Registration)
                </label>

                {!imagePreview ? (
                  <div
                    onClick={handleRequestPermission}
                    className="group block w-full aspect-video md:aspect-[21/9] border-2 border-dashed border-border-main rounded-2xl hover:border-primary hover:bg-primary-soft/30 transition-all cursor-pointer overflow-hidden"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                    <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-soft group-hover:text-primary transition-all">
                        <Camera size={32} />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-text-main font-bold">
                          คลิกเพื่อขออนุญาตและเลือกรูปภาพ
                        </span>
                        <span className="text-xs text-text-muted">
                          รองรับไฟล์ภาพ JPG, PNG (ไม่เกิน 5MB)
                        </span>
                      </div>
                    </div>
                  </div>
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
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-left">
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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#5f5aa2] text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-primary/20 hover:bg-[#4e4a8a] transition-all disabled:bg-gray-300 flex items-center justify-center gap-2 cursor-pointer"
                  disabled={loading}
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
