import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// หมายเหตุ: อย่าลืม Import Font ภาษาไทย (เช่น THSarabunNew) เพื่อใช้ใน PDF
// import "../../fonts/THSarabun-normal.js";

export const exportToExcel = async (
  data: any[],
  summary: any,
  title: string,
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // 1. จัดรูปแบบหัวเอกสาร
  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value =
    `${title} (${new Date().toLocaleDateString("th-TH")})`;
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // 2. ใส่ข้อมูลสรุป
  worksheet.addRow(["สรุปยอดรวมผู้ใช้", summary.total, "คน"]);
  worksheet.addRow([]); // เว้นบรรทัด

  // 3. กำหนดหัวตาราง
  worksheet.addRow([
    "ลำดับ",
    "วันที่",
    "สนาม",
    "สนามย่อย",
    "นิสิต",
    "บุคลากร",
    "รวม",
  ]);

  // 4. วนลูปใส่ข้อมูลจาก filteredRows
  data.forEach((r, i) => {
    worksheet.addRow([
      i + 1,
      r.session_date,
      r.facility,
      r.sub_facility || "-",
      r.student_count,
      r.staff_count,
      r.student_count + r.staff_count,
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${title}.xlsx`);
};

export const exportToPDF = (data: any[], summary: any, title: string) => {
  const doc = new jsPDF();

  // ตั้งค่าฟอนต์ภาษาไทย (ถ้าติดตั้งแล้ว)
  // doc.addFont("THSarabun.ttf", "THSarabun", "normal");
  // doc.setFont("THSarabun");

  doc.setFontSize(18);
  doc.text(title, 105, 20, { align: "center" });

  // สร้างตารางสรุป
  const summaryBody = [
    ["สนามกลางแจ้ง", summary.outdoor],
    ["สนามแบดมินตัน", summary.badminton],
    ["สระว่ายน้ำ", summary.pool],
    ["ลู่และลาน", summary.track],
    ["รวมทั้งหมด", summary.total],
  ];

  (doc as any).autoTable({
    startY: 30,
    head: [["ประเภทสนาม", "จำนวนผู้เข้าใช้ (คน)"]],
    body: summaryBody,
    theme: "striped",
    headStyles: { fillColor: [93, 75, 156] }, // สีม่วง PALETTE
  });

  // สร้างตารางรายละเอียด
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["วันที่", "สนาม", "นิสิต", "บุคลากร", "รวม"]],
    body: data.map((r) => [
      r.session_date,
      r.facility,
      r.student_count,
      r.staff_count,
      r.student_count + r.staff_count,
    ]),
  });

  doc.save(`${title}.pdf`);
};
