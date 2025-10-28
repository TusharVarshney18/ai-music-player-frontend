"use client";

import { useEffect, useState } from "react";

export default function AddToPlaylistModal({ song, onClose, onCreateNew }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    try {
      const res = await fetch(
        "https://ai-music-player-backend.vercel.app/api/playlist/mine",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch playlists");
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      alert("⚠️ Unable to load playlists.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(playlistId) {
    try {
      const res = await fetch(
        `https://ai-music-player-backend.vercel.app/api/playlist/${playlistId}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ songId: song._id }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add song");

      alert(`✅ "${song.title}" added to "${data.playlist?.name}"`);
      onClose();
    } catch (err) {
      console.error("Add song error:", err);
      alert("❌ Failed to add song. Check console.");
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md text-center">
          <p className="text-gray-300">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-white text-xl font-bold mb-4">
          Add “{song?.title}” to Playlist
        </h2>

        {playlists.length === 0 ? (
          <p className="text-gray-400 text-sm mb-4">No playlists yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {playlists.map((pl) => (
              <li
                key={pl._id}
                onClick={() => handleAdd(pl._id)}
                className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-purple-700 transition"
              >
                <p className="text-white font-medium">{pl.name}</p>
                <p className="text-xs text-gray-400">
                  {pl.tracks?.length || 0} songs
                </p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onCreateNew}
          className="w-full py-2 bg-purple-700 text-white rounded-lg mb-2 hover:bg-purple-600"
        >
          + Create New Playlist
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
