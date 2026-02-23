import { useState } from "react";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import dsaLogo from "../assets/dsa.png";
import client from "../lib/client"; // นำเข้า axios client ที่สร้างไว้

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) return setError("กรุณากรอกข้อมูลให้ครบ");

    try {
      setLoading(true);
      // เปลี่ยนจาก fetch เป็น client.post
      const res = await client.post("/api/auth/login", { username, password });

      const data = res.data; // Axios ดึง JSON มาให้ใน .data เลย

      // บันทึกข้อมูลที่ได้จาก Hono API ลง LocalStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", String(data.userId));
      localStorage.setItem("display_name", data.full_name);
      localStorage.setItem("user_image", data.avatar || "");
      localStorage.setItem("user_email", data.email);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("assigned_facility", data.assigned_facility);

      window.location.href = "/user/menu";
    } catch (err: any) {
      // ดึง error message ที่เราตั้งค่าไว้ใน interceptor ของ client.ts
      setError(err.message || "ล็อกอินไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e0e0] flex items-center justify-center p-6 font-kanit text-[#1e293b]">
      <div className="w-full max-w-[500px] bg-white rounded-[28px] p-10 md:p-12 text-center shadow-2xl">
        <div className="mb-6">
          <img src={dsaLogo} className="h-[120px] mx-auto object-contain" alt="Logo" />
        </div>
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl font-bold text-[#2b2346]">ระบบจัดการข้อมูลสนามกีฬา</h1>
          <p className="text-sm text-[#756f8a]">UP-FMS | กองกิจการนิสิต มหาวิทยาลัยพะเยา</p>
        </div>
        <form className="space-y-6 text-left" onSubmit={onSubmitLogin}>
          <div className="space-y-1.5">
            <label className="text-sm font-bold">Username</label>
            <input
              type="text"
              className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] text-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-sm font-bold">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full py-3 bg-transparent border-b border-[#d4d0e0] outline-none focus:border-[#ec4899] text-lg pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-0 bottom-3 text-[#7c7894]"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-bold bg-gradient-to-r from-[#06b6d4] to-[#ec4899] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <LogIn size={20} /> {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>

          <button
            type="button"
            className="w-full py-3.5 rounded-full text-white font-bold bg-gradient-to-r from-[#4dd0e1] to-[#ec4899] shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            onClick={() => (window.location.href = `/register`)}
          >
            <UserPlus size={20} /> สร้างบัญชีใหม่
          </button>
        </form>
      </div>
    </div>
  );
}
