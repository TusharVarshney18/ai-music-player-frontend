"use client";

import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";
import NowPlayingModal from "@/components/NowPlayingModal";
import { useEffect, useState } from "react";

const SIDEBAR_HEIGHT_MOBILE = 64;

// --- MOBILE PLAYER BAR ---
function MobilePlayerBar({ onExpand, onClose }) {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = usePlayer();
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
      className="fixed left-0 right-0 bottom-[64px] z-[60] h-[74px]
        bg-gradient-to-r from-purple-900/90 to-black border-t border-purple-700/40
        flex items-center px-2 py-2 gap-2 shadow-2xl backdrop-blur-lg
        cursor-pointer md:hidden"
      onClick={onExpand}
    >
      {/* Close button */}
      <button
        className="absolute top-2 right-4 text-xl text-gray-300 hover:text-red-400"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Hide Player"
      >
        <X size={22} />
      </button>
      {/* Track Cover */}
      <img src={currentTrack.cover || "/placeholder.jpg"} alt="cover" className="w-11 h-11 rounded-md object-cover shadow-md" />
      {/* Info */}
      <div className="min-w-0 flex-1 truncate px-2">
        <div className="text-sm font-bold truncate">{currentTrack.title || "Unknown"}</div>
        <div className="text-xs text-gray-400 truncate">{currentTrack.artist || "Unknown Artist"}</div>
      </div>
      {/* Controls - Touch Targets */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevTrack();
          }}
          className="text-purple-300 p-2"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow px-2 py-1 rounded-full flex justify-center items-center"
        >
          {isPlaying ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextTrack();
          }}
          className="text-purple-300 p-2"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </motion.div>
  );
}

// --- DESKTOP PLAYER BAR ---
function DesktopPlayerBar({ onExpand, onClose }) {
  const { currentTrack, isPlaying, progress, duration, togglePlay, nextTrack, prevTrack, seek } = usePlayer();
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  return (
    <motion.div
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
      className="fixed left-0 right-0 bottom-0 z-[60]
        bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-black
        border-t border-purple-700/40 shadow-[0_-8px_30px_rgba(139,92,246,0.20)]
        backdrop-blur-2xl text-white cursor-pointer h-[90px] hidden md:flex"
      onClick={onExpand}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-8 text-xl text-gray-300 hover:text-red-400"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Hide Player"
      >
        <X size={22} />
      </button>
      <div className="relative h-1 w-full bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-600 rounded-full"
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
          animate={{ width: `${(progress / duration) * 100 || 0}%` }}
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
      <div className="flex items-center justify-between px-6 py-2 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-3 w-[40%] min-w-0">
          <motion.img
            src={currentTrack.cover || "/placeholder.jpg"}
            alt="cover"
            className="w-12 h-12 rounded-lg object-cover shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate">{currentTrack?.title || "Unknown Track"}</h3>
            <p className="text-xs text-gray-400 truncate">{currentTrack?.artist || "Unknown Artist"}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-7 flex-1" onClick={(e) => e.stopPropagation()}>
          <motion.button onClick={prevTrack} whileHover={{ scale: 1.1 }} className="text-purple-300" aria-label="Previous">
            <SkipBack size={20} />
          </motion.button>
          <motion.button
            onClick={togglePlay}
            whileTap={{ scale: 0.9 }}
            className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 shadow-lg shadow-purple-700/40 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
          </motion.button>
          <motion.button onClick={nextTrack} whileHover={{ scale: 1.1 }} className="text-purple-300" aria-label="Next">
            <SkipForward size={20} />
          </motion.button>
        </div>
        <div className="w-[30%] text-right text-sm text-gray-400 font-medium">
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>
    </motion.div>
  );
}

export default function PlayerControls({ onClose }) {
  const { currentTrack, isPlaying, setIsPlaying } = usePlayer();
  const [isDesktop, setIsDesktop] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleLogout = () => setIsPlaying(false);
    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, [setIsPlaying]);

  if (!currentTrack) return null;

  return (
    <>
      {/* Player bar, conditionally visible */}
      {barVisible && (
        <AnimatePresence mode="wait">
          {isDesktop ? (
            <DesktopPlayerBar
              key="desktop-playerbar"
              onExpand={() => setExpanded(true)}
              onClose={() => {
                setBarVisible(false);
                if (onClose) onClose();
              }}
            />
          ) : (
            <MobilePlayerBar
              key="mobile-playerbar"
              onExpand={() => setExpanded(true)}
              onClose={() => {
                setBarVisible(false);
                if (onClose) onClose();
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Floating restore button */}
      {!barVisible && isPlaying && currentTrack && (
        <button
          className="fixed bottom-4 right-4 z-[999] bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white rounded-full p-4 shadow-xl animate-bounce flex items-center gap-2"
          aria-label="Show Player"
          onClick={() => setBarVisible(true)}
        >
          <Play size={22} />
          <span className="sr-only">Show Player Controls</span>
        </button>
      )}

      {/* Advanced Modal Player */}
      <AnimatePresence mode="wait">
        {expanded && <NowPlayingModal key="nowplaying" currentTrack={currentTrack} isPlaying={isPlaying} onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </>
  );
}
