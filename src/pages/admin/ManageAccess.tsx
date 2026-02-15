import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Trash2,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787"
).replace(/\/$/, "");

interface Collaborator {
  id: number;
  name: string;
  username: string;
  role: string;
}

export default function ManageAccess() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("assistant");

  // 1. ดึงรายชื่อผู้ที่ได้รับสิทธิ์ปัจจุบัน
  const fetchCollaborators = async () => {
    try {
      const res = await fetch(`${API}/api/auth/collaborators`);
      const data = await res.json();
      setCollaborators(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  // 2. ค้นหาผู้ใช้จาก DB เมื่อมีการพิมพ์ (Debounce 500ms)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const res = await fetch(`${API}/api/auth/search-users?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // 3. ฟังก์ชันมอบสิทธิ์
  const handleAssignRole = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API}/api/auth/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: selectedRole,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedUser(null);
        setSearchQuery("");
        fetchCollaborators();
        alert("มอบสิทธิ์สำเร็จ");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการมอบสิทธิ์");
    }
  };

  // 4. ฟังก์ชันลบสิทธิ์ (กลับเป็น user)
  const handleRemoveRole = async (userId: number) => {
    if (!window.confirm("ต้องการยกเลิกสิทธิ์ผู้ใช้นี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`${API}/api/auth/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole: "user" }),
      });
      if (res.ok) fetchCollaborators();
    } catch (e) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-kanit p-6">
      <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={28} /> Manage
              Access
            </h2>
            <p className="text-sm text-gray-400">
              จัดการสิทธิ์เจ้าหน้าที่และนิสิตช่วยงาน (SA) จากฐานข้อมูล
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2da44e] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-[#2c974b] transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> Add member
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {collaborators.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  ยังไม่มีผู้ได้รับสิทธิ์พิเศษในระบบ
                </div>
              )}
              {collaborators.map((user) => (
                <div
                  key={user.id}
                  className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.role === "admin" ? "bg-purple-100 text-purple-600" : user.role === "staff" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          @{user.username}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveRole(user.id)}
                    className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Modal Add Member --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-[1px]">
          <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-slate-800">
                Assign new role
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              {!selectedUser ? (
                <>
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-3 text-blue-500"
                      size={18}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="พิมพ์ชื่อนิสิตที่ต้องการค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-blue-500 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border border-gray-100 rounded-xl divide-y">
                    {searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                          {u.name[0]}
                        </div>
                        <div className="text-sm font-bold">
                          {u.name}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    ))}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        ไม่พบรายชื่อในฐานข้อมูล
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4 flex items-center gap-3 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      {selectedUser.name[0]}
                    </div>
                    <div className="text-sm font-bold">{selectedUser.name}</div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="ml-auto text-xs text-blue-600 underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: "staff", label: "เจ้าหน้าที่ (Staff)" },
                      { id: "assistant", label: "นิสิตช่วยงาน (SA)" },
                    ].map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${selectedRole === r.id ? "border-blue-500 bg-blue-50" : "border-gray-100"}`}
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 text-blue-600"
                          checked={selectedRole === r.id}
                          onChange={() => setSelectedRole(r.id)}
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!selectedUser}
                className="px-4 py-2 text-sm font-bold text-white bg-[#2da44e] rounded-xl disabled:opacity-50"
              >
                Assign role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
