"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const audioRef = useRef(null);
  const previewTimeout = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 🟣 Check viewport width on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Fetch songs dynamically from your backend
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://ai-music-player-backend.vercel.app/api/music/search?q=${encodeURIComponent(
            query
          )}`
        );

        if (!res.ok) throw new Error("Failed to fetch songs");
        const data = await res.json();
        setResults(data.songs || []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // 🔹 Keyboard navigation
  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      selectSong(results[activeIndex]);
    }
  };

  // 🔹 Audio preview
  const playPreview = (url) => {
    stopPreview();
    if (!url) return;
    audioRef.current = new Audio(url);
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch(() => {});
    previewTimeout.current = setTimeout(() => stopPreview(), 10000);
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
  };

  // 🔹 Song selection logic
  const selectSong = (song) => {
    if (onSelect) onSelect(song);
    stopPreview();
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <>
      {/* 🔍 Search Input (desktop view) */}
      <div className="relative w-full max-w-md mx-auto md:mx-0">
        <div
          className="relative"
          onClick={() => {
            if (isMobile) setOpen(true);
          }}
        >
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, or albums..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white 
            focus:ring-2 focus:ring-purple-500 outline-none 
            transition-all duration-200 
            ${isMobile ? "cursor-pointer" : "cursor-text"}`}
            readOnly={isMobile}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-400" />
          )}
        </div>

        {/* 🖥️ Desktop Dropdown */}
        {!isMobile && query && results.length > 0 && (
          <ul className="absolute z-50 w-full mt-2 bg-gray-900 border border-purple-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((song, index) => (
              <li
                key={song._id}
                onClick={() => selectSong(song)}
                onMouseEnter={() => playPreview(song.url)}
                onMouseLeave={stopPreview}
                className={`px-4 py-2 flex flex-col cursor-pointer transition-colors duration-150 ${
                  activeIndex === index
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                <span className="text-white font-medium truncate">
                  {song.title} —{" "}
                  <span className="text-purple-300">{song.artist}</span>
                </span>
                {song.album && (
                  <span className="text-xs text-gray-400 truncate">
                    {song.album}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📱 Mobile Fullscreen Search Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur-xl flex flex-col p-4"
          >
            <div className="flex items-center mb-4">
              <button onClick={() => setOpen(false)} className="text-gray-300">
                <X size={26} />
              </button>
              <div className="flex-1 relative ml-3">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search songs, artists, or albums..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 outline-none text-base sm:text-lg"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-400" />
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <p className="text-center text-gray-400 mt-8">Loading...</p>
              )}

              {!loading && results.length > 0 && (
                <ul>
                  {results.map((song) => (
                    <li
                      key={song._id}
                      onClick={() => selectSong(song)}
                      onTouchStart={() => playPreview(song.url)} // ✅ Mobile-friendly hover
                      onTouchEnd={stopPreview}
                      className="p-3 border-b border-gray-700 hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-150 active:bg-purple-700"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-base sm:text-lg">
                          {song.title}
                        </span>
                        <span className="text-sm text-gray-400">
                          {song.artist} — {song.album}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && query && results.length === 0 && (
                <p className="text-center text-gray-500 mt-10">
                  No songs found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
