import { useEffect, useState } from "react";

type Row = {
  date: string;
  facility: string;
  total: number;
};

export default function UsageReport() {
  const API_BASE =
    "https://up-fms-api-hono.your-account.workers.dev";

  const month =
    new URLSearchParams(window.location.search).get("month") ||
    new Date().toISOString().slice(0, 7);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [y, m] = month.split("-");
  const from = `${y}-${m}-01`;
  const to = new Date(Number(y), Number(m), 0)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/report/checkin-summary?from=${from}&to=${to}`
        );

        if (!res.ok) throw new Error("API ERROR");

        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้");
      }
    };

    fetchData();
  }, [from, to]);

  const totalAll = rows.reduce(
    (sum, r) => sum + Number(r.total || 0),
    0
  );

  useEffect(() => {
    if (rows.length > 0) {
      setTimeout(() => window.print(), 800);
    }
  }, [rows]);

  if (error)
    return (
      <div className="p-10 text-red-600 font-bold">
        {error}
      </div>
    );

  if (!rows.length)
    return <div className="p-10">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-10 text-black">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          รายงานการเข้าใช้สนามกีฬา
        </h1>
        <p>ประจำเดือน {month}</p>
      </div>

      <div className="border p-4 text-center mb-6">
        จำนวนผู้ใช้รวมทั้งหมด
        <div className="text-2xl font-bold">
          {totalAll.toLocaleString()}
        </div>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">วันที่</th>
            <th className="border p-2">สนาม</th>
            <th className="border p-2">จำนวนผู้ใช้</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.date}</td>
              <td className="border p-2">{r.facility}</td>
              <td className="border p-2">
                {Number(r.total).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 text-xs text-center">
        งานสนามกีฬา กองกิจการนิสิต มหาวิทยาลัยพะเยา
      </div>

      <style>
        {`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}
      </style>
    </div>
  );
}