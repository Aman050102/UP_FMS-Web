import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Users, UserRound } from "lucide-react";

const TOP = [
  { k: "outdoor", name: "สนามกลางแจ้ง", icon: "🏸" },
  { k: "badminton", name: "สนามแบดมินตัน", icon: "🏸" },
  { k: "track", name: "สนามลู่-ลาน", icon: "🏃" },
  { k: "pool", name: "สระว่ายน้ำ", icon: "🏊" },
];

const OUTDOOR_SUBS = [
  { k: "tennis", name: "เทนนิส" },
  { k: "basketball", name: "บาสเกตบอล" },
  { k: "futsal", name: "ฟุตซอล" },
  { k: "football", name: "ฟุตบอล" },
  { k: "volleyball", name: "วอลเลย์บอล" },
  { k: "sepak_takraw", name: "เซปักตะกร้อ" },
];

const FACILITY_LABELS = {
  outdoor: "สนามกลางแจ้ง",
  badminton: "สนามแบดมินตัน",
  track: "สนามลู่-ลาน",
  pool: "สระว่ายน้ำ",
};

export default function CheckinPage() {
  const BACKEND = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8787"
  ).replace(/\/$/, "");
  const [currentFacility, setCurrentFacility] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [students, setStudents] = useState("");
  const [staff, setStaff] = useState("");
  const [error, setError] = useState("");
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isoDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const raw = localStorage.getItem("checkin_progress");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === isoDate) setDoneMap(parsed.done || {});
    }
  }, [isoDate]);

  async function doCheckin() {
    if (!students && !staff) {
      setError("กรุณาระบุจำนวนผู้เข้าใช้");
      return;
    }
    const key =
      currentFacility === "outdoor"
        ? `outdoor:${selectedSub?.k}`
        : currentFacility;
    if (key && doneMap[key]) {
      setError("วันนี้บันทึกสนามนี้ไปแล้ว");
      return;
    }

    setIsSubmitting(true);
    const body = {
      facility: currentFacility,
      sub_facility: currentFacility === "outdoor" ? selectedSub?.name : "",
      students: Number(students) || 0,
      staff: Number(staff) || 0,
      action: "in",
    };

    try {
      const res = await fetch(`${BACKEND}/api/checkin/event/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      const nextDone = { ...doneMap, [key as string]: true };
      setDoneMap(nextDone);
      localStorage.setItem(
        "checkin_progress",
        JSON.stringify({ date: isoDate, done: nextDone }),
      );

      document.getElementById("overlay")?.classList.remove("hidden");
      document.getElementById("overlay")?.classList.add("flex");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setError(e.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-main font-kanit p-5 md:p-15 animate-in fade-in duration-500">
      <main className="max-w-[1100px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 mt-5">
          <div className="inline-flex items-center px-4 py-1.5 bg-surface text-primary border border-primary/20 rounded-xl text-sm font-semibold mb-4 shadow-sm hover:bg-primary-soft transition-colors cursor-default">
            {todayStr}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-2">
            บันทึกการใช้สนาม
          </h1>
        </div>

        {!currentFacility ? (
          <section className="bg-surface rounded-3xl shadow-sm border border-border-main p-6 md:p-10">
            <h3 className="text-xl font-bold mb-6 text-center text-text-main">
              เลือกประเภทสนาม
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TOP.map((f) => (
                <button
                  key={f.k}
                  className="flex flex-col sm:flex-col md:flex-col items-center gap-3 p-6 md:p-10 bg-gray-50 border-2 border-transparent rounded-[20px] cursor-pointer transition-all duration-300 hover:bg-white hover:border-primary hover:-translate-y-1 hover:shadow-lg active:scale-95 group"
                  onClick={() => setCurrentFacility(f.k)}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {f.icon}
                  </span>
                  <span className="font-bold text-lg text-slate-700">
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-surface rounded-3xl shadow-sm border border-primary/10 p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-300">
            {/* Back Button */}
            <button
              className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto bg-gray-100 text-text-muted border border-border-main px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:bg-white hover:text-primary hover:border-primary hover:-translate-x-1 mb-6"
              onClick={() => {
                setCurrentFacility(null);
                setSelectedSub(null);
                setError("");
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              <span>กลับไปหน้าเลือกสนาม</span>
            </button>

            {currentFacility === "outdoor" && !selectedSub ? (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold mb-6 text-center">
                  ระบุสนามกลางแจ้งย่อย
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {OUTDOOR_SUBS.map((s) => {
                    const isDone = doneMap[`outdoor:${s.k}`];
                    return (
                      <button
                        key={s.k}
                        className={`p-4 rounded-xl font-semibold border-1.5 transition-all cursor-pointer flex justify-center items-center gap-2 ${
                          isDone
                            ? "bg-green-50 border-green-200 text-green-600 opacity-70 cursor-not-allowed"
                            : "bg-white border-slate-200 hover:border-primary hover:text-primary"
                        }`}
                        onClick={() => !isDone && setSelectedSub(s)}
                        disabled={isDone}
                      >
                        {s.name}{" "}
                        {isDone && <span className="text-green-500">✔</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-[600px] mx-auto animate-in zoom-in-95 duration-200">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-text-main">
                    {
                      FACILITY_LABELS[
                        currentFacility as keyof typeof FACILITY_LABELS
                      ]
                    }
                    {selectedSub && (
                      <span className="text-primary">
                        {" "}
                        / {selectedSub.name}
                      </span>
                    )}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-bold text-slate-600">
                      <UserRound size={16} /> จำนวนนิสิต (คน)
                    </label>
                    <input
                      className="w-full p-4.5 border-2 border-slate-200 rounded-2xl text-2xl font-bold text-center outline-none focus:border-primary focus:bg-primary-soft/10 transition-all"
                      type="number"
                      placeholder="0"
                      value={students}
                      onChange={(e) => setStudents(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-bold text-slate-600">
                      <Users size={16} /> จำนวนบุคลากร (คน)
                    </label>
                    <input
                      className="w-full p-4.5 border-2 border-slate-200 rounded-2xl text-2xl font-bold text-center outline-none focus:border-primary focus:bg-primary-soft/10 transition-all"
                      type="number"
                      placeholder="0"
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg text-center font-bold mb-4 animate-bounce">
                    {error}
                  </div>
                )}

                <button
                  className="w-full md:max-w-xs mx-auto block p-5 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-[18px] text-xl font-extrabold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={doCheckin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการบันทึก"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Success Overlay */}
      <div
        id="overlay"
        className="fixed inset-0 bg-slate-900/85 backdrop-blur-md hidden items-center justify-center z-[1000] p-5"
      >
        <div className="bg-white p-12 rounded-[32px] text-center w-full max-w-[420px] shadow-2xl animate-in zoom-in-50 duration-300">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
            บันทึกเรียบร้อย
          </h2>
          <p className="text-slate-500">
            ข้อมูลผู้เข้าใช้งานสนามถูกจัดเก็บในระบบแล้ว
          </p>
        </div>
      </div>
    </div>
  );
}
