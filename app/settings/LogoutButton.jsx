"use client";
const API_URL = "https://ai-music-player-backend.vercel.app";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");

      // Redirect to login page
      window.location.href = "/login";
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
