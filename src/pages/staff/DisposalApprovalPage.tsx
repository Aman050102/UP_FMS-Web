import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, XCircle, Package, Calendar, User } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "https://up-fms-api-hono.aman02012548.workers.dev").replace(/\/$/, "");

export default function StaffDisposalApprovalPage() {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const res = await fetch(`${API}/api/staff/disposal-requests`);
    const data = await res.json();
    if (data.ok) setRequests(data.requests);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (reqId: number, equipId: number, qty: number) => {
    if (!confirm("ยืนยันการอนุมัติ? ระบบจะทำการตัดสต็อกและยอดรวมถาวร")) return;
    try {
      const res = await fetch(`${API}/api/staff/disposal-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: reqId, equipment_id: equipId, qty })
      });
      if (res.ok) {
        alert("อนุมัติและตัดสต็อกเรียบร้อย");
        fetchRequests();
      }
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5 font-kanit animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-primary" /> รายการพิจารณาจำหน่ายอุปกรณ์
        </h1>
        <p className="text-gray-500 text-sm">ตรวจสอบรายการแจ้งชำรุดเพื่อดำเนินการตัดออกจากบัญชีสต็อก</p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed rounded-[2rem] text-gray-400">
            ไม่มีรายการรออนุมัติในขณะนี้
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-5 w-full">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl shrink-0"><Package size={32} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{req.equipment_name}</h3>
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-black">-{req.qty}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">"{req.reason}"</p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <User size={12} /> ผู้แจ้ง: {req.reporter_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <Calendar size={12} /> {new Date(req.created_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => handleApprove(req.id, req.equipment_id, req.qty)}
                  className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary-dark transition-all"
                >
                  <CheckCircle size={18} /> อนุมัติการจำหน่าย
                </button>
                <button className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-all">
                  <XCircle size={18} /> ปฏิเสธ
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
