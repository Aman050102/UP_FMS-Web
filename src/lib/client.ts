import axios from "axios";

// สร้าง Instance ของ Axios
const client = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * [Request Interceptor]
 * ดึง Token จาก localStorage มาแนบใน Header ทุกครั้งก่อนส่ง Request
 */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * [Response Interceptor]
 * ตรวจสอบ Error จากเซิร์ฟเวอร์ ถ้าเจอ 401 ให้ทำ Logout ทันที
 */
client.interceptors.response.use(
  (response) => {
    // ถ้า Response สำเร็จ ให้ส่งข้อมูล data กลับไปเลย (ไม่ต้องรัน .json())
    return response;
  },
  (error) => {
    // ถ้าเซิร์ฟเวอร์ตอบกลับมาเป็น 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Logging out...");

      // ล้างข้อมูลและเด้งไปหน้า Login
      localStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?msg=session_expired";
      }
    }

    // ดึง error message จาก API มาแสดง (ถ้ามี)
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default client;
