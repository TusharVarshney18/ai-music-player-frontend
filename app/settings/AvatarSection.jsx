"use client";

import { useState, useRef } from "react";
import { apiFetch } from "../utils/route";

export default function AvatarSection({ user, setUser }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Upload Avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) {
      console.warn("⚠️ No file or user found");
      return;
    }

    // Show preview immediately
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("accessToken");

      const res = await apiFetch("/api/avatar", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setUser((prev) => ({
        ...prev,
        avatarUrl: data.avatarUrl,
      }));

      setPreview(null); // clear preview after upload
    } catch (err) {
      console.error("❌ Upload error:", err);
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await apiFetch("/api/avatar/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Remove failed");

      await res.json();
      setUser((prev) => ({ ...prev, avatarUrl: "" }));
    } catch (err) {
      console.error("❌ Remove error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative group">
        <img
          src={preview || user?.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-gray-700 object-cover shadow-lg"
        />
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            Change
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        name="avatar"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Remove Avatar */}
      {user?.avatarUrl && (
        <button
          onClick={handleRemoveAvatar}
          className="text-sm text-red-500 hover:underline"
        >
          Remove Avatar
        </button>
      )}
    </div>
  );
}
