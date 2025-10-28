"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Settings } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

import SearchBar from "./SearchBar";

const Navbar = ({ onLogout, onSearchSelect }) => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { stopPlayback } = usePlayer();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    // Clear token or localStorage
    localStorage.removeItem("token");

    // Stop music
    stopPlayback();

    // Redirect or reset state
    router.push("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-black shadow-lg border-b border-purple-700 fixed w-full z-50 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-purple-400 drop-shadow-neon">
            🎵
          </span>
          <span className="text-xl font-bold text-white">AI Music</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {/* 🔹 SearchBar for desktop */}
          <div className="w-72">
            <SearchBar onSelect={onSearchSelect} />
          </div>

          {user ? (
            <>
              <span className="font-medium text-purple-300">
                {user.username}
              </span>
              <Link
                href="/settings"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-purple-700 transition text-white"
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-semibold text-white"
            >
              Login
            </button>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-purple-700 px-4 py-4 space-y-4">
          {/* 🔍 Mobile SearchBar */}
          <div className="w-full mb-3">
            <SearchBar onSelect={onSearchSelect} />
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <span className="font-medium text-purple-300">
                  {user.username}
                </span>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-purple-700 transition text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-semibold text-white"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .drop-shadow-neon {
          text-shadow: 0 0 8px #a855f7, 0 0 16px #06b6d4;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
