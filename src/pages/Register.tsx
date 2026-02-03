import { useState } from "react";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
// นำเข้ารูปภาพจาก src/assets เพื่อให้แสดงผลได้ถูกต้อง
import dsaLogo from "../assets/dsa.png";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787"
).replace(/\/$/, "");

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+$/.test(s.trim());

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!fullName || !email || !username || !pw || !pw2)
      return setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    if (!isEmail(email)) return setError("รูปแบบอีเมลไม่ถูกต้อง");
    if (pw !== pw2) return setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    if (pw.length < 6)
      return setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");

    try {
      const payload = {
        full_name: fullName,
        email: email,
        username: username,
        password: pw,
        is_approved: false,
      };

      const res = await fetch(`${API}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `สมัครสมาชิกไม่สำเร็จ`);

      setOk("ลงทะเบียนสำเร็จ! กรุณารอแอดมินตรวจสอบและอนุมัติบัญชีของคุณ");
      setTimeout(() => (window.location.href = "/login"), 3000);
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-4 md:p-8 font-kanit animate-in fade-in duration-500">
      <div className="w-full max-w-[720px] bg-white rounded-[28px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
        {/* Logo & Header - แก้ไขให้ใช้ตัวแปร dsaLogo */}
        <div className="flex justify-center mb-4">
          <img
            src={dsaLogo}
            alt="กองกิจการนิสิต"
            className="w-full max-w-[500px] h-[110px] object-contain"
          />
        </div>

        <div className="text-center space-y-1 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2b2346]">
            สร้างบัญชีผู้ใช้งานใหม่
          </h1>
          <p className="text-sm text-[#8b86a4]">
            UP - Field Management System (UP-FMS)
          </p>
          <p className="text-sm text-[#8b86a4]">
            สมัครสมาชิกเพื่อเข้าใช้งานระบบ
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit} noValidate>
          {/* Row 1: Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#2b2346] ml-1">
              ชื่อ-นามสกุล / Full Name
            </label>
            <input
              className="w-full py-2 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-sm md:text-base placeholder:text-gray-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="นาย ใจดี มีสุข"
            />
          </div>

          {/* Row 2: Email & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346] ml-1">
                อีเมล / E-mail
              </label>
              <input
                type="email"
                className="w-full py-2 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-sm md:text-base placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@up.ac.th"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346] ml-1">
                ชื่อผู้ใช้ / Username
              </label>
              <input
                className="w-full py-2 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-sm md:text-base placeholder:text-gray-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="สำหรับใช้ Login"
              />
            </div>
          </div>

          {/* Row 3: Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-bold text-[#2b2346] ml-1">
                รหัสผ่าน / Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full py-2 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-sm md:text-base pr-10"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 bottom-2 text-[#7c7894] hover:text-[#ec4899] transition-colors cursor-pointer"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#2b2346] ml-1">
                ยืนยันรหัสผ่าน / Confirm Password
              </label>
              <input
                type="password"
                className="w-full py-2 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-sm md:text-base"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <p className="text-sm text-[#e11d48] font-medium animate-pulse">
              {error}
            </p>
          )}
          {ok && (
            <p className="text-sm text-[#16a34a] font-medium bg-green-50 p-3 rounded-lg border border-green-100">
              {ok}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-4">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] text-white font-bold rounded-full shadow-[0_10px_30px_rgba(236,72,153,0.35)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              ลงทะเบียน
            </button>

            <button
              type="button"
              className="w-full py-3 bg-gradient-to-r from-[#4dd0e1] to-[#ec4899] text-white font-bold rounded-full hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              onClick={() => (window.location.href = "/login")}
            >
              <ArrowLeft size={20} />
              กลับไปหน้าล็อกอิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
