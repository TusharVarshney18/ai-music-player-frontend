"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, RefreshCw, Shuffle, Heart } from "lucide-react";

export default function NowPlayingModal({ onClose }) {
  const { currentTrack, isPlaying, progress, duration, togglePlay, nextTrack, prevTrack, seek, loop, toggleLoop, shuffle, toggleShuffle, liked, toggleLike } =
    usePlayer();

  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Motion value for smooth animation
  const progressMotion = useMotionValue(0);
  const progressPercent = useTransform(progressMotion, (v) => `${v * 100}%`);

  // Smoothly animate motion value when progress updates
  useEffect(() => {
    if (!seeking && duration > 0) {
      const ratio = progress / duration;
      animate(progressMotion, ratio, { duration: 0.2, ease: "easeOut" });
    }
  }, [progress, duration, seeking]);

  if (!currentTrack) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    setSeeking(true);
    setSeekValue(val);
    progressMotion.set(val); // update visual instantly
  };

  const handleSeekCommit = (e) => {
    const val = parseFloat(e.target.value);
    setSeeking(false);
    seek(val); // ratio-based seek
  };

  const displayedRatio = seeking ? seekValue : progress / duration || 0;

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
        <img src={currentTrack.cover || "/covers/default-english.jpg"} alt="cover" className="w-72 h-72 rounded-2xl shadow-xl object-cover" />
        <h1 className="text-2xl font-semibold text-center">{currentTrack.title}</h1>
        <p className="text-gray-400 text-center">{currentTrack.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(displayedRatio * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 bg-gray-700/60 rounded-full overflow-hidden group">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 rounded-full"
            style={{ width: progressPercent }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={displayedRatio}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 items-center mt-8 mb-4">
        <div className="flex items-center gap-8">
          <motion.button onClick={prevTrack} whileHover={{ scale: 1.1 }} className="text-purple-300" title="Previous">
            <SkipBack size={32} />
          </motion.button>

          <motion.button
            onClick={togglePlay}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 
              flex items-center justify-center shadow-lg relative"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={36} className="text-white" /> : <Play size={36} className="text-white" />}
            {isPlaying && (
              <motion.span
                className="absolute inset-0 rounded-full bg-purple-500 blur-md opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.button>

          <motion.button onClick={nextTrack} whileHover={{ scale: 1.1 }} className="text-purple-300" title="Next">
            <SkipForward size={32} />
          </motion.button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-6 mt-3">
          <button title="Loop" className={loop ? "text-fuchsia-400" : "text-gray-400 hover:text-white"} onClick={toggleLoop}>
            <RefreshCw size={23} />
          </button>

          <button title="Shuffle" className={shuffle ? "text-fuchsia-400" : "text-gray-400 hover:text-white"} onClick={toggleShuffle}>
            <Shuffle size={23} />
          </button>

          <button
            title="Like"
            className={liked?.has?.(currentTrack._id) ? "text-pink-500" : "text-gray-400 hover:text-white"}
            onClick={() => toggleLike && toggleLike(currentTrack._id)}
          >
            <Heart size={23} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
