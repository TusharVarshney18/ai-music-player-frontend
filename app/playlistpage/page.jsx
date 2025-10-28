"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../api/utils/route";
import DeletePlaylistModal from "../../components/playlists/DeleteToPlaylist";
import CreatePlaylistModal from "@/components/playlists/CreatePlaylistModal";
import { usePlayer } from "@/context/PlayerContext";
import { Play, ArrowLeft, Trash2, Music, PlusCircle } from "lucide-react";

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const { playTrack } = usePlayer();

  // 🌀 Load all playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    try {
      const res = await apiFetch("/api/playlist/mine", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      // ✅ Validate and filter out invalid playlists
      const validPlaylists = (data?.playlists || []).filter(
        (pl) => pl && typeof pl === "object" && pl._id && pl.name
      );

      setPlaylists(validPlaylists);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      setPlaylists([]); // ✅ Ensure it's always an array
    } finally {
      setLoading(false);
    }
  }

  function handleDeleted(id) {
    setPlaylists((prev) => prev.filter((p) => p._id !== id));
    setDeleteModal(null);
    setSelected(null);
  }

  function handleCreated(newPlaylist) {
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setCreateModal(false);
  }

  function handleGoBack() {
    if (selected) setSelected(null);
    else window.history.back();
  }

  // 🌀 Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Music size={42} className="text-purple-500" />
        </motion.div>
        <span className="ml-3 text-lg">Loading your playlists...</span>
      </div>
    );
  }

  // 🎧 Single Playlist View
  if (selected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex flex-col"
      >
        <header className="flex items-center gap-3 py-4 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-xl bg-black/20">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium"
          >
            <ArrowLeft size={22} /> Back
          </button>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
          >
            <h1 className="text-white font-bold text-3xl sm:text-4xl tracking-tight">
              {selected?.name || "Untitled Playlist"}
            </h1>
            <button
              onClick={() => setDeleteModal(selected)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow transition text-sm font-semibold"
            >
              <Trash2 size={18} /> Delete Playlist
            </button>
          </motion.div>

          <AnimatePresence>
            {selected?.tracks?.length ? (
              <ul className="space-y-4">
                {selected.tracks.map((song, i) => (
                  <motion.li
                    key={song._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gray-800/60 hover:bg-gray-700/80 transition-all backdrop-blur-lg p-4 rounded-2xl flex justify-between items-center border border-gray-700/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-600/20 w-14 h-14 rounded-lg flex items-center justify-center">
                        <Music className="text-purple-400" size={26} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {song.title}
                        </p>
                        <p className="text-gray-400 text-sm">{song.artist}</p>
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(song, selected.tracks);
                      }}
                    >
                      <Play size={18} /> Play
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center mt-16 text-gray-400">
                <Music size={48} className="text-purple-400 mb-2" />
                <p>No songs in this playlist yet 🎶</p>
              </div>
            )}
          </AnimatePresence>
        </main>

        {deleteModal && (
          <DeletePlaylistModal
            playlistId={deleteModal._id}
            playlistName={deleteModal.name}
            onClose={() => setDeleteModal(null)}
            onDeleted={handleDeleted}
          />
        )}
      </motion.div>
    );
  }

  // 🏠 Playlist List View
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      <header className="flex items-center gap-3 py-4 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-xl bg-black/20">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-medium"
        >
          <ArrowLeft size={22} /> Back
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white font-extrabold text-4xl sm:text-5xl tracking-tight">
            Your Playlists
          </h1>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-semibold text-sm shadow"
          >
            <PlusCircle size={18} /> New Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center mt-24">
            <Music size={56} className="text-purple-400 mb-2" />
            <p className="text-gray-400 text-lg font-medium">
              You haven't created any playlists yet 🎧
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {playlists.map((pl, i) => (
              <motion.div
                key={pl._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(pl)}
                className="relative group bg-gradient-to-br from-gray-800/80 to-gray-700/70 hover:from-purple-800/60 hover:to-purple-600/40 backdrop-blur-md rounded-3xl p-6 cursor-pointer transition-all duration-300 border border-gray-700/50 hover:shadow-2xl"
              >
                <div className="bg-purple-600/30 w-20 h-20 rounded-2xl flex items-center justify-center mb-4">
                  <Music className="text-purple-400" size={36} />
                </div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {pl?.name || "Untitled Playlist"}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {pl?.tracks?.length || 0} song
                  {pl?.tracks?.length === 1 ? "" : "s"}
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-6 right-6"
                >
                  <div className="bg-purple-600 hover:bg-purple-500 p-3 rounded-full shadow-lg">
                    <Play size={20} className="text-white" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* 🧩 Modals */}
      <AnimatePresence>
        {createModal && (
          <CreatePlaylistModal
            onClose={() => setCreateModal(false)}
            onCreated={handleCreated}
          />
        )}
        {deleteModal && (
          <DeletePlaylistModal
            playlistId={deleteModal._id}
            playlistName={deleteModal.name}
            onClose={() => setDeleteModal(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
