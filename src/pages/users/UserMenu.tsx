import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Trophy, MessageSquareText } from "lucide-react";

export default function UserMenu() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("display_name") || "ผู้ใช้งาน";
    setDisplayName(name);
  }, []);

  const menuItems = [
    { title: "บันทึกการเข้าใช้สนาม", subtitle: "Sports Facility Usage Log", path: "/checkin", icon: <CheckCircle2 size={40} /> },
    { title: "ยืม-คืนอุปกรณ์", subtitle: "Equipment Loan Record", path: "/equipment", icon: <Trophy size={40} /> },
    { title: "แบบฟอร์มแสดงความคิดเห็น", subtitle: "Feedback Form", path: "/checkin_feedback", icon: <MessageSquareText size={40} /> }
  ];

  return (

    <div className="flex flex-col h-screen overflow-hidden">


      <main className="flex-1 mt-header overflow-y-auto px-6 py-10 flex flex-col items-center custom-scrollbar">

        {/* .container-fixed: คุมความกว้าง */}
        <div className="w-full max-w-[1100px] mx-auto">

          {/* .menu-header */}
          <header className="text-center mb-12">
            <h1 className="text-[2rem] font-bold text-text-main mb-2 leading-tight">ระบบจัดการสนามกีฬา</h1>
            <p className="text-[1.1rem] text-text-muted font-light">ยินดีต้อนรับคุณ {displayName}</p>
          </header>

          {/* .menu-grid: ใช้ Grid แบบ Auto-fit */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 w-full">
            {menuItems.map((item, index) => (

              // .menu-tile
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group bg-surface border border-border-main rounded-lg p-[40px_24px] flex flex-col items-center text-center cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:shadow-xl hover:border-primary"
              >
                {/* .icon-wrapper */}
                <div className="w-20 h-20 bg-primary-soft text-primary rounded-[20px] flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  {item.icon}
                </div>

                <b className="text-lg text-text-main group-hover:text-primary transition-colors">{item.title}</b>
                <p className="text-sm text-text-muted mt-1">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
