import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Shared Pages
import ProfileSettings from "./pages/shared/ProfileSettings";

// Staff Pages
import StaffMenu from "./pages/staff/StaffMenu";
import StaffEquipmentManagePage from "./pages/staff/StaffEquipmentManagePage";
import StaffBorrowLedgerPage from "./pages/staff/StaffBorrowLedgerPage";
import StaffDocumentManagement from "./pages/staff/StaffDocumentManagement";
import CheckinReportPage from "./pages/staff/CheckinReportPage";
import StaffFeedbackView from "./pages/staff/StaffFeedbackView";
import StaffBookingManage from "./pages/staff/StaffBookingManage";
import Notification from "./pages/staff/Notification";

// Admin Pages
import ManageAccess from "./pages/admin/ManageAccess";

// Student assistant Pages
import AssistantMenu from "./pages/assistant/AssistantMenu";
import CheckinPage from "./pages/assistant/CheckinPage";
import EquipmentPage from "./pages/assistant/EquipmentPage";
import CheckinFeedback from "./pages/assistant/CheckinFeedback";

// User Pages
import UserMenu from "./pages/user/UserMenu";
import FacilityBooking from "./pages/user/FacilityBooking";

export default function App() {
  // ดึงค่าสิทธิ์ปัจจุบันจากระบบมาใช้งานสำหรับ Layout ส่วนกลาง
  const userRole = (localStorage.getItem("user_role")?.toLowerCase() || "user") as "user" | "staff" | "assistant" | "admin";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* กลุ่มหน้าสำหรับนิสิตทั่วไป */}
      <Route element={<MainLayout role="user" />}>
        <Route path="/user/menu" element={<UserMenu />} />
        <Route path="/user/booking" element={<FacilityBooking />} />
      </Route>

      {/* กลุ่มหน้าสำหรับนิสิตช่วยงาน (SA) */}
      <Route element={<MainLayout role="assistant" />}>
        <Route path="/assistant/menu" element={<AssistantMenu />} />
        <Route path="/assistant/checkin" element={<CheckinPage />} />
        <Route path="/assistant/equipment" element={<EquipmentPage />} />
        <Route path="/assistant/checkin_feedback" element={<CheckinFeedback />} />
      </Route>

      {/* กลุ่มหน้าสำหรับเจ้าหน้าที่/แอดมิน */}
      <Route element={<MainLayout role="staff" />}>
        <Route path="/staff/menu" element={<StaffMenu />} />
        <Route path="/staff/dashboard" element={<CheckinReportPage />} />
        <Route path="/staff/equipment" element={<StaffEquipmentManagePage />} />
        <Route path="/staff/borrow-ledger" element={<StaffBorrowLedgerPage />} />
        <Route path="/staff/document-management" element={<StaffDocumentManagement />} />
        <Route path="/staff/feedback" element={<StaffFeedbackView />} />
        <Route path="/staff/booking-manage" element={<StaffBookingManage />} />
        <Route path="/staff/notifications" element={<Notification />} />
        <Route path="/admin/manage-access" element={<ManageAccess />} />
        <Route path="/admin/dashboard" element={<CheckinReportPage />} />
      </Route>

      {/* 4. หน้าจัดการโปรไฟล์ (สลับ Layout ตามสิทธิ์ที่ Login อยู่จริง) */}
      <Route element={<MainLayout role={userRole} />}>
        <Route path="/profile-settings" element={<ProfileSettings />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
