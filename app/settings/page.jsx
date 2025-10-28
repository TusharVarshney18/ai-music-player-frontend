"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../api/utils/route";
import AvatarSection from "./AvatarSection";
import LogoutButton from "./LogoutButton";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await apiFetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("❌ Failed to fetch /me:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match." });
    }
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update password",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Try again later." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm sm:text-base">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-gray-400 mt-20 text-sm sm:text-base">
        Please log in to continue.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-200 p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-8 text-sm bg-gray-800/60 hover:bg-gray-700/70 px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-md border border-gray-700"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center sm:text-left bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Account Settings
        </h1>

        {/* Profile Section */}
        <section className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4 text-purple-300">
            Profile
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <AvatarSection user={user} setUser={setUser} />
            <div className="text-center sm:text-left">
              <p className="text-base font-medium text-white">
                {user.username}
              </p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4 text-purple-300">
            Account
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-700 pb-3">
              <span className="text-gray-300">Email</span>
              <span className="text-gray-400 break-all">{user.email}</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-700 pb-3">
              <span className="text-gray-300">Plan</span>
              <span className="text-green-400 font-medium">Free</span>
            </li>
          </ul>
        </section>

        {/* Change Password Section */}
        <section className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-semibold mb-4 text-purple-300">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Old Password
              </label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                New Password
              </label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full p-2 rounded bg-gray-900/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg font-medium transition-all duration-200"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* Logout */}
        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
