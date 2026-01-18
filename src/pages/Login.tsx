import { useState } from "react";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import dsaLogo from "../assets/dsa.png";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787"
).replace(/\/$/, "");

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.status === "pending") {
          throw new Error("บัญชีของคุณอยู่ระหว่างรอแอดมินอนุมัติและมอบสิทธิ์เข้าใช้งาน");
        }
        throw new Error(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }

      localStorage.setItem("display_name", data.full_name || data.username);
      localStorage.setItem("user_role", data.role);
      window.location.href = data.role === "staff" ? "/staff/menu" : "/user/menu";
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-6 font-kanit animate-in fade-in duration-500">
      <div className="w-full max-w-[500px] bg-white rounded-[28px] p-10 md:p-12 text-center shadow-[0_24px_60px_rgba(0,0,0,0.25)]">

        {/* Logo Section - แก้ไข src มาใช้ตัวแปร dsaLogo */}
        <div className="mb-6">
          <img
            src={dsaLogo}
            alt="กองกิจการนิสิต"
            className="w-full h-[140px] object-contain mx-auto"
          />
        </div>

        <div className="space-y-1 mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[#2b2346]">ระบบจัดการข้อมูลสนามกีฬา</h1>
          <h2 className="text-lg font-bold text-[#2b2346]">กองกิจการนิสิต มหาวิทยาลัยพะเยา</h2>
          <p className="text-sm text-[#756f8a] mt-2">UP-FMS | Field Management System</p>
        </div>

        <form className="space-y-6 text-left" onSubmit={onSubmit}>
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2b2346] ml-1">Username / ชื่อผู้ใช้</label>
            <input
              type="text"
              className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-bold text-[#2b2346] ml-1">Password / รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] transition-all text-lg pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-0 bottom-3 text-[#7c7894] hover:text-[#ec4899] cursor-pointer transition-colors"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3.5 mt-4 rounded-full text-white font-bold text-lg bg-gradient-to-r from-[#06b6d4] to-[#ec4899] hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          {/* Register Link Button */}
          <button
            type="button"
            className="w-full py-3.5 rounded-full text-white font-bold text-lg bg-gradient-to-r from-[#4dd0e1] to-[#ec4899] hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = `/register`)}
          >
            <UserPlus size={20} />
            สร้างบัญชีใหม่
          </button>
        </form>
      </div>
    </div>
  );
}
