import { useState, useEffect } from "react";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Filter, History } from "lucide-react";

export default function StaffDocumentManagement() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH ข้อมูลรายงานทั้งหมด =================
  const fetchReports = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      const start = `${year}-${month}-01`;
      const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];

      const newReports: any[] = [];

      // --- 1. Fetch ข้อมูลเข้าสนาม ---
      const checkinRes = await fetch(`${API_BASE}/api/admin/checkins?from=${start}&to=${end}`);
      const checkinJson = await checkinRes.json();
      const checkinRows = Array.isArray(checkinJson) ? checkinJson : checkinJson.data || [];

      if (checkinRows.length > 0) {
        const totalCheckin = checkinRows.reduce((sum: number, r: any) =>
          sum + Number(r.student_count || 0) + Number(r.staff_count || 0), 0
        );
        newReports.push({
          id: 1,
          type: "checkin",
          rawData: checkinRows,
          code: `DOC-${selectedMonth.replace("-", "")}-001`,
          monthThai: new Date(start).toLocaleDateString("th-TH", { year: "numeric", month: "long" }),
          title: `รายงานสรุปคนเข้าใช้สนาม (${totalCheckin.toLocaleString()} คน)`,
          source: "บันทึกเข้าสนาม",
        });
      }

      // --- 2. Fetch ข้อมูลการยืมอุปกรณ์ ---
      const borrowRes = await fetch(`${API_BASE}/api/equipment/stats?from=${start}&to=${end}`);
      const borrowJson = await borrowRes.json();
      const borrowRows = borrowJson.rows || (Array.isArray(borrowJson) ? borrowJson : []);

      if (borrowRows.length > 0) {
        const totalBorrow = borrowJson.total || borrowRows.reduce((sum: number, r: any) => sum + Number(r.qty || r.total || 0), 0);
        newReports.push({
          id: 2,
          type: "borrow",
          rawData: borrowRows,
          code: `DOC-${selectedMonth.replace("-", "")}-002`,
          monthThai: new Date(start).toLocaleDateString("th-TH", { year: "numeric", month: "long" }),
          title: `รายงานสรุปการยืมอุปกรณ์ (${totalBorrow.toLocaleString()} รายการ)`,
          source: "ระบบยืม-คืนอุปกรณ์",
        });
      }

      setReports(newReports);
    } catch (err) {
      console.error("Fetch error:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [selectedMonth]);

  // ================= EXPORT EXCEL: เข้าใช้สนาม (2 Sheets) =================
  const handleExportCheckinExcel = (reportData: any) => {
    const rows = reportData.rawData;
    const styleTotal = { font: { bold: true }, fill: { fgColor: { rgb: "E2E8F0" } } };

    // --- SHEET 1: สรุปรายวัน ---
    const grouped: any = {};
    rows.forEach((r: any) => {
      const date = r.session_date;
      if (!grouped[date]) {
        grouped[date] = { pool_student: 0, pool_staff: 0, track_student: 0, track_staff: 0, outdoor_student: 0, outdoor_staff: 0, badminton_student: 0, badminton_staff: 0 };
      }
      grouped[date][`${r.facility}_student`] += Number(r.student_count || 0);
      grouped[date][`${r.facility}_staff`] += Number(r.staff_count || 0);
    });

    const tableData1: any[] = [];
    let grandTotal1 = { pool_s: 0, pool_st: 0, track_s: 0, track_st: 0, out_s: 0, out_st: 0, bad_s: 0, bad_st: 0, all: 0 };

    Object.keys(grouped).sort().forEach(date => {
      const g = grouped[date];
      const rowSum = (Object.values(g) as number[]).reduce((a, b) => a + b, 0);
      tableData1.push([date, g.pool_student, g.pool_staff, g.track_student, g.track_staff, g.outdoor_student, g.outdoor_staff, g.badminton_student, g.badminton_staff, rowSum]);
      grandTotal1.pool_s += g.pool_student; grandTotal1.pool_st += g.pool_staff;
      grandTotal1.track_s += g.track_student; grandTotal1.track_st += g.track_staff;
      grandTotal1.out_s += g.outdoor_student; grandTotal1.out_st += g.outdoor_staff;
      grandTotal1.bad_s += g.badminton_student; grandTotal1.bad_st += g.badminton_staff;
      grandTotal1.all += rowSum;
    });

    // แถวรวมที่มี Style
    const summaryRow1 = [
      { v: "รวม", s: styleTotal },
      { v: grandTotal1.pool_s, s: styleTotal }, { v: grandTotal1.pool_st, s: styleTotal },
      { v: grandTotal1.track_s, s: styleTotal }, { v: grandTotal1.track_st, s: styleTotal },
      { v: grandTotal1.out_s, s: styleTotal }, { v: grandTotal1.out_st, s: styleTotal },
      { v: grandTotal1.bad_s, s: styleTotal }, { v: grandTotal1.bad_st, s: styleTotal },
      { v: grandTotal1.all, s: styleTotal }
    ];
    tableData1.push(summaryRow1);

    const ws1 = XLSX.utils.aoa_to_sheet([
      ["สถิติการให้บริการสนามกีฬา"], [],
      ["วันที่", "สระว่ายน้ำ", "", "สนามลู่-ลาน", "", "สนามกีฬากลางแจ้ง", "", "สนามแบดมินตัน", "", "รวม"],
      ["", "นิสิต", "บุคลากร", "นิสิต", "บุคลากร", "นิสิต", "บุคลากร", "นิสิต", "บุคลากร", ""],
      ...tableData1
    ]);
    ws1["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } }, { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } }
    ];

    // --- SHEET 2: สนามกลางแจ้ง ---
    const outdoorMap: any = { "badminton": "สนามแบดมินตัน", "volleyball": "สนามวอลเลย์บอล", "sepak": "สนามเซปักตะกร้อ", "basketball": "สนามบาสเกตบอล", "football": "สนามฟุตบอล", "tennis": "สนามเทนนิส", "futsal": "สนามฟุตซอล" };
    const outdoorStats: any = {};
    rows.forEach((r: any) => {
      if (r.facility === "outdoor" && r.sub_facility) {
        const thaiName = outdoorMap[r.sub_facility] || r.sub_facility;
        if (!outdoorStats[thaiName]) outdoorStats[thaiName] = { student: 0, staff: 0 };
        outdoorStats[thaiName].student += Number(r.student_count || 0);
        outdoorStats[thaiName].staff += Number(r.staff_count || 0);
      }
    });

    const sheet2Rows: any[] = [];
    let idx2 = 1;
    let totalS2 = 0, totalSt2 = 0;
    Object.keys(outdoorStats).forEach(name => {
      const s = outdoorStats[name];
      sheet2Rows.push([idx2++, name, s.student, s.staff, s.student + s.staff]);
      totalS2 += s.student; totalSt2 += s.staff;
    });

    const summaryRow2 = [
      { v: "", s: styleTotal }, { v: "รวม", s: styleTotal },
      { v: totalS2, s: styleTotal }, { v: totalSt2, s: styleTotal },
      { v: totalS2 + totalSt2, s: styleTotal }
    ];
    sheet2Rows.push(summaryRow2);

    const ws2 = XLSX.utils.aoa_to_sheet([
      ["สรุปสถิติผู้ใช้บริการสนามกีฬากลางแจ้งแยกแต่ละสนาม"], [],
      ["ลำดับ", "รายการ", "จำนวนผู้ใช้บริการ", "", "รวม"],
      ["", "", "นิสิต", "บุคลากร", ""],
      ...sheet2Rows
    ]);
    ws2["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } },
      { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "สรุปรายวัน");
    XLSX.utils.book_append_sheet(wb, ws2, "สนามกลางแจ้ง");
    XLSX.writeFile(wb, `Checkin_Report_${reportData.code}.xlsx`);
  };

  // ================= EXPORT EXCEL: ยืมอุปกรณ์ (รายวัน + สรุป) =================
  const handleExportBorrowExcel = async (reportData: any) => {

    const styleTotal = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E2E8F0" } }
    };

    const [year, month] = selectedMonth.split("-");
    const start = `${year}-${month}-01`;
    const end = new Date(parseInt(year), parseInt(month), 0)
      .toISOString()
      .split("T")[0];

    const res = await fetch(
      `${API_BASE}/api/equipment/history-range?from=${start}&to=${end}`
    );
    const json = await res.json();

    const rows = (json.rows || []).filter(
      (r: any) => r.action === "borrow" || r.action === "stat"
    );

    if (rows.length === 0) {
      alert("ไม่มีข้อมูลในช่วงนี้");
      return;
    }

    // =========================
    // 🔹 SHEET 1 : รายวัน
    // =========================

    const equipmentList = Array.from(
      new Set(rows.map((r: any) => r.equipment))
    );

    const grouped: any = {};

    rows.forEach((r: any) => {
      const date = new Date(r.created_at).toLocaleDateString("th-TH");

      if (!grouped[date]) {
        grouped[date] = {};
        equipmentList.forEach(eq => grouped[date][eq] = 0);
      }

      grouped[date][r.equipment] += Number(r.qty || 0);
    });

    const tableData: any[] = [];
    const grandTotals: any = {};
    equipmentList.forEach(eq => grandTotals[eq] = 0);
    let grandAll = 0;

    Object.keys(grouped)
      .sort((a, b) =>
        new Date(a.split('/').reverse().join('-')).getTime() -
        new Date(b.split('/').reverse().join('-')).getTime()
      )
      .forEach(date => {

        const row: any[] = [date];
        let rowTotal = 0;

        equipmentList.forEach(eq => {
          const val = grouped[date][eq] || 0;
          row.push(val);
          rowTotal += val;
          grandTotals[eq] += val;
        });

        row.push(rowTotal);
        grandAll += rowTotal;
        tableData.push(row);
      });

    const summaryRow: any[] = [
      { v: "รวม", s: styleTotal }
    ];

    equipmentList.forEach(eq => {
      summaryRow.push({ v: grandTotals[eq], s: styleTotal });
    });

    summaryRow.push({ v: grandAll, s: styleTotal });
    tableData.push(summaryRow);

    const header = ["วันที่", ...equipmentList, "รวม"];

    const ws1 = XLSX.utils.aoa_to_sheet([
      ["สถิติการยืมอุปกรณ์กีฬา"],
      [],
      header,
      ...tableData
    ]);

    ws1["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }
    ];

    ws1["!cols"] = [
      { wch: 14 },
      ...equipmentList.map(() => ({ wch: 18 })),
      { wch: 10 }
    ];

    // =========================
    // 🔹 SHEET 2 : สรุปยอดรวม
    // =========================

    const summaryArray = Object.entries(grandTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count);

    const sheet2Data: any[] = [];

    sheet2Data.push(["สรุปสถิติการยืมอุปกรณ์กีฬาสนามกลางแจ้ง"]);
    sheet2Data.push([]);
    sheet2Data.push(["ลำดับ", "รายการ", "จำนวนครั้ง"]);

    summaryArray.forEach((item, index) => {
      sheet2Data.push([
        index + 1,
        item.name,
        item.count
      ]);
    });

    sheet2Data.push([]);
    sheet2Data.push(["", "รวมการยืมอุปกรณ์ทั้งหมด", grandAll]);

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

    ws2["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];

    ws2["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 15 }
    ];

    // =========================
    // 🔹 สร้าง Workbook
    // =========================

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "สถิติรายวัน");
    XLSX.utils.book_append_sheet(wb, ws2, "สรุปสถิติ");

    XLSX.writeFile(wb, `Borrow_Report_${reportData.code}.xlsx`);
  };
  // ================= EXPORT PDF =================
  const handleExportPDF = (reportData: any) => {
    const doc = new jsPDF();
    doc.text(reportData.title, 14, 20);
    doc.text(`ประจำเดือน ${reportData.monthThai}`, 14, 28);
    autoTable(doc, {
      startY: 35,
      head: [["เอกสาร", reportData.code, "แหล่งข้อมูล", reportData.source]],
      body: []
    });
    doc.save(`Report_${reportData.code}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-kanit">
      <div className="max-w-7xl mx-auto space-y-4">
        <section className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-4">
            <Filter size={16} />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border p-2 rounded" />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b font-bold flex items-center gap-2">
            <History size={18} /> รายการสรุปประจำเดือน
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-center">
                <th className="p-3">ลำดับ</th>
                <th className="p-3">รหัสเอกสาร</th>
                <th className="p-3">ประจำเดือน</th>
                <th className="p-3">ชื่อรายงาน</th>
                <th className="p-3">แหล่งข้อมูล</th>
                <th className="p-3">ดาวน์โหลด</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-6">กำลังโหลด...</td></tr>
              ) : reports.length > 0 ? (
                reports.map((row, i) => (
                  <tr key={i} className="text-center border-t hover:bg-gray-50 transition-colors">
                    <td className="p-4">{i + 1}</td>
                    <td>{row.code}</td>
                    <td>{row.monthThai}</td>
                    <td className="text-indigo-600 font-semibold">{row.title}</td>
                    <td>{row.source}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => row.type === "checkin" ? handleExportCheckinExcel(row) : handleExportBorrowExcel(row)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Excel
                        </button>
                        <button onClick={() => handleExportPDF(row)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center p-6 text-gray-400">ไม่พบข้อมูลในเดือนที่เลือก</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}