import { useState } from "react";
import { Eye, EyeOff, UserPlus, LogIn, ShieldCheck, ArrowLeft } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

export default function Login() {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) return setError("กรุณากรอกข้อมูลให้ครบ");

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // กรณีที่ 1: เป็น Admin ให้เข้าสู่ระบบทันทีโดยไม่ผ่าน OTP
      if (data.step === "complete") {
        saveAuthAndRedirect(data);
      }
      // กรณีที่ 2: เป็น User/Staff ทั่วไป ให้ไปขั้นตอนกรอก OTP
      else if (data.step === "2fa") {
        setTempUserId(data.userId);
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    setError("");
    if (!otp || otp.length < 6) return setError("กรุณากรอกรหัส OTP 6 หลัก");

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      saveAuthAndRedirect(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAuthAndRedirect = (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("display_name", data.full_name);
    localStorage.setItem("user_role", data.role);
    localStorage.setItem("assigned_facility", data.assigned_facility);
    window.location.href = "/user/menu";
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-6 font-kanit">
        <div className="w-full max-w-[450px] bg-white rounded-[28px] p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-[#2b2346] mb-2">ยืนยันตัวตน 2 ขั้นตอน</h2>
          <p className="text-sm text-slate-500 mb-8">กรอกรหัส OTP 6 หลักที่ส่งไปยังอีเมลของคุณ</p>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full text-center text-4xl tracking-[1rem] font-black pb-4 border-b-2 border-primary outline-none text-primary"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-4 font-bold">{error}</p>}
          <button
            onClick={onVerifyOTP}
            disabled={loading}
            className="w-full py-4 mt-8 rounded-full bg-primary text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัสความปลอดภัย"}
          </button>
          <button onClick={() => setStep("login")} className="mt-6 text-slate-400 text-sm flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={16} /> กลับไปหน้าล็อกอิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-6 font-kanit">
      <div className="w-full max-w-[500px] bg-white rounded-[28px] p-10 md:p-12 text-center shadow-2xl">
        <div className="mb-6"><img src={dsaLogo} className="w-full h-[140px] object-contain mx-auto" /></div>
        <div className="space-y-1 mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[#2b2346]">ระบบจัดการข้อมูลสนามกีฬา</h1>
          <p className="text-sm text-[#756f8a]">UP-FMS | กองกิจการนิสิต มหาวิทยาลัยพะเยา</p>
        </div>
        <form className="space-y-6 text-left" onSubmit={onSubmitLogin}>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2b2346]">Username</label>
            <input type="text" className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-lg" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5 relative">
            <label className="text-sm font-bold text-[#2b2346]">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-lg pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-0 bottom-3 text-[#7c7894]" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={22} /> : <Eye size={22} />}</button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
          <button type="submit" className="w-full py-3.5 rounded-full text-white font-bold bg-gradient-to-r from-[#06b6d4] to-[#ec4899] shadow-lg flex items-center justify-center gap-2" disabled={loading}>
            <LogIn size={20} /> {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
          <button type="button" className="w-full py-3.5 rounded-full text-white font-bold bg-gradient-to-r from-[#4dd0e1] to-[#ec4899] shadow-md flex items-center justify-center gap-2" onClick={() => (window.location.href = `/register`)}>
            <UserPlus size={20} /> สร้างบัญชีใหม่
          </button>
        </form>
      </div>
    </div>
  );
}
