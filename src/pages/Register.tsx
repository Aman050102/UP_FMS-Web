import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, XCircle, Send } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");

export default function Register() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");

  const [strength, setStrength] = useState({
    len: false, upper: false, lower: false, num: false, special: false
  });

  useEffect(() => {
    setStrength({
      len: pw.length >= 12 && pw.length <= 16,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /[0-9]/.test(pw),
      special: /[@$!%*?&]/.test(pw),
    });
  }, [pw]);

  const isStrong = Object.values(strength).every(Boolean);

  const onRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setOk("");
    if (!isStrong) return setError("รหัสผ่านไม่ปลอดภัยตามนโยบายที่กำหนด");
    if (pw !== pw2) return setError("รหัสผ่านไม่ตรงกัน");

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, username, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onConfirmRegister = async () => {
    setError("");
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/register/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, username, password: pw, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOk("ลงทะเบียนสำเร็จ! กรุณารอแอดมินมอบสิทธิ์การใช้งานสนามให้ท่าน");
      setTimeout(() => (window.location.href = "/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-6 font-kanit">
        <div className="w-full max-w-[450px] bg-white rounded-[28px] p-10 text-center shadow-2xl animate-in zoom-in-95">
          <Send size={50} className="mx-auto text-[#ec4899] mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-[#2b2346] mb-2">ยืนยันอีเมลของคุณ</h2>
          <p className="text-sm text-slate-500 mb-8">เราส่งรหัส OTP 6 หลักไปที่อีเมล {email} แล้ว</p>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full text-center text-4xl tracking-[1rem] font-bold pb-4 border-b-2 border-[#ec4899] outline-none text-[#ec4899]"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-4 font-bold">{error}</p>}
          <button
            onClick={onConfirmRegister}
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
          </button>
          <button onClick={() => setStep("form")} className="mt-6 text-slate-400 text-sm flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={16} /> กลับไปแก้ไขข้อมูล
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-4 md:p-8 font-kanit">
      <div className="w-full max-w-[720px] bg-white rounded-[28px] p-8 md:p-10 shadow-2xl">
        <div className="flex justify-center mb-4">
          <img src={dsaLogo} className="w-full max-w-[500px] h-[110px] object-contain" />
        </div>
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2b2346]">สร้างบัญชีผู้ใช้งานใหม่</h1>
          <p className="text-sm text-[#8b86a4]">UP-FMS | กองกิจการนิสิต มหาวิทยาลัยพะเยา</p>
        </div>
        <form className="space-y-5" onSubmit={onRegisterRequest}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#2b2346]">ชื่อ-นามสกุล / Full Name</label>
            <input
              className="w-full py-2 border-b border-[#d4d0e0] outline-none focus:border-[#ec4899]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346]">อีเมล</label>
              <input
                type="email"
                className="w-full py-2 border-b border-[#d4d0e0] outline-none focus:border-[#ec4899]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346]">ชื่อผู้ใช้ (Username)</label>
              <input
                className="w-full py-2 border-b border-[#d4d0e0] outline-none focus:border-[#ec4899]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-[#2b2346]">รหัสผ่าน (12-16 ตัว + สัญลักษณ์)</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full py-2 border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] pr-10"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 bottom-2 text-[#7c7894]"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2 p-3 bg-slate-50 rounded-xl text-[10px]">
                <PolicyItem label="12-16 ตัวอักษร" valid={strength.len} />
                <PolicyItem label="ตัวพิมพ์ใหญ่ A-Z" valid={strength.upper} />
                <PolicyItem label="ตัวพิมพ์เล็ก a-z" valid={strength.lower} />
                <PolicyItem label="ตัวเลข 0-9" valid={strength.num} />
                <PolicyItem label="สัญลักษณ์พิเศษ" valid={strength.special} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346]">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                className="w-full py-2 border-b border-[#d4d0e0] outline-none focus:border-[#ec4899]"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 font-bold">{error}</p>}
          {ok && <p className="text-sm text-green-600 font-bold bg-green-50 p-3 rounded-lg border border-green-100">{ok}</p>}
          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={!isStrong || loading}
              className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] text-white font-bold rounded-full shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "กำลังส่งข้อมูล..." : "ลงทะเบียน"}
            </button>
            <button
              type="button"
              className="w-full py-3 bg-gray-100 text-slate-500 font-bold rounded-full transition-all"
              onClick={() => (window.location.href = "/login")}
            >
              <ArrowLeft size={20} className="inline mr-2" /> กลับไปหน้าล็อกอิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PolicyItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${valid ? 'text-green-600' : 'text-slate-400'}`}>
      {valid ? <ShieldCheck size={12} /> : <XCircle size={12} />} {label}
    </div>
  );
}
