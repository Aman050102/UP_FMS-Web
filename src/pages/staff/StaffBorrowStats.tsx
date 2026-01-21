import React, { useState } from "react";
import {
  Printer,
  FileText,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Calendar,
  BarChart3,
  History
} from "lucide-react";

export default function StaffDocumentManagement() {
  const [activeTab, setActiveTab] = useState("usage-report");

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-kanit p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* 1. Navigation Tabs (เลียนแบบแถบเมนูในรูป) */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'usage-report' ? 'border-primary text-primary bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('usage-report')}
          >
            ออกเอกสารรายงานสรุปผล
          </button>
        </div>

        {/* 2. Search & Filter Area */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2 text-sm font-bold text-gray-600 border-r pr-4 border-gray-200">
                <Filter size={16} /> ตัวกรองข้อมูล
             </div>
             <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-400">เลือกช่วงเวลา:</label>
                <input type="month" className="p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
             </div>
          </div>
        </section>

        {/* 3. Document Table Area */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <History size={18} className="text-primary" /> รายการเอกสารรายงานประจำเดือน
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white text-gray-600 border-b border-gray-200 uppercase tracking-tighter">
                  <th className="px-4 py-4 font-bold text-center border-r border-gray-100 w-16">ลำดับ</th>
                  <th className="px-4 py-4 font-bold text-left border-r border-gray-100">รหัสเอกสาร</th>
                  <th className="px-4 py-4 font-bold text-left border-r border-gray-100">รอบเดือน/ปี</th>
                  <th className="px-4 py-4 font-bold text-left border-r border-gray-100">ชื่อรายงาน (ดึงข้อมูลอัตโนมัติ)</th>
                  <th className="px-4 py-4 font-bold text-left border-r border-gray-100">แหล่งข้อมูล</th>
                  <th className="px-4 py-4 font-bold text-center border-r border-gray-100">ความครบถ้วน</th>
                  <th className="px-4 py-4 font-bold text-center">พิมพ์รายงาน (PDF/Excel)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { id: 1, code: "REP-FAC-6901", period: "มกราคม 2569", title: "สรุปสถิติจำนวนผู้เข้าใช้สนามกีฬาทุกประเภท", source: "บันทึกเข้าสนาม", completion: "100%" },
                  { id: 2, code: "REP-EQP-6901", period: "มกราคม 2569", title: "รายงานการยืม-คืนอุปกรณ์กีฬาและวัสดุคงคลัง", source: "บันทึกยืม-คืน", completion: "100%" },
                  { id: 3, code: "REP-FAC-6812", period: "ธันวาคม 2568", title: "สรุปยอดผู้เข้าใช้สนามประจำเดือน (ย้อนหลัง)", source: "บันทึกเข้าสนาม", completion: "100%" },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-5 text-center text-gray-400 border-r border-gray-50">{row.id}</td>
                    <td className="px-4 py-5 font-mono text-xs text-gray-500 border-r border-gray-50">{row.code}</td>
                    <td className="px-4 py-5 font-bold text-gray-700 border-r border-gray-50">{row.period}</td>
                    <td className="px-4 py-5 font-bold text-primary border-r border-gray-50">{row.title}</td>
                    <td className="px-4 py-5 border-r border-gray-50">
                       <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          {row.source === "บันทึกเข้าสนาม" ? <BarChart3 size={14}/> : <History size={14}/>}
                          {row.source}
                       </span>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-50">
                       <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-1 rounded">
                          พร้อมออกเอกสาร
                       </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex justify-center gap-3">
                        {/* ปุ่มเลียนแบบไอคอนในรูปภาพ */}
                        <button className="text-blue-600 hover:scale-110 transition-all" title="ดาวน์โหลด PDF Report">
                          <Printer size={20} />
                        </button>
                        <button className="text-green-600 hover:scale-110 transition-all" title="ดาวน์โหลด Excel Data">
                          <FileSpreadsheet size={20} />
                        </button>
                        <button className="text-orange-500 hover:scale-110 transition-all" title="ดูข้อมูลใน Google Sheets">
                           <Download size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-400 font-black uppercase tracking-widest text-right">
             Report Generator System v1.0 | UP-FMS Admin Aleekae
          </div>
        </section>
      </div>
    </div>
  );
}
