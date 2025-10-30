"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, ArrowLeft, Music2, Clock, Shuffle, Download, MoreHorizontal, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export default function LikedSongsPage() {
  const router = useRouter();
  const [likedTracks, setLikedTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const { playTrack, currentTrack } = usePlayer();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    setLikedTracks(liked);
  }, []);

  const handleUnlike = (trackId) => {
    const updated = likedTracks.filter((t) => t._id !== trackId);
    setLikedTracks(updated);
    localStorage.setItem("likedTracks", JSON.stringify(updated));
  };

  const playAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0]);
    }
  };

  // Filter tracks by search
  const filteredTracks = likedTracks.filter(
    (track) => track.title.toLowerCase().includes(searchQuery.toLowerCase()) || track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Empty State
  if (likedTracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900/40 via-zinc-900 to-black p-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-6"
        >
          <Heart size={64} className="text-gray-600" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">No liked songs yet</h2>
        <p className="text-gray-400 text-center mb-8 max-w-md">
          Songs you like will appear here. Start exploring and tap the heart icon to save your favorites.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/songs")}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          Browse Songs
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="mt-4 px-6 py-3 rounded-full bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="inline mr-2" size={18} />
          Go Back
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gradient-to-b from-purple-900/40 via-zinc-900 to-black flex flex-col overflow-hidden"
    >
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-pink-600/40 to-purple-900/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>

        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="relative z-10 mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-all group"
        >
          <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </motion.button>

        {/* Header Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Liked Songs Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0"
          >
            <Heart size={80} className="text-white" fill="currentColor" strokeWidth={1.5} />
          </motion.div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-end pb-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold mb-2"
            >
              Playlist
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 leading-tight"
            >
              Liked Songs
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <span className="font-semibold">{filteredTracks.length} songs</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          {/* Play Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAll}
              className="p-4 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-pink-500/50 group"
              aria-label="Play all"
            >
              <Play size={24} className="text-white fill-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-gray-400 hover:text-white transition-all"
              aria-label="Shuffle"
            >
              <Shuffle size={28} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-gray-400 hover:text-white transition-all hidden sm:block"
              aria-label="More options"
            >
              <MoreHorizontal size={28} />
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search in liked songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Header - Desktop Only */}
      <div className="hidden sm:grid sticky top-[88px] sm:top-[72px] z-10 grid-cols-[auto_2fr_1fr_auto_auto] gap-4 px-4 sm:px-6 lg:px-8 py-3 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-center">#</div>
        <div>Title</div>
        <div>Artist</div>
        <div className="flex items-center justify-center">
          <Clock size={16} />
        </div>
        <div className="w-20 text-center">Actions</div>
      </div>

      {/* Songs List */}
      <ul className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-2">
        <AnimatePresence>
          {filteredTracks.map((track, idx) => {
            const isPlaying = currentTrack?._id === track._id;
            const isHovered = hoveredTrack === track._id;

            return (
              <motion.li
                key={track._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                onMouseEnter={() => setHoveredTrack(track._id)}
                onMouseLeave={() => setHoveredTrack(null)}
                className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_2fr_1fr_auto_auto] gap-3 sm:gap-4 items-center p-3 rounded-lg cursor-pointer transition-all group ${
                  isPlaying ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {/* Index / Play Icon */}
                <div className="w-8 flex items-center justify-center">
                  {isHovered || isPlaying ? (
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playTrack(track, likedTracks)}
                      className={`${isPlaying ? "text-pink-400" : "text-white"}`}
                    >
                      <Play size={16} fill="currentColor" />
                    </motion.button>
                  ) : (
                    <span className={`text-sm ${isPlaying ? "text-pink-400" : "text-gray-400"}`}>{idx + 1}</span>
                  )}
                </div>

                {/* Title & Artist */}
                <div onClick={() => playTrack(track, likedTracks)} className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <Music2 size={18} className="text-pink-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold truncate ${isPlaying ? "text-pink-400" : "text-white"}`}>{track.title}</h3>
                    <p className="text-xs text-gray-400 truncate sm:hidden">{track.artist}</p>
                  </div>
                </div>

                {/* Artist (Desktop) */}
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-400 truncate hover:text-white transition-colors cursor-pointer">{track.artist}</p>
                </div>

                {/* Duration (Desktop) */}
                <div className="hidden sm:block text-center">
                  <span className="text-sm text-gray-400">{track.duration ? formatDuration(track.duration) : "3:24"}</span>
                </div>

                {/* Unlike Button - Always Visible */}
                <div className="flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlike(track._id);
                    }}
                    className="p-2 text-pink-500 hover:text-pink-400 transition-all touch-manipulation"
                    aria-label="Unlike"
                  >
                    <Heart size={18} fill="currentColor" />
                  </motion.button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {/* No Results State */}
        {filteredTracks.length === 0 && searchQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={64} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No songs found</h3>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </motion.div>
        )}
      </ul>
    </motion.section>
  );
}
