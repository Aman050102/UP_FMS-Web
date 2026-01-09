import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import MainLayoutStaff from "./components/MainLayoutStaff"; // Layout เฉพาะของ Staff

import Login from "./pages/Login";
import Register from "./pages/Register";

// ===== users =====
import UserMenu from "./pages/users/UserMenu";
import CheckinPage from "./pages/users/CheckinPage";
import CheckinFeedback from "./pages/users/CheckinFeedback";
import EquipmentPage from "./pages/users/EquipmentPage";

// ===== staff =====
import StaffMenu from "./pages/staff/StaffMenu";
import StaffEquipmentManagePage from "./pages/staff/StaffEquipmentManagePage";
import StaffBorrowLedgerPage from "./pages/staff/StaffBorrowLedgerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* กลุ่ม User: ใช้ Layout พื้นฐาน */}
      <Route element={<MainLayout role="user" />}>
        <Route path="/user/menu" element={<UserMenu />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/checkin_feedback" element={<CheckinFeedback />} />
        <Route path="/equipment" element={<EquipmentPage />} />
      </Route>

      {/* กลุ่ม Staff: ใช้ Layout เฉพาะที่มี Sidebar และ Notification */}
      <Route element={<MainLayoutStaff />}>
        <Route path="/staff/menu" element={<StaffMenu />} />
        {/* ปรับ Path ให้ตรงกับ Sidebar ที่คุณตั้งไว้ */}
        <Route path="/staff/equipment" element={<StaffEquipmentManagePage />} />
        <Route path="/staff/borrow-ledger" element={<StaffBorrowLedgerPage />} />
        {/* เพิ่มหน้าอื่นๆ ของ Staff ที่นี่เพื่อให้เมนูเหมือนกันทุกหน้า */}
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
