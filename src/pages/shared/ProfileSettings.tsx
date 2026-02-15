import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Lock,
  Mail,
  Camera,
  Save,
  Key,
  UserCircle,
  ShieldCheck,
  XCircle,
  Eye,
  EyeOff,
  Send,
  ShieldAlert,
  ChevronRight,
  Loader2,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787"
).replace(/\/$/, "");

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<"none" | "email" | "password">("none");
  const [otpValue, setOtpValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: localStorage.getItem("display_name") || "",
    email: localStorage.getItem("user_email") || "",
    username: localStorage.getItem("username") || "",
    image: localStorage.getItem("user_image") || null,
  });

  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [strength, setStrength] = useState({
    len: false,
    upper: false,
    lower: false,
    num: false,
    special: false,
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

  // ฟังก์ชันขออนุญาตเข้าถึงอุปกรณ์
  const handleRequestPermission = () => {
    const isConfirm = window.confirm(
      "อนุญาตให้เข้าถึงคลังภาพ เพื่อเปลี่ยนรูปโปรไฟล์ของคุณ",
    );
    if (isConfirm && fileInputRef.current) {
      fileInputRef.current.click(); // เปิดหน้าต่างเลือกไฟล์
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) return alert("ไฟล์ต้องมีขนาดไม่เกิน 2MB");

    const formData = new FormData();
    formData.append("file", file);
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
    formData.append("userId", userId);

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/upload-avatar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("user_image", data.imageUrl);
        setProfile({ ...profile, image: data.imageUrl });
        window.dispatchEvent(new Event("profileUpdated"));
        alert("อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("การอัปโหลดขัดข้อง: " + err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // ล้างค่า input
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          full_name: profile.fullName,
          email: profile.email,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        localStorage.setItem("display_name", profile.fullName);
        window.dispatchEvent(new Event("profileUpdated"));
        alert("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (otpValue.length !== 6) return alert("กรุณากรอกรหัส 6 หลัก");
    if (otpStep === "email") localStorage.setItem("user_email", profile.email);
    window.dispatchEvent(new Event("profileUpdated"));
    alert("แก้ไขข้อมูลความปลอดภัยสำเร็จ");
    setOtpStep("none");
    setOtpValue("");
  };

  // ตัวแรกของชื่อ
  const initial = profile.fullName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-kanit p-4 md:p-10 text-[#1e293b]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">
          Account Settings
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-72 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <nav className="space-y-1">
              <MenuBtn
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
                icon={<User size={18} />}
                label="My Profile"
              />
              <MenuBtn
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
                icon={<Lock size={18} />}
                label="Security"
              />
            </nav>
          </div>

          <div className="flex-1 w-full">
            {otpStep !== "none" ? (
              <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100 animate-in zoom-in-95">
                <Send size={48} className="mx-auto text-[#ec4899] mb-4" />
                <h2 className="text-2xl font-bold mb-2">ยืนยันตัวตน (OTP)</h2>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full max-w-[280px] text-center text-4xl tracking-[1rem] font-bold border-b-4 border-[#ec4899] outline-none mb-10 text-[#ec4899]"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="000000"
                />
                <div className="flex gap-4 max-w-sm mx-auto">
                  <button
                    onClick={() => setOtpStep("none")}
                    className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    className="flex-1 py-3 bg-[#ec4899] text-white rounded-2xl font-bold shadow-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="p-8 md:p-12">
                  {activeTab === "profile" ? (
                    <form onSubmit={handleUpdateName} className="space-y-10">
                      <div className="flex items-center gap-6 pb-10 border-b border-slate-50">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full bg-[#5f5aa2] flex items-center justify-center border-4 border-white shadow-md overflow-hidden relative text-white text-4xl font-bold">
                            {profile.image && profile.image !== "null" ? (
                              <img
                                src={profile.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                            {loading && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          {/* เปลี่ยนเป็นปุ่มขออนุญาตแทน input ตรงๆ */}
                          <button
                            type="button"
                            onClick={handleRequestPermission}
                            className="absolute bottom-0 right-0 p-2 bg-[#5f5aa2] text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                          >
                            <Camera size={14} />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">
                            {profile.fullName}
                          </h3>
                          <p className="text-sm text-slate-400">
                            @{profile.username}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField
                          label="Username (Primary ID)"
                          value={profile.username}
                          disabled
                        />
                        <InputField
                          label="Full Name"
                          value={profile.fullName}
                          onChange={(v: string) =>
                            setProfile({ ...profile, fullName: v })
                          }
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-10 py-3 bg-[#5f5aa2] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-[#4e4a8a] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}{" "}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-12">
                      <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest">
                          Email Address
                        </h4>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-1 w-full">
                            <InputField
                              label="New Email"
                              value={profile.email}
                              onChange={(v: string) =>
                                setProfile({ ...profile, email: v })
                              }
                            />
                          </div>
                          <button
                            onClick={() => setOtpStep("email")}
                            className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs"
                          >
                            Change Email
                          </button>
                        </div>
                      </section>
                      <hr className="border-slate-50" />
                      <section className="space-y-6">
                        <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest">
                          Login & Password
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative">
                            <InputField
                              label="New Password"
                              type={showPw ? "text" : "password"}
                              value={pw}
                              onChange={setPw}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              className="absolute right-4 top-10 text-slate-300"
                            >
                              {showPw ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                          <InputField
                            label="Confirm Password"
                            type="password"
                            value={pwConfirm}
                            onChange={setPwConfirm}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setOtpStep("password")}
                            disabled={!isStrong}
                            className="px-10 py-3 bg-[#ec4899] text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-100 disabled:opacity-30"
                          >
                            Change Password
                          </button>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${active ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-400 hover:bg-slate-50"}`}
    >
      <div className="flex items-center gap-4">
        {icon} <span className="text-sm">{label}</span>
      </div>
      <ChevronRight
        size={16}
        className={active ? "opacity-100" : "opacity-0"}
      />
    </button>
  );
}

function InputField({ label, value, onChange, disabled, type = "text" }: any) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">
        {label}
      </label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-5 py-4 rounded-2xl text-sm border-none outline-none transition-all ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-slate-50 focus:ring-2 focus:ring-indigo-400 shadow-inner"}`}
      />
    </div>
  );
}
