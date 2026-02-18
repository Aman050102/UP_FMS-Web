import { Routes, Route, Navigate } from "react-router-dom";

import StaffDocumentManagement from "./pages/staff/StaffDocumentManagement";
import UsageReport from "./pages/staff/UsageReport";

export default function Router() {
  return (
    <Routes>
      {/* หน้าเริ่มต้น */}
      <Route
        path="/"
        element={<Navigate to="/staff/documents" replace />}
      />

      {/* หน้าเมนูเอกสาร */}
      <Route
        path="/staff/documents"
        element={<StaffDocumentManagement />}
      />

      {/* หน้าเอกสาร A4 */}
      <Route
        path="/staff/usage-report"
        element={<UsageReport />}
      />

      {/* กันหลงทาง */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
