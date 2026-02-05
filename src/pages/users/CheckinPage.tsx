import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  UserRound,
  CalendarDays,
  History,
} from "lucide-react";

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

  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [currentFacility, setCurrentFacility] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [students, setStudents] = useState("");
  const [staff, setStaff] = useState("");
  const [error, setError] = useState("");
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBackdating = selectedDate !== todayISO;

  useEffect(() => {
    const raw = localStorage.getItem("checkin_progress_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      setDoneMap(parsed[selectedDate] || {});
    } else {
      setDoneMap({});
    }
  }, [selectedDate]);

  const formatThaiDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
      setError("สนามนี้ถูกบันทึกไปแล้ว");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND}/api/checkin/event/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          facility: currentFacility,
          sub_facility: currentFacility === "outdoor" ? selectedSub?.name : "",
          students: Number(students) || 0,
          staff: Number(staff) || 0,
          action: "in",
        }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      const raw = localStorage.getItem("checkin_progress_v2");
      const fullStore = raw ? JSON.parse(raw) : {};
      const nextDone = { ...doneMap, [key as string]: true };
      fullStore[selectedDate] = nextDone;
      setDoneMap(nextDone);
      localStorage.setItem("checkin_progress_v2", JSON.stringify(fullStore));

      document.getElementById("overlay")?.classList.remove("hidden");
      document.getElementById("overlay")?.classList.add("flex");
      setTimeout(() => {
        document.getElementById("overlay")?.classList.add("hidden");
        setCurrentFacility(null);
        setSelectedSub(null);
        setStudents("");
        setStaff("");
        setIsSubmitting(false);
      }, 1500);
    } catch (e: any) {
      setError(e.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-kanit pb-10">
      {/* Top Navigation / Status Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-5 py-3">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isBackdating ? "bg-amber-400 animate-pulse" : "bg-green-500"}`}
            />
            <span className="text-sm font-bold text-slate-600">
              {isBackdating ? "โหมดบันทึกย้อนหลัง" : "ระบบบันทึกปกติ"}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <CalendarDays size={16} className="text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              max={todayISO}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentFacility(null);
              }}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto p-5 md:p-10">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            บันทึกสถิติการใช้สนาม
          </h1>
          <p className="text-slate-500 mt-1">
            ประจำวันที่{" "}
            <span className="text-primary font-bold">
              {formatThaiDate(selectedDate)}
            </span>
          </p>
        </header>

        {!currentFacility ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {TOP.map((f) => {
              const isOutdoorFull =
                f.k === "outdoor" &&
                OUTDOOR_SUBS.every((s) => doneMap[`outdoor:${s.k}`]);
              const isDone =
                (f.k !== "outdoor" && doneMap[f.k]) || isOutdoorFull;

              return (
                <button
                  key={f.k}
                  onClick={() => setCurrentFacility(f.k)}
                  className={`group relative flex flex-col items-center p-8 rounded-[32px] border-2 transition-all duration-300 shadow-sm
                    ${
                      isDone && f.k !== "outdoor"
                        ? "bg-slate-50 border-slate-100 opacity-60 cursor-default"
                        : "bg-white border-transparent hover:border-primary hover:shadow-xl hover:-translate-y-2"
                    }`}
                >
                  <div
                    className={`text-5xl mb-4 transition-transform group-hover:scale-125 ${isDone && f.k !== "outdoor" ? "grayscale" : ""}`}
                  >
                    {f.icon}
                  </div>
                  <span className="text-lg font-bold text-slate-700">
                    {f.name}
                  </span>
                  {isDone && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-12 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => {
                setCurrentFacility(null);
                setSelectedSub(null);
                setError("");
              }}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold transition-colors mb-8 group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              เปลี่ยนสนาม
            </button>

            {currentFacility === "outdoor" && !selectedSub ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 text-center">
                  เลือกสนามย่อย
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {OUTDOOR_SUBS.map((s) => {
                    const isDone = doneMap[`outdoor:${s.k}`];
                    return (
                      <button
                        key={s.k}
                        disabled={isDone}
                        onClick={() => setSelectedSub(s)}
                        className={`p-5 rounded-2xl font-bold border-2 transition-all flex items-center justify-between
                          ${
                            isDone
                              ? "bg-slate-50 border-slate-100 text-slate-300"
                              : "bg-white border-slate-100 hover:border-primary hover:text-primary hover:bg-primary/5"
                          }`}
                      >
                        {s.name}
                        {isDone && <CheckCircle2 size={18} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                  <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                    {
                      FACILITY_LABELS[
                        currentFacility as keyof typeof FACILITY_LABELS
                      ]
                    }
                  </span>
                  <h2 className="text-4xl font-black text-slate-800 mt-3">
                    {selectedSub
                      ? selectedSub.name
                      : FACILITY_LABELS[
                          currentFacility as keyof typeof FACILITY_LABELS
                        ]}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-slate-500 font-bold ml-2 flex items-center gap-2">
                      <UserRound size={18} className="text-primary" />{" "}
                      จำนวนนิสิต
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={students}
                      onChange={(e) => setStudents(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-3xl font-black text-center text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-slate-500 font-bold ml-2 flex items-center gap-2">
                      <Users size={18} className="text-indigo-500" />{" "}
                      จำนวนบุคลากร
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-3xl font-black text-center text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-bold rounded-r-xl animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={doCheckin}
                  disabled={isSubmitting}
                  className="w-full py-6 bg-slate-900 text-white rounded-[28px] text-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-primary transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>บันทึกข้อมูลเรียบร้อย</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Overlay Success */}
      <div
        id="overlay"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-[1000] p-6"
      >
        <div className="bg-white p-10 rounded-[40px] text-center max-w-sm w-full shadow-2xl animate-in zoom-in-90">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">สำเร็จ!</h3>
          <p className="text-slate-500 mt-2">บันทึกสถิติสนามเรียบร้อยแล้ว</p>
        </div>
      </div>
    </div>
  );
}
