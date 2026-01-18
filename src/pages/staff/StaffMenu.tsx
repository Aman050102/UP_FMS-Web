import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, PieChart, Package, ClipboardList } from "lucide-react";

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
      subtitle: "Sports Facility Usage Log",
      path: "/staff/dashboard", // เปลี่ยนให้ตรงกับ Sidebar
      icon: <FileText size={40} />
    },
    {
      title: "ข้อมูลสถิติการยืม-คืน",
      subtitle: "Equipment Loan Statistics",
      path: "/staff/borrow-stats", // เปลี่ยนให้ตรงกับ Sidebar
      icon: <PieChart size={40} />
    },
    {
      title: "จัดการอุปกรณ์กีฬา",
      subtitle: "Sports Equipment Management",
      path: "/staff/equipment",
      icon: <Package size={40} />
    },
    {
      title: "บันทึกการยืม-คืน",
      subtitle: "Equipment Loan Record",
      path: "/staff/borrow-ledger",
      icon: <ClipboardList size={40} />
    }
  ];
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-main font-kanit">
      <main className="flex-1 mt-header overflow-y-auto px-6 py-10 flex flex-col items-center custom-scrollbar">
        <div className="w-full max-w-[1100px] mx-auto">

          <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-[2.5rem] font-black text-text-main mb-2">
              ระบบจัดการสนามกีฬา
            </h1>
            <p className="text-[1.1rem] text-text-muted">
              ยินดีต้อนรับคุณ <span className="text-primary font-bold">{displayName}</span> (Staff)
            </p>
          </header>

          {/* ปรับ Grid ให้แสดงแถวละ 2 เมนู (md:grid-cols-2) และจำกัดความกว้างให้ดูสมดุล */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group bg-surface border border-border-main rounded-[24px] p-10 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary animate-in zoom-in-95 duration-300 shadow-sm"
              >
                <div className="w-24 h-24 bg-primary-soft text-primary rounded-[28px] flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:rotate-3">
                  {item.icon}
                </div>

                <b className="text-2xl text-text-main group-hover:text-primary transition-colors block mb-1">
                  {item.title}
                </b>
                <small className="text-text-muted block text-sm uppercase tracking-widest font-bold opacity-60">
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
