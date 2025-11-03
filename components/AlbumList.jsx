"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// 🎵 Track Card
function TrackCard({ track, onSelect }) {
  // Dynamic fallback cover
  const getFallbackCover = (album = "") => {
    const name = album.toLowerCase();
    if (name.includes("punjabi")) return "/covers/default-punjabi.jpg";
    if (name.includes("hindi")) return "/covers/default-hindi.jpg";
    if (name.includes("english")) return "/covers/default-english.jpg";
    return "/covers/default.jpg";
  };

  const cover = track.cover || getFallbackCover(track.album);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="min-w-[130px] bg-gray-800 rounded-lg shadow p-2 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition"
      onClick={() => onSelect(track)}
    >
      <div className="relative w-full h-48 rounded-md overflow-hidden">
        <Image src={cover} alt={track.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="mt-1 text-center w-full">
        <h4 className="text-xs font-semibold truncate">{track.title}</h4>
        <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
      </div>
    </motion.div>
  );
}

// 💿 Album Card
function AlbumCard({ album, onClick }) {
  const getFallbackCover = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("punjabi")) return "/covers/default-punjabi.jpg";
    if (lower.includes("hindi")) return "/covers/default-hindi.jpg";
    if (lower.includes("english")) return "/covers/default-english.jpg";
    return "/covers/default.jpg";
  };

  const albumCover = album.cover || getFallbackCover(album.name);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="cursor-pointer bg-gray-800 rounded-xl shadow-lg border border-white/10 overflow-hidden hover:bg-gray-750 min-w-[200px]"
      onClick={onClick}
    >
      <div className="relative w-full h-44">
        <Image src={albumCover} alt={album.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="p-4">
        <h2 className="text-base font-bold truncate">{album.name}</h2>
        <p className="mt-1 text-gray-400 text-xs">{album.tracks.length} songs</p>
      </div>
    </motion.div>
  );
}

// 🎶 Track List
function TrackList({ tracks, onSelect }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleTracks = tracks.slice(0, visibleCount);

  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {visibleTracks.map((track) => (
          <TrackCard key={track._id || track.title} track={track} onSelect={onSelect} />
        ))}
      </div>

      {visibleCount < tracks.length && (
        <div className="flex justify-center mt-4">
          <button onClick={() => setVisibleCount((c) => c + 10)} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">
            Load More Songs ({tracks.length - visibleCount} left)
          </button>
        </div>
      )}
    </>
  );
}

// 🌟 Main Component
export default function AlbumList({ onSelectTrack }) {
  const [albums, setAlbums] = useState([]);
  const [expandedAlbum, setExpandedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleAlbums, setVisibleAlbums] = useState(6);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch(`https://ai-music-player-backend.vercel.app/api/music`);
        if (!res.ok) throw new Error("Failed to fetch songs");

        const data = await res.json();
        const songs = Array.isArray(data) ? data : data.songs || [];

        const grouped = songs.reduce((acc, song) => {
          const albumName = song.album?.trim() || "Singles";
          if (!acc[albumName]) acc[albumName] = [];
          acc[albumName].push(song);
          return acc;
        }, {});

        const albumList = Object.entries(grouped).map(([name, tracks]) => ({
          id: name,
          name,
          cover: tracks[0]?.cover,
          tracks,
        }));

        setAlbums(albumList);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const handleSelectTrack = (track) => {
    if (!track?.url) return console.warn("No playable URL for track:", track);
    if (typeof onSelectTrack === "function") onSelectTrack(track);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading albums...</div>;

  const displayedAlbums = albums.slice(0, visibleAlbums);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 sm:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Albums</h1>

      {/* 💿 Album Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
        {displayedAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} onClick={() => setExpandedAlbum((prev) => (prev === album.id ? null : album.id))} />
        ))}
      </div>

      {/* 📱 Mobile Carousel */}
      <div className="sm:hidden flex overflow-x-auto gap-6 px-4 pb-6 snap-x snap-mandatory scrollbar-hide">
        {displayedAlbums.map((album) => (
          <motion.div key={album.id} className="snap-center flex-shrink-0 w-52" whileTap={{ scale: 0.97 }}>
            <AlbumCard album={album} onClick={() => setExpandedAlbum((prev) => (prev === album.id ? null : album.id))} />
          </motion.div>
        ))}
      </div>

      {/* Load More Albums */}
      {visibleAlbums < albums.length && (
        <div className="flex justify-center mt-4">
          <button onClick={() => setVisibleAlbums((a) => a + 6)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition">
            Load More Albums ({albums.length - visibleAlbums} left)
          </button>
        </div>
      )}

      {/* 🎵 Songs in Expanded Album */}
      <AnimatePresence>
        {expandedAlbum && (
          <motion.section
            key={expandedAlbum}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            {albums
              .filter((a) => a.id === expandedAlbum)
              .map((album) => (
                <div key={album.id} className="mt-8 mb-20">
                  <h2 className="text-3xl font-semibold mb-6 text-center">{album.name}</h2>
                  <TrackList tracks={album.tracks} onSelect={handleSelectTrack} />
                </div>
              ))}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
