"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Playlist from "../components/playlists/Playlist";
import ChatBot from "../components/ChatBot";
import DemoAlert from "../components/Alert";
import AlbumList from "../components/AlbumList";
import LikedSongsPage from "@/app/liked/page";
import { apiFetch } from "@/utils/route";
import { usePlayer } from "@/context/PlayerContext";
import PlayerControls from "../components/PlayerControls";
import { Play, X } from "lucide-react";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.setItem("user", JSON.stringify({ username }));
      }
      if (onLogin) onLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-4">
      <form onSubmit={handleLogin} className="backdrop-blur-md bg-white/10 border border-purple-500 rounded-xl shadow-lg p-8 max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition">
          Login
        </button>
        <p className="mt-4 text-center text-purple-300 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="underline text-purple-400 hover:text-purple-200">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [likedTracks, setLikedTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  // NEW: PlayerBar visibility UI state
  const [playerBarVisible, setPlayerBarVisible] = useState(true);

  // Get playback state for showing floating player
  const { playTrack, isPlaying, currentTrack } = usePlayer();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
      fetchTracks();
    }
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await apiFetch("/api/music");
      const data = await res.json();
      if (!data?.songs) throw new Error("Invalid response from server");
      setTracks(data.songs);
      setFilteredTracks(data.songs);
    } catch (error) {
      console.error("Fetch tracks error:", error);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchTracks();
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };
  const handleSearch = (query) => {
    const q = query.toLowerCase();
    const results = tracks.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    setFilteredTracks(results);
  };
  const handleLikeTrack = (track) => {
    if (!likedTracks.find((t) => t._id === track._id)) setLikedTracks([...likedTracks, track]);
  };
  const handleAlbumSelect = (album) => {
    setPlaylistTracks(album.tracks);
    setActiveTab("playlists");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <LoginForm onLogin={handleLogin} />
        <DemoAlert />
      </div>
    );
  }

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden relative">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950/70 backdrop-blur-md">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedTracks={likedTracks} />
      </div>
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-gray-900 via-purple-900 to-black">
          <Navbar onLogout={handleLogout} onSearch={handleSearch} onSearchSelect={playTrack} />
        </div>
        {/* Scrollable Content */}
        <section className="flex-1 overflow-y-auto px-4 py-2 sm:p-3 md:p-6 mb-[120px] md:mb-[100px]">
          <div className="max-w-full md:max-w-6xl mx-auto mt-2 space-y-4 sm:space-y-6 md:space-y-10">
            {activeTab === "home" && (
              <div className="space-y-6 sm:space-y-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">🏠 Welcome Home</h2>
                <div className="bg-gray-800/70 rounded-xl shadow-lg p-2 sm:p-4">
                  <ChatBot />
                </div>
              </div>
            )}
            {activeTab === "search" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4 text-center">🔍 Search Results</h2>
                <LikedSongsPage tracks={filteredTracks} onSelect={playTrack} onLike={handleLikeTrack} />
              </div>
            )}
            {activeTab === "liked" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">❤️ Liked Songs</h2>
                <Playlist tracks={likedTracks} onSelect={playTrack} onLike={handleLikeTrack} />
              </div>
            )}
            {activeTab === "albums" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">🎵 Albums</h2>
                <AlbumList onSelectAlbum={handleAlbumSelect} onSelectTrack={playTrack} />
              </div>
            )}
            {activeTab === "playlists" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">🎶 Selected Album</h2>
                <Playlist tracks={playlistTracks} onSelect={playTrack} onLike={handleLikeTrack} />
              </div>
            )}
          </div>
        </section>
      </div>
      {/* Sidebar (bottom on mobile, above player) */}
      <div className="md:hidden fixed bottom-[65px] left-0 w-full z-30 bg-gray-900/90 border-t border-gray-800 shadow-md backdrop-blur-md">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} likedTracks={likedTracks} layout="bottom" />
      </div>
      {/* Hideable/floating Player Bar */}
      {playerBarVisible && (
        <div className="fixed bottom-0 left-0 w-full z-40">
          <PlayerControls onClose={() => setPlayerBarVisible(false)} />
        </div>
      )}
      {/* Floating restore button when music is playing but UI is hidden */}
      {!playerBarVisible && isPlaying && currentTrack && (
        <button
          className="fixed bottom-4 right-4 z-[999] bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white rounded-full p-4 shadow-xl animate-bounce flex items-center gap-2"
          aria-label="Show Player"
          onClick={() => setPlayerBarVisible(true)}
        >
          <Play size={22} />
          <span className="sr-only">Show Player Controls</span>
        </button>
      )}
    </main>
  );
}
