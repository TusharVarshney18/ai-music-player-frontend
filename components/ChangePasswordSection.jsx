"use client";

import { useState } from "react";
import { apiFetch } from "../app/api/utils/route";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

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

  return (
    <section className="bg-gray-800/70 rounded-2xl p-4 sm:p-6 shadow-md hover:bg-gray-800 transition text-white max-w-lg mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Old Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
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
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
        >
          Update Password
        </button>
      </form>
    </section>
  );
}
