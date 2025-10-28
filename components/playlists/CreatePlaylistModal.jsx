"use client";

import { useState } from "react";
import { apiFetch } from "@/app/utils/route";

export default function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return alert("⚠️ Please enter a playlist name!");
    setLoading(true);

    try {
      const res = await apiFetch("/api/playlist", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      // ✅ Check if the playlist was created successfully
      if (data.playlist && data.playlist._id) {
        alert(`✅ Playlist "${data.playlist.name}" created successfully`);
        // ✅ Pass the complete playlist object to parent
        onCreated?.(data.playlist);
        onClose?.();
      } else {
        alert("❌ Playlist creation failed. Invalid response from server.");
        console.error("Invalid playlist data:", data);
      }
    } catch (err) {
      alert("❌ Failed to create playlist. Check console for details.");
      console.error("Create playlist error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-white text-xl font-bold mb-4">Create Playlist</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter playlist name..."
          className="w-full p-2 rounded-md bg-gray-800 text-white mb-4 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleCreate();
          }}
        />

        <button
          disabled={loading}
          onClick={handleCreate}
          className="w-full py-2 bg-purple-700 text-white rounded-lg mb-2 hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
