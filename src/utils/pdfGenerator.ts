// src/utils/pdfGenerator.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateUPCourtForm = (data: any) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ใส่ Logic การวาดรูปและข้อความที่ผมเขียนให้ก่อนหน้านี้ลงตรงนี้
  doc.setFontSize(20);
  doc.text("แบบฟอร์มขอใช้สนามกีฬา", 105, 35, { align: "center" });
  // ... (โค้ดที่เหลือ)

  doc.save("UP_Stadium_Form.pdf");
};
