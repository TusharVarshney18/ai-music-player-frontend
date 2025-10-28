"use client";

import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";
import NowPlayingModal from "@/components/NowPlayingModal";
import { useEffect, useState } from "react";

const SIDEBAR_HEIGHT_MOBILE = 64;

function PlayerBar({
  isDesktop,
  currentTrack,
  isPlaying,
  progress,
  duration,
  togglePlay,
  nextTrack,
  prevTrack,
  seek,
  onExpand,
}) {
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <motion.div
      key="player"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className={`fixed left-0 right-0 z-[60]
        bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-black
        border-t border-purple-700/40
        shadow-[0_-4px_30px_rgba(139,92,246,0.25)]
        backdrop-blur-2xl
        text-white cursor-pointer
        ${
          isDesktop
            ? "bottom-0 h-[90px]"
            : `bottom-[${SIDEBAR_HEIGHT_MOBILE}px] h-[80px]`
        }
      `}
      style={!isDesktop ? { bottom: SIDEBAR_HEIGHT_MOBILE } : {}}
      onClick={() => !isDesktop && onExpand()}
    >
      {/* 🎚️ Progress Bar (Fixed & Animated) */}
      <div className="relative h-1 w-full bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-600 rounded-full"
          style={{
            width: `${(progress / duration) * 100 || 0}%`,
          }}
          animate={{
            width: `${(progress / duration) * 100 || 0}%`,
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
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

      <div className="flex items-center justify-between px-4 md:px-8 py-2 md:py-3 max-w-[1400px] mx-auto">
        {/* 🎵 Track Info */}
        <div className="flex items-center gap-3 w-[40%] min-w-0">
          <motion.img
            src={currentTrack.cover || "/placeholder.jpg"}
            alt="cover"
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate">
              {currentTrack?.title || "Unknown Track"}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {currentTrack?.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* 🎛️ Controls */}
        <div
          className="flex items-center justify-center gap-5 md:gap-7 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={prevTrack}
            whileHover={{ scale: 1.1 }}
            className="text-purple-300"
            aria-label="Previous"
          >
            <SkipBack size={20} />
          </motion.button>

          <motion.button
            onClick={togglePlay}
            whileTap={{ scale: 0.9 }}
            className="relative w-12 h-12 flex items-center justify-center rounded-full 
                       bg-gradient-to-br from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 
                       shadow-lg shadow-purple-700/40 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white" />
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
            aria-label="Next"
          >
            <SkipForward size={20} />
          </motion.button>
        </div>

        {/* ⏱️ Time (Desktop only) */}
        {isDesktop && (
          <div className="w-[30%] text-right text-sm text-gray-400 font-medium">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// function NowPlayingModal({ currentTrack, isPlaying, togglePlay, onClose }) {
//   return (
//     <motion.div
//       initial={{ y: "100%" }}
//       animate={{ y: 0 }}
//       exit={{ y: "100%" }}
//       transition={{ type: "spring", damping: 25, stiffness: 250 }}
//       className="fixed inset-0 z-[100] bg-gradient-to-b from-black via-purple-950 to-black text-white flex flex-col items-center justify-between p-6"
//     >
//       <div className="flex justify-end w-full">
//         <button onClick={onClose}>
//           <X size={28} className="text-gray-400 hover:text-white" />
//         </button>
//       </div>

//       <div className="flex flex-col items-center gap-4">
//         <img
//           src={currentTrack.cover || "/placeholder.jpg"}
//           alt="cover"
//           className="w-72 h-72 rounded-2xl shadow-xl object-cover"
//         />
//         <h1 className="text-2xl font-semibold">{currentTrack.title}</h1>
//         <p className="text-gray-400">{currentTrack.artist}</p>
//       </div>

//       <motion.button
//         onClick={togglePlay}
//         whileTap={{ scale: 0.9 }}
//         className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg"
//       >
//         {isPlaying ? <Pause size={32} /> : <Play size={32} />}
//       </motion.button>
//     </motion.div>
//   );
// }

export default function PlayerControls() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setIsPlaying,
  } = usePlayer();

  const [isDesktop, setIsDesktop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧹 Stop music when user logs out
  useEffect(() => {
    const handleLogout = () => setIsPlaying(false);
    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, [setIsPlaying]);

  if (!currentTrack) return null;

  return (
    <>
      <AnimatePresence>
        <PlayerBar
          key="playerbar"
          isDesktop={isDesktop}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          togglePlay={togglePlay}
          nextTrack={nextTrack}
          prevTrack={prevTrack}
          seek={seek}
          onExpand={() => setExpanded(true)}
        />
      </AnimatePresence>

      {/* 🎧 Full Player Modal */}
      <AnimatePresence>
        {expanded && (
          <NowPlayingModal
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            togglePlay={togglePlay}
            seek={seek}
            onClose={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
