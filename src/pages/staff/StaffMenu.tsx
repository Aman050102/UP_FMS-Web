import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  PieChart,
  Package,
  ClipboardList,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

export default function StaffMenu() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const dn = localStorage.getItem("display_name") || "เจ้าหน้าที่";
    setDisplayName(dn);
  }, []);

  const menuItems = [
    {
      title: "ข้อมูลการเข้าใช้สนาม",
      subtitle: "Usage Dashboard",
      path: "/staff/dashboard",
      icon: <FileText size={40} />,
    },
    {
      title: "จัดการเอกสาร",
      subtitle: "Document Management",
      path: "/staff/borrow-stats",
      icon: <ClipboardList size={40} />,
    },
    {
      title: "จัดการอุปกรณ์กีฬา",
      subtitle: "Equipment Management",
      path: "/staff/equipment",
      icon: <Package size={40} />,
    },
    {
      title: "บันทึกการยืม-คืน",
      subtitle: "Loan Ledger",
      path: "/staff/borrow-ledger",
      icon: <PieChart size={40} />,
    },
    {
      title: "บันทึกรายงานการใช้งาน",
      subtitle: "Student Feedback",
      path: "/staff/feedback",
      icon: <MessageSquare size={40} />,
    },
    {
      title: "จัดการการจองสนาม",
      subtitle: "Facility Booking",
      path: "/staff/booking-manage",
      icon: <CalendarCheck size={40} />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-main font-kanit">
      <main className="flex-1 mt-header px-6 py-10 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto">
          <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-[2.5rem] font-black text-text-main mb-2">
              ระบบจัดการสนามกีฬา
            </h1>
            <p className="text-[1.1rem] text-text-muted">
              ยินดีต้อนรับคุณ{" "}
              <span className="text-primary font-bold">{displayName}</span>{" "}
              (Staff)
            </p>
          </header>

          {/* ปรับการจัดเรียงเป็นแถวละ 3 เมนู (lg:grid-cols-3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group bg-surface border border-border-main rounded-[32px] p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary shadow-sm animate-in zoom-in-95"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-20 h-20 bg-primary-soft text-primary rounded-[24px] flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                  {item.icon}
                </div>

                <b className="text-xl text-text-main group-hover:text-primary transition-colors block mb-1">
                  {item.title}
                </b>
                <small className="text-text-muted block text-[10px] uppercase tracking-widest font-bold opacity-60">
                  {item.subtitle}
                </small>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
