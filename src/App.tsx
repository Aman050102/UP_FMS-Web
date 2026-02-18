import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Staff Pages
import StaffMenu from "./pages/staff/StaffMenu";
import StaffEquipmentManagePage from "./pages/staff/StaffEquipmentManagePage";
import StaffBorrowLedgerPage from "./pages/staff/StaffBorrowLedgerPage";
import StaffDocumentManagement from "./pages/staff/StaffDocumentManagement";
import CheckinReportPage from "./pages/staff/CheckinReportPage";
import StaffFeedbackView from "./pages/staff/StaffFeedbackView";
import StaffBookingManage from "./pages/staff/StaffBookingManage";
import Notification from "./pages/staff/Notification";
import UsageReport from "./pages/staff/UsageReport";

// Student assistant Pages
import AssistantMenu from "./pages/assistant/AssistantMenu";
import CheckinPage from "./pages/assistant/CheckinPage";
import EquipmentPage from "./pages/assistant/EquipmentPage";
import CheckinFeedback from "./pages/assistant/CheckinFeedback";

// User Pages
import UserMenu from "./pages/user/UserMenu";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* กลุ่มหน้าสำหรับนิสิตทั่วไป */}
      <Route element={<MainLayout role="user" />}>
        <Route path="/user/menu" element={<UserMenu />} />
      </Route>

      {/* กลุ่มหน้าสำหรับนิสิตช่วยงาน (SA) - เปลี่ยน role เป็น assistant */}
      <Route element={<MainLayout role="assistant" />}>
        <Route path="/assistant/menu" element={<AssistantMenu />} />
        <Route path="/assistant/checkin" element={<CheckinPage />} />
        <Route path="/assistant/equipment" element={<EquipmentPage />} />
        <Route path="/assistant/checkin_feedback" element={<CheckinFeedback />} />
      </Route>

      {/* กลุ่มหน้าสำหรับเจ้าหน้าที่ */}
      <Route element={<MainLayout role="staff" />}>
        <Route path="/staff/menu" element={<StaffMenu />} />
        <Route path="/staff/dashboard" element={<CheckinReportPage />} />
        <Route path="/staff/equipment" element={<StaffEquipmentManagePage />} />
        <Route path="/staff/borrow-ledger" element={<StaffBorrowLedgerPage />} />
        <Route path="/staff/document-management" element={<StaffDocumentManagement />} />
        <Route path="/staff/feedback" element={<StaffFeedbackView />} />
        <Route path="/staff/booking-manage" element={<StaffBookingManage />} />
        <Route path="/staff/notifications" element={<Notification />} />
        <Route path="/staff/usage-report" element={<UsageReport />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
