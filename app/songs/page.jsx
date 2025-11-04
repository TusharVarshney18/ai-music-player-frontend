"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Heart, Plus, ArrowLeft, Music2, Clock, Search, Shuffle, MoreHorizontal, MoreVertical } from "lucide-react";
import { apiFetch } from "@/utils/route";
import AddToPlaylistModal from "../../components/playlists/AddToPlaylistModal";
import CreatePlaylistModal from "../../components/playlists/CreatePlaylistModal";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export default function Playlist() {
  const [tracks, setTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [visible, setVisible] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const listRef = useRef(null);
  const router = useRouter();

  // ✅ Access global player context
  const { playTrack, currentTrack } = usePlayer();

  // 🎧 Fetch songs
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

    const storedLikes = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    setLikedTracks(storedLikes);
  }, []);

  // ♾ Infinite scroll
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
  }, [tracks.length]);

  // ❤️ Toggle like
  const toggleLike = (track) => {
    const exists = likedTracks.find((t) => t._id === track._id);
    const updated = exists ? likedTracks.filter((t) => t._id !== track._id) : [...likedTracks, track];
    setLikedTracks(updated);
    localStorage.setItem("likedTracks", JSON.stringify(updated));
  };

  const isLiked = (id) => likedTracks.some((t) => t._id === id);

  // 🔍 Filtered songs
  const filteredTracks = tracks.filter(
    (track) => track.title.toLowerCase().includes(searchQuery.toLowerCase()) || track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🎲 Play all with queue
  const playAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0], filteredTracks); // ✅ passes full queue
    }
  };

  // 🧠 Individual play with queue
  const handlePlayTrack = (track) => {
    playTrack(track, filteredTracks); // ✅ also passes queue
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="w-full max-w-full bg-gradient-to-b from-purple-900/40 via-zinc-900 to-black rounded-xl shadow-2xl flex flex-col h-full min-h-screen overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-purple-600/60 to-purple-900/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

        <button onClick={() => router.back()} className="relative z-10 mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-all group">
          <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Music2 size={80} className="text-white/90" strokeWidth={1.5} />
          </div>

          <div className="flex-1 flex flex-col justify-end pb-2">
            <p className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold mb-2">Playlist</p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 leading-tight">All Songs</h1>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-semibold">{filteredTracks.length} songs</span>
              {likedTracks.length > 0 && (
                <>
                  <span>•</span>
                  <span>{likedTracks.length} liked</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls + Search */}
      <div className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={playAll}
              className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-purple-500/50"
              aria-label="Play all"
            >
              <Play size={24} className="text-white fill-white" />
            </button>
            <button className="p-3 text-gray-400 hover:text-white hover:scale-110 transition-all" aria-label="Shuffle">
              <Shuffle size={28} />
            </button>
            <button className="p-3 text-gray-400 hover:text-white hover:scale-110 transition-all" aria-label="More options">
              <MoreHorizontal size={28} />
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search in playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden sm:grid sticky top-[88px] sm:top-[72px] z-10 grid-cols-[auto_2fr_1fr_auto_auto] gap-4 px-4 sm:px-6 lg:px-8 py-3 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-center">#</div>
        <div>Title</div>
        <div>Artist</div>
        <div className="flex items-center justify-center">
          <Clock size={16} />
        </div>
        <div className="w-24 text-center">Actions</div>
      </div>

      {/* Songs List */}
      <ul ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-2">
        {filteredTracks.slice(0, visible).map((track, idx) => {
          const isPlaying = currentTrack?._id === track._id;
          const isHovered = hoveredTrack === track._id;

          return (
            <li
              key={track._id || idx}
              onMouseEnter={() => setHoveredTrack(track._id)}
              onMouseLeave={() => setHoveredTrack(null)}
              className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_2fr_1fr_auto_auto] gap-3 sm:gap-4 items-center p-3 rounded-lg cursor-pointer transition-all ${
                isPlaying ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              {/* Play icon / index */}
              <div className="w-8 flex items-center justify-center">
                {isHovered || isPlaying ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    className={`${isPlaying ? "text-purple-400" : "text-white"} hover:scale-110 transition-transform`}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                ) : (
                  <span className={`text-sm ${isPlaying ? "text-purple-400" : "text-gray-400"}`}>{idx + 1}</span>
                )}
              </div>

              {/* Title & Artist */}
              <div onClick={() => handlePlayTrack(track)} className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Music2 size={18} className="text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm font-semibold truncate ${isPlaying ? "text-purple-400" : "text-white"}`}>{track.title}</h3>
                  <p className="text-xs text-gray-400 truncate sm:hidden">{track.artist}</p>
                </div>
              </div>

              <div className="hidden sm:block">
                <p className="text-sm text-gray-400 truncate hover:text-white transition-colors cursor-pointer">{track.artist}</p>
              </div>

              <div className="hidden sm:block text-center">
                <span className="text-sm text-gray-400">{track.duration ? formatDuration(track.duration) : "3:24"}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  className={`p-2 sm:p-2.5 ${
                    isLiked(track._id) ? "text-pink-500 scale-110" : "text-gray-400 hover:text-pink-400 hover:scale-110 active:scale-95"
                  } transition-all`}
                >
                  <Heart size={18} fill={isLiked(track._id) ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSong(track);
                    setShowAddModal(true);
                  }}
                  className="p-2 sm:p-2.5 text-gray-400 hover:text-green-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <Plus size={18} />
                </button>

                <button className="p-2 text-gray-400 hover:text-white transition-all sm:hidden">
                  <MoreVertical size={18} />
                </button>
              </div>
            </li>
          );
        })}

        {filteredTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Music2 size={64} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No songs found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search query</p>
          </div>
        )}
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
