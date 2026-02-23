/** เช็คเบื้องต้นว่ามี token ไหม ถ้าไม่มีให้ไปหน้า login */
export function ensureSession() {
  const token = localStorage.getItem("token");
  if (!token) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?next=${next}`;
    return false;
  }
  return true;
}

/** ดึงข้อมูล User จาก LocalStorage มาใช้งานในหน้า UI */
export function getCurrentUser() {
  return {
    id: localStorage.getItem("user_id"),
    name: localStorage.getItem("display_name"),
    role: localStorage.getItem("user_role"),
    avatar: localStorage.getItem("user_image"),
  };
}
