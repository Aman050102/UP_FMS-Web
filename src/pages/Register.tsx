import { useEffect, useMemo, useState } from "react";
import "../styles/register.css";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");
type Role = "person" | "staff";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+$/.test(s.trim());

export default function Register() {
  const [role, setRole] = useState<Role>("person");
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const r = q.get("role");
    if (r === "staff" || r === "person") setRole(r);
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const faculties = useMemo(() => [
    "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ", "คณะพลังงานและสิ่งแวดล้อม",
    "คณะเทคโนโลยีสารสนเทศและการสื่อสาร", "คณะพยาบาลศาสตร์",
    "คณะแพทยศาสตร์", "คณะทันตแพทยศาสตร์", "คณะสาธารณสุขศาสตร์",
    "คณะเภสัชศาสตร์", "คณะสหเวชศาสตร์", "คณะวิศวกรรมศาสตร์",
    "คณะวิทยาศาสตร์", "คณะวิทยาศาสตร์การแพทย์", "คณะรัฐศาสตร์และสังคมศาสตร์",
    "คณะนิติศาสตร์", "คณะบริหารธุรกิจและนิเทศศาสตร์", "คณะศิลปศาสตร์",
    "คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์", "วิทยาลัยการศึกษา",
  ], []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!username || !email || !pw || !pw2) return setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    if (!isEmail(email)) return setError("รูปแบบอีเมลไม่ถูกต้อง");
    if (pw !== pw2) return setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");

    if (role === "person") {
      if (!/^6\d{7}$/.test(studentId)) return setError("รหัสนิสิตต้องขึ้นต้นด้วย 6 และมี 8 หลัก");
      if (!faculty) return setError("กรุณาเลือกคณะ");
    }

    try {
      const payload = role === "person"
          ? { role, username, email, password: pw, student_id: studentId, faculty }
          : { role, username, email, password: pw };

      const res = await fetch(`${API}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `สมัครสมาชิกไม่สำเร็จ`);
      }

      setOk("สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ…");
      setTimeout(() => (window.location.href = `/login?role=${role}`), 900);
    } catch (err: any) {
      setError(err?.message || "เชื่อมต่อไม่ได้ ตรวจสอบการเปิดเซิร์ฟเวอร์พอร์ต 8787");
    }
  };

  return (
    <div className="login-bg reg-bg">
      <div className="login-card reg-card">
        <div className="login-logo"><img src="/img/dsa.png" alt="กองกิจการนิสิต" /></div>
        <h1 className="login-title-th">Create a new account</h1>
        <p className="login-title-en">UP - Field Management System (UP-FMS)</p>
        <p className="reg-subtitle">Account type:<strong> {role === "person" ? "นิสิตช่วยงาน" : "แอดมิน"}</strong></p>

        <div className="segmented-row">
          <div className="segmented segmented-lg" role="tablist">
            <button type="button" role="tab" aria-selected={role === "person"} onClick={() => setRole("person")}>นิสิตช่วยงาน</button>
            <button type="button" role="tab" aria-selected={role === "staff"} onClick={() => setRole("staff")}>แอดมิน</button>
            <span className="segmented-indicator" style={{ transform: role === "person" ? "translateX(0%)" : "translateX(100%)", width: "50%" }} />
          </div>
        </div>

        <form className="reg-form" onSubmit={submit} noValidate>
          <div className="row2">
            <label className="field">
              <span className="field-label">ชื่อผู้ใช้ / Username<small> (ใช้สำหรับเข้าสู่ระบบ)</small></span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label className="field">
              <span className="field-label">อีเมล / E-mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          </div>

          <div className="row2">
            <label className="field">
              <span className="field-label">รหัสผ่าน / Password</span>
              <div className="field-input-with-toggle">
                <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} required />
                <button type="button" className="pw-eye-btn" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
                          : <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M1 1 23 23M9.9 4.24A10.75 10.75 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-2.2 3.39M6.47 6.47A10.75 10.75 0 0 0 1 11s4 7 11 7a11 11 0 0 0 5.47-1.47"/></svg>}
                </button>
              </div>
            </label>
            <label className="field">
              <span className="field-label">ยืนยันรหัสผ่าน / Confirm password</span>
              <div className="field-input-with-toggle">
                <input type={showPw2 ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
                <button type="button" className="pw-eye-btn" onClick={() => setShowPw2((v) => !v)}>
                  {showPw2 ? <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg>
                           : <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M1 1 23 23M9.9 4.24A10.75 10.75 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-2.2 3.39M6.47 6.47A10.75 10.75 0 0 0 1 11s4 7 11 7a11 11 0 0 0 5.47-1.47"/></svg>}
                </button>
              </div>
            </label>
          </div>

          {role === "person" && (
            <div className="row2">
              <label className="field">
                <span className="field-label">รหัสนิสิต / Student ID<small> (ขึ้นต้นด้วย 6 รวม 8 หลัก)</small></span>
                <input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
              </label>
              <label className="field">
                <span className="field-label">คณะ / Faculty</span>
                <select value={faculty} onChange={(e) => setFaculty(e.target.value)} required>
                  <option value="">— เลือกคณะ —</option>
                  {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
          {ok && <p className="ok-msg">{ok}</p>}
          <button className="btn-login" type="submit">Create account</button>
          <button type="button" className="btn-secondary" onClick={() => (window.location.href = `/login?role=${role}`)}>Back to Login</button>
        </form>
      </div>
    </div>
  );
}
