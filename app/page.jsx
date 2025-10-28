"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Playlist from "../components/playlists/Playlist";
import ChatBot from "../components/ChatBot";
import DemoAlert from "../components/Alert";
import LoginPage from "./login/page";
import AlbumList from "../components/AlbumList";
import { apiFetch } from "./utils/route";
import { usePlayer } from "@/context/PlayerContext";
import LikedSongsPage from "@/app/liked/page";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [likedTracks, setLikedTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const { playTrack } = usePlayer();

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
    const results = tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
    setFilteredTracks(results);
  };

  const handleLikeTrack = (track) => {
    if (!likedTracks.find((t) => t._id === track._id)) {
      setLikedTracks([...likedTracks, track]);
    }
  };

  const handleAlbumSelect = (album) => {
    setPlaylistTracks(album.tracks);
    setActiveTab("playlists");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <LoginPage onLogin={handleLogin} />
        <DemoAlert />
      </div>
    );
  }

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden relative">
      {/* Sidebar (Left for desktop) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950/70 backdrop-blur-md">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          likedTracks={likedTracks}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-gray-900 via-purple-900 to-black">
          <Navbar
            onLogout={handleLogout}
            onSearch={handleSearch}
            onSearchSelect={(song) => playTrack(song)}
          />
        </div>

        {/* Scrollable Content */}
        <section className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 mb-[110px] md:mb-[100px]">
          <div className="max-w-full md:max-w-6xl mx-auto mt-2 space-y-4 sm:space-y-6 md:space-y-10">
            {activeTab === "home" && (
              <div className="space-y-6 sm:space-y-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                  🏠 Welcome Home
                </h2>
                <div className="bg-gray-800/70 rounded-xl shadow-lg p-2 sm:p-4">
                  <ChatBot />
                </div>
              </div>
            )}

            {activeTab === "search" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4 text-center">
                  🔍 Search Results
                </h2>
                <LikedSongsPage
                  tracks={filteredTracks}
                  onSelect={playTrack}
                  onLike={handleLikeTrack}
                />
              </div>
            )}

            {activeTab === "liked" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">
                  ❤️ Liked Songs
                </h2>
                <Playlist
                  tracks={likedTracks}
                  onSelect={playTrack}
                  onLike={handleLikeTrack}
                />
              </div>
            )}

            {activeTab === "albums" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">
                  🎵 Albums
                </h2>
                <AlbumList
                  onSelectAlbum={handleAlbumSelect}
                  onSelectTrack={playTrack}
                />
              </div>
            )}

            {activeTab === "playlists" && (
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-4">
                  🎶 Selected Album
                </h2>
                <Playlist
                  tracks={playlistTracks}
                  onSelect={playTrack}
                  onLike={handleLikeTrack}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar (Bottom on mobile) */}
      <div className="md:hidden fixed bottom-[65px] left-0 w-full z-30 bg-gray-900/90 border-t border-gray-800 shadow-md backdrop-blur-md">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          likedTracks={likedTracks}
          layout="bottom"
        />
      </div>

      {/* <div className="fixed bottom-0 left-0 w-full z-40">
        <PlayerControls />
      </div> */}
    </main>
  );
}
