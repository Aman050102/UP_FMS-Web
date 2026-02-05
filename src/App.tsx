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

// User Pages
import UserMenu from "./pages/users/UserMenu";
import CheckinPage from "./pages/users/CheckinPage";
import EquipmentPage from "./pages/users/EquipmentPage";
import CheckinFeedback from "./pages/users/CheckinFeedback";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* กลุ่มหน้าสำหรับนิสิต */}
      <Route element={<MainLayout role="user" />}>
        <Route path="/user/menu" element={<UserMenu />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/checkin_feedback" element={<CheckinFeedback />} />
      </Route>

      {/* กลุ่มหน้าสำหรับเจ้าหน้าที่ */}
      <Route element={<MainLayout role="staff" />}>
        <Route path="/staff/menu" element={<StaffMenu />} />
        <Route path="/staff/dashboard" element={<CheckinReportPage />} />
        <Route path="/staff/equipment" element={<StaffEquipmentManagePage />} />
        <Route
          path="/staff/borrow-ledger"
          element={<StaffBorrowLedgerPage />}
        />
        <Route path="/staff/document-management" element={<StaffDocumentManagement />} />
        <Route path="/staff/feedback" element={<StaffFeedbackView />} />
        <Route
          path="/staff/booking-manage"
          element={<StaffBookingManage />}
        />{" "}
        {/* จัดการการจองและพิมพ์ PDF */}
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
