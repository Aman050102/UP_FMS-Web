import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ฟังก์ชันดึงชื่อเดือนภาษาไทย
const getThaiMonthYear = () => {
  const date = new Date();
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
};

// --- Excel Export ---
export const exportMonthlyEquipmentExcel = async (items: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Monthly Report");
  const monthYear = getThaiMonthYear();

  // 1. หัวเอกสารตามแบบฟอร์ม มพ. [cite: 32-35]
  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = `สรุปสถิติประจำเดือน ${monthYear}`;
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  // 2. หัวตาราง [cite: 27]
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "รายการอุปกรณ์",
    "จำนวนนิสิต",
    "จำนวนบุคลากร",
    "รวมผู้ใช้งาน",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // 3. ใส่ข้อมูลจริง (สมมติว่า item มีฟิลด์ student_usage และ staff_usage)
  items.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.name, // [cite: 37]
      item.student_usage || 0,
      item.staff_usage || 0,
      (item.student_usage || 0) + (item.staff_usage || 0),
    ]);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Equipment_Report_${monthYear}.xlsx`);
};

// --- PDF Export ---
export const exportMonthlyEquipmentPDF = (items: any[]) => {
  const doc = new jsPDF();
  const monthYear = getThaiMonthYear();

  // ตั้งค่าหัวกระดาษ [cite: 30-33]
  doc.setFontSize(18);
  doc.text(`สรุปสถิติประจำเดือน ${monthYear}`, 105, 20, { align: "center" });

  (doc as any).autoTable({
    startY: 30,
    head: [["ลำดับ", "รายการอุปกรณ์", "นิสิต", "บุคลากร", "รวม"]],
    body: items.map((item, index) => [
      index + 1,
      item.name,
      item.student_usage || 0,
      item.staff_usage || 0,
      (item.student_usage || 0) + (item.staff_usage || 0),
    ]),
    theme: "grid",
    styles: { font: "THSarabun", fontSize: 14 },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "right" },
    },
  });

  doc.save(`Equipment_Report_${monthYear}.pdf`);
};
