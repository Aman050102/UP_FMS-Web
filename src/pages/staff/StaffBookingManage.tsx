import { useNavigate } from "react-router-dom";
import { Hammer, ArrowLeft, Construction } from "lucide-react";

export default function FacilityBooking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-kanit flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* ตกแต่งพื้นหลังเล็กน้อย */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#5f5aa2] to-[#ec4899]"></div>

        {/* Icon แสดงสถานะ */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-[#5f5aa2] animate-bounce duration-[2000ms]">
              <Construction size={48} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ec4899] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
              <Hammer size={18} />
            </div>
          </div>
        </div>

        {/* ข้อความแจ้งเตือน */}
        <h1 className="text-2xl font-black text-slate-800 mb-3">
          ระบบจัดการและจองสนามกีฬา
        </h1>
        <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-bold mb-6">
          Coming Soon
        </div>

        <p className="text-slate-500 leading-relaxed mb-10">
          ขออภัยในความไม่สะดวก <br />
          <span className="font-medium text-slate-600">
            "ขณะนี้ระบบกำลังอยู่ในระหว่างการพัฒนา"
          </span>{" "}
          <br />
          เพื่อให้รองรับการใช้งานที่สะดวกและรวดเร็วที่สุดสำหรับนิสิตและบุคลากร
        </p>

        <p className="mt-8 text-[10px] text-slate-300 uppercase tracking-widest">
          UP-FMS | Division of Student Affairs
        </p>
      </div>
    </div>
  );
}
