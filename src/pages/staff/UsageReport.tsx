import { useEffect, useState } from "react";

type Summary = {
  totalBookings: number;
  totalHours: number;
  revenue: number;
};

type Daily = {
  date: string;
  total: number;
};

export default function UsageReport() {
  const month =
    new URLSearchParams(window.location.search).get("month") ||
    new Date().toISOString().slice(0, 7);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<Daily[]>([]);

  // 🔥 แปลง month → from/to
  const [y, m] = month.split("-");
  const from = `${y}-${m}-01`;
  const to = new Date(Number(y), Number(m), 0)
    .toISOString()
    .split("T")[0];

  // 🔹 ดึงข้อมูลจาก backend
  useEffect(() => {
    fetch(`/api/report/checkin-summary?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        const total = Array.isArray(data)
          ? data.reduce(
              (s: number, r: any) => s + Number(r.total),
              0
            )
          : 0;

        setSummary({
          totalBookings: total,
          totalHours: 0,
          revenue: 0,
        });

        setDaily([]); // endpoint นี้ยังไม่มี daily
      })
      .catch(() => {
        // fallback demo
        const mockDaily = Array.from({ length: 31 }, (_, i) => ({
          date: String(i + 1).padStart(2, "0"),
          total: Math.floor(Math.random() * 40),
        }));

        setSummary({
          totalBookings: mockDaily.reduce(
            (s, d) => s + d.total,
            0
          ),
          totalHours: 340,
          revenue: 52000,
        });
        setDaily(mockDaily);
      });
  }, [month, from, to]);

  // 🔹 สั่ง print หลัง render
  useEffect(() => {
    if (summary) {
      setTimeout(() => window.print(), 800);
    }
  }, [summary]);

  if (!summary)
    return <div className="p-10">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-10 text-black">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          รายงานการใช้สนามกีฬา
        </h1>
        <p>ประจำเดือน {month}</p>
        <p className="text-sm mt-1">
          พิมพ์เมื่อ: {new Date().toLocaleString()}
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 my-6 text-center">
        <div className="border p-4">
          จำนวนผู้ใช้รวม
          <div className="text-xl font-bold">
            {summary.totalBookings.toLocaleString()}
          </div>
        </div>

        <div className="border p-4">
          ชั่วโมงรวม
          <div className="text-xl font-bold">
            {summary.totalHours.toLocaleString()}
          </div>
        </div>

        <div className="border p-4">
          รายได้รวม
          <div className="text-xl font-bold">
            {summary.revenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* TABLE (ถ้าอนาคตมี daily จะโชว์) */}
      {daily.length > 0 && (
        <>
          <div className="page-break" />
          <h2 className="font-bold mb-3">
            รายละเอียดจำนวนผู้ใช้รายวัน
          </h2>

          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">วันที่</th>
                <th className="border p-2">จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d, i) => (
                <tr key={i}>
                  <td className="border p-2">{d.date}</td>
                  <td className="border p-2">
                    {Number(d.total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* FOOTER */}
      <div className="mt-10 text-xs text-center">
        งานสนามกีฬา กองกิจการนิสิต มหาวิทยาลัยพะเยา
      </div>

      {/* PRINT STYLE */}
      <style>
        {`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          .page-break {
            page-break-before: always;
          }
        }
      `}
      </style>
    </div>
  );
}
