"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause, SkipBack, SkipForward, RefreshCw, Shuffle, Heart } from "lucide-react";

export default function NowPlayingModal({ onClose }) {
  const { currentTrack, isPlaying, progress, duration, togglePlay, nextTrack, prevTrack, seek, loop, toggleLoop, shuffle, toggleShuffle, liked, toggleLike } =
    usePlayer();

  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  if (!currentTrack) return null;

  // Cover logic
  const getDefaultCover = (lang = "") => {
    lang = lang.toLowerCase();
    if (lang.includes("hindi")) return "/covers/default-hindi.jpg";
    if (lang.includes("punjabi")) return "/covers/default-punjabi.jpg";
    return "/covers/default-english.jpg";
  };

  const coverSrc = currentTrack.cover || getDefaultCover(currentTrack.language || "");

  // Format time
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Local value for bar
  const displayProgress = seeking ? seekValue : progress;
  const progressRatio = duration ? displayProgress / duration : 0;

  // Seek UI handlers
  const handleSeekChange = (e) => {
    setSeeking(true);
    setSeekValue(parseFloat(e.target.value) * duration);
  };
  const handleSeekCommit = (e) => {
    setSeeking(false);
    seek(parseFloat(e.target.value));
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
        <img src={coverSrc} alt="cover" className="w-72 h-72 rounded-2xl shadow-xl object-cover" />
        <h1 className="text-2xl font-semibold text-center">{currentTrack.title}</h1>
        <p className="text-gray-400 text-center">{currentTrack.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{formatTime(displayProgress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 bg-gray-700/60 rounded-full overflow-hidden group">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 rounded-full"
            style={{ width: `${progressRatio * 100}%` }}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ duration: 0.15 }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progressRatio}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            onMouseLeave={() => setSeeking(false)}
            onBlur={() => setSeeking(false)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek"
          />
        </div>
      </div>

      {/* Controls + options */}
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
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
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
        {/* Option Buttons: Loop, Shuffle, Like */}
        <div className="flex items-center gap-6 mt-3">
          <button title="Loop song" className={loop ? "text-fuchsia-400" : "text-gray-400 hover:text-white"} onClick={toggleLoop}>
            <RefreshCw size={23} />
          </button>
          <button title="Shuffle" className={shuffle ? "text-fuchsia-400" : "text-gray-400 hover:text-white"} onClick={toggleShuffle}>
            <Shuffle size={23} />
          </button>
          <button
            title="Like this song"
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
