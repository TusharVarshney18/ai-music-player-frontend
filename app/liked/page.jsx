"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export default function LikedSongsPage() {
  const router = useRouter();
  const [likedTracks, setLikedTracks] = useState([]);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    setLikedTracks(liked);
  }, []);

  const handleUnlike = (trackId) => {
    const updated = likedTracks.filter((t) => t._id !== trackId);
    setLikedTracks(updated);
    localStorage.setItem("likedTracks", JSON.stringify(updated));
  };

  if (likedTracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-screen bg-black text-gray-400"
      >
        <p>No liked songs yet 💔</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          <ArrowLeft className="inline mr-2" size={18} />
          Go Back
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full min-h-screen bg-gradient-to-b from-purple-900/80 via-black to-black p-4 sm:p-8 flex flex-col rounded-xl shadow-2xl"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="flex items-center text-purple-400 hover:text-purple-300 transition"
        >
          <ArrowLeft size={22} className="mr-2" />
          <span className="font-semibold hidden sm:inline">Go Back</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center flex-1"
        >
          ❤️ Liked Songs
        </motion.h1>
      </div>

      {/* Song List */}
      <ul className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 sm:pr-2">
        {likedTracks.map((track, idx) => (
          <motion.li
            key={`${track._id}-${idx}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-[25px_1fr_auto_auto] sm:grid-cols-[30px_1fr_auto_auto] items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-gray-800 transition"
          >
            <span className="text-xs sm:text-sm text-gray-400 text-center">
              {idx + 1}
            </span>

            <div className="truncate">
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                {track.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">{track.artist}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playTrack(track, likedTracks)}
              className="text-purple-400 hover:text-purple-300"
            >
              <Play size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUnlike(track._id)}
              className="text-pink-400 hover:text-pink-300"
            >
              <Heart size={20} fill="currentColor" />
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
