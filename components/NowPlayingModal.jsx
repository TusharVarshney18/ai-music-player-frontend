"use client";

import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function NowPlayingModal({ onClose }) {
  // ✅ Get everything from PlayerContext
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
  } = usePlayer();

  if (!currentTrack) return null;

  // ✅ Default cover logic
  const getDefaultCover = (lang = "") => {
    lang = lang.toLowerCase();
    if (lang.includes("hindi")) return "/covers/hindi.jpg";
    if (lang.includes("punjabi")) return "/covers/punjabi.jpg";
    return "/covers/english.jpg";
  };

  const coverSrc =
    currentTrack.cover || getDefaultCover(currentTrack.language || "");

  // ⏱ Format time
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 250 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-black via-purple-950 to-black
                 text-white flex flex-col items-center justify-between p-6"
    >
      {/* Close */}
      <div className="flex justify-end w-full">
        <button onClick={onClose}>
          <X size={28} className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Track Info */}
      <div className="flex flex-col items-center gap-4">
        <img
          src={coverSrc}
          alt="cover"
          className="w-72 h-72 rounded-2xl shadow-xl object-cover"
        />
        <h1 className="text-2xl font-semibold text-center">
          {currentTrack.title}
        </h1>
        <p className="text-gray-400 text-center">{currentTrack.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 bg-gray-700/60 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 rounded-full"
            style={{ width: `${(progress / duration) * 100 || 0}%` }}
            animate={{ width: `${(progress / duration) * 100 || 0}%` }}
            transition={{ duration: 0.25 }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={duration ? progress / duration : 0}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-8 mb-4">
        <motion.button
          onClick={prevTrack}
          whileHover={{ scale: 1.1 }}
          className="text-purple-300"
        >
          <SkipBack size={32} />
        </motion.button>

        <motion.button
          onClick={togglePlay}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 
                     flex items-center justify-center shadow-lg relative"
        >
          {isPlaying ? (
            <Pause size={36} className="text-white" />
          ) : (
            <Play size={36} className="text-white" />
          )}
          {isPlaying && (
            <motion.span
              className="absolute inset-0 rounded-full bg-purple-500 blur-md opacity-30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>

        <motion.button
          onClick={nextTrack}
          whileHover={{ scale: 1.1 }}
          className="text-purple-300"
        >
          <SkipForward size={32} />
        </motion.button>
      </div>
    </motion.div>
  );
}
