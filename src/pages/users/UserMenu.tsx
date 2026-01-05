import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Trophy } from "lucide-react"; // ใช้ไอคอนชุดเดียวกับ Sidebar
import "../../styles/menu.css";

export default function UserMenu() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    setDisplayName(localStorage.getItem("display_name") || "นิสิตช่วยงาน");
  }, []);

  return (
    <div className="menu-container">
      <section className="grid">
        {/* ใช้โครงสร้าง tile-inner เพื่อให้ CSS จัดระเบียบไอคอนและข้อความสวยงาม */}
        <div className="tile" onClick={() => navigate("/checkin")}>
          <div className="tile-inner">
            <CheckCircle size={60} strokeWidth={2.5} color="#5f5aa2" />
            <b>Check-in สนาม</b>
            <small>บันทึกการเข้าใช้งานสนาม</small>
          </div>
        </div>

        <div className="tile" onClick={() => navigate("/equipment")}>
          <div className="tile-inner">
            <Trophy size={60} strokeWidth={2.5} color="#5f5aa2" />
            <b>ยืม-คืนอุปกรณ์</b>
            <small>จัดการรายการอุปกรณ์กีฬา</small>
          </div>
        </div>
      </section>
    </div>
  );
}
