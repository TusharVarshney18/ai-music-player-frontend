"use client";

import { useState } from "react";
import { apiFetch } from "@/app/api/utils/route";

export default function DeletePlaylistModal({
  playlistId,
  playlistName,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!playlistId) return alert("⚠️ Missing playlist ID!");

    setLoading(true);
    try {
      const res = await apiFetch(`/api/playlist/${playlistId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete playlist");

      onDeleted?.(playlistId);
      onClose?.();
    } catch (err) {
      console.error("❌ Delete playlist error:", err);
      alert("Failed to delete playlist. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-sm shadow-2xl border border-gray-800 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
          aria-label="Close"
          disabled={loading}
        >
          &times;
        </button>
        <h2 className="text-white text-2xl font-semibold mb-3">
          Delete Playlist
        </h2>
        <p className="text-gray-300 mb-7">
          Are you sure you want to delete{" "}
          <span className="font-bold text-purple-400">{playlistName}</span>?
          <br />
          <span className="text-red-400 text-sm block mt-2">
            This action cannot be undone.
          </span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            disabled={loading}
            onClick={handleDelete}
            className="py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Playlist"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
