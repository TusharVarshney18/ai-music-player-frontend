"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Heart, Plus, ArrowLeft } from "lucide-react";
import { apiFetch } from "/app/api/utils/route";
import AddToPlaylistModal from "../../components/playlists/AddToPlaylistModal";
import CreatePlaylistModal from "../../components/playlists/CreatePlaylistModal";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export default function Playlist() {
  const [tracks, setTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]); // ❤️ store liked songs
  const [visible, setVisible] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const listRef = useRef(null);
  const router = useRouter();
  const { playTrack } = usePlayer();

  // 🎵 Load songs
  useEffect(() => {
    async function loadSongs() {
      try {
        const res = await apiFetch("/api/music", { method: "GET" });
        const data = await res.json();
        setTracks(data.songs || []);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      }
    }
    loadSongs();
  }, []);

  // ❤️ Load liked tracks from localStorage
  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    setLikedTracks(liked);
  }, []);

  // 📜 Infinite scroll
  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setVisible((prev) => (prev >= tracks.length ? prev : prev + 20));
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (list) list.addEventListener("scroll", handleScroll);
    return () => list?.removeEventListener("scroll", handleScroll);
  }, []);

  // ❤️ Handle like/unlike
  const toggleLike = (track) => {
    const liked = [...likedTracks];
    const isLiked = liked.some((t) => t._id === track._id);
    let updated;

    if (isLiked) {
      updated = liked.filter((t) => t._id !== track._id);
    } else {
      updated = [...liked, track];
    }

    setLikedTracks(updated);
    localStorage.setItem("likedTracks", JSON.stringify(updated));
  };

  const isTrackLiked = (trackId) => likedTracks.some((t) => t._id === trackId);

  return (
    <section className="w-full max-w-full bg-gradient-to-b from-purple-900/80 via-black to-black rounded-xl shadow-2xl backdrop-blur-md p-2 md:p-8 flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 mb-6 md:mb-8">
        <button
          onClick={() => router.back()}
          className="self-start md:self-auto mb-2 md:mb-0 flex items-center gap-1 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={22} />
          <span className="text-sm hidden sm:inline">Back</span>
        </button>
        <div className="flex flex-col text-center md:text-left flex-1">
          <p className="text-xs md:text-sm text-gray-400 uppercase">Library</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">
            All Songs
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            {tracks.length} songs
          </p>
        </div>
      </div>

      {/* Songs List */}
      <ul
        ref={listRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-2 md:space-y-3 min-h-[300px] md:min-h-[400px] pr-1 md:pr-2"
      >
        {tracks.slice(0, visible).map((track, idx) => {
          const liked = isTrackLiked(track._id);

          return (
            <li
              key={track._id || idx}
              onClick={() => playTrack(track)}
              className="grid grid-cols-[24px_1fr_auto_auto_auto] sm:grid-cols-[30px_1fr_auto_auto_auto] items-center gap-2 sm:gap-4 p-2 sm:p-3 cursor-pointer rounded-lg hover:bg-gray-800 transition"
            >
              <span className="text-xs sm:text-sm text-gray-400 text-center">
                {idx + 1}
              </span>
              <div className="truncate">
                <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                  {track.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {track.artist}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track);
                }}
                className="text-purple-400 hover:text-purple-300"
                aria-label="Play"
              >
                <Play size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(track);
                }}
                className={`hover:text-pink-300 ${
                  liked ? "text-pink-500" : "text-pink-400"
                }`}
                aria-label="Like"
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSong(track);
                  setShowAddModal(true);
                }}
                className="text-green-400 hover:text-green-300"
                aria-label="Add to playlist"
              >
                <Plus size={20} />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Modals */}
      {showAddModal && (
        <AddToPlaylistModal
          song={selectedSong}
          onClose={() => setShowAddModal(false)}
          onCreateNew={() => {
            setShowAddModal(false);
            setShowCreateModal(true);
          }}
        />
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            alert("✅ Playlist created!");
          }}
        />
      )}
    </section>
  );
}
