"use client";
import { useRouter } from "next/navigation";

import {
  Library,
  Heart,
  Plus,
  Bot,
  ListMusic,
  Music2Icon,
  Music3Icon,
  Gamepad,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ activeTab, onTabChange }) {
  const router = useRouter();

  const changeTab = (tab) => {
    if (tab === "playlists") {
      router.push("/playlistpage");
    } else if (tab === "playlist") {
      router.push("/songs");
    } else if (tab === "game") {
      router.push("/gamepage");
    } else if (tab === "liked") {
      router.push("/liked");
    } else if (onTabChange) {
      onTabChange(tab);
    }
  };

  const navButtons = [
    {
      key: "home",
      label: "Chatbot",
      icon: <Bot size={20} />,
      mobileLabel: "Chat",
    },
    {
      key: "albums",
      label: "Albums",
      icon: <Library size={20} />,
      mobileLabel: "Albums",
    },
    {
      key: "liked",
      label: "Liked Songs",
      icon: <Heart size={20} className="text-pink-400" />,
      mobileLabel: "Liked",
    },
    {
      key: "playlists",
      label: "Playlists",
      icon: <ListMusic size={20} />,
      mobileLabel: "Playlists",
    },
    {
      key: "playlist",
      label: "Songs",
      icon: <Music2Icon size={20} />,
      mobileLabel: "Songs",
    },
    {
      key: "game",
      label: "Games",
      icon: <Gamepad size={20} />,
      mobileLabel: "Game",
    },
  ];

  return (
    <>
      {/* === Desktop Sidebar === */}
      <aside className="hidden md:flex flex-col bg-gray-900 text-white w-64 p-5 rounded-r-2xl shadow-2xl min-h-screen">
        <div
          className="hidden md:flex flex-col justify-between
                        bg-gradient-to-b from-[#0f011f] via-[#15032f] to-[#1a033f]
                        border-r border-purple-700/30
                        backdrop-blur-2xl
                        shadow-[4px_0_40px_rgba(139,92,246,0.15)]
                        p-5 w-64 h-screen fixed left-0 top-0"
        >
          <div className="relative flex flex-col gap-2 mt-15">
            {navButtons.map((btn) => {
              const isActive = activeTab === btn.key;
              return (
                <motion.button
                  key={btn.key}
                  onClick={() => changeTab(btn.key)}
                  whileHover={{ scale: 1.03, x: 6 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 w-full ${
                    isActive
                      ? "bg-gradient-to-r from-purple-700/40 to-fuchsia-700/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "text-gray-400 hover:text-purple-200 hover:bg-gray-800/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-glow"
                      className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-fuchsia-500"
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 25,
                      }}
                    />
                  )}

                  <motion.div
                    className="flex items-center justify-center"
                    animate={{ rotate: isActive ? [0, -5, 5, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: isActive ? 1 : 0 }}
                  >
                    {btn.icon}
                  </motion.div>

                  <span>{btn.label}</span>

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-purple-400/10 to-transparent opacity-0"
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <hr className="my-5 border-gray-700" />

          <div className="flex items-center justify-between text-gray-400 text-sm mt-auto">
            <p className="italic">Music Player</p>
            <Plus size={16} className="cursor-pointer hover:text-purple-400" />
          </div>
        </div>
      </aside>

      {/* === Mobile Bottom Navigation === */}
      <nav
        className="md:hidden fixed bottom--0 left-0 right-0 
                      bg-gray-900/70 backdrop-blur-lg border-t border-gray-800/50 
                      flex items-center justify-around py-2 px-3 z-50 shadow-2xl"
      >
        {navButtons.map((btn) => {
          const isActive = activeTab === btn.key;
          return (
            <motion.button
              key={btn.key}
              onClick={() => changeTab(btn.key)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center justify-center flex-1 transition-all duration-300 ${
                isActive
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-purple-300"
              }`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative"
              >
                {btn.icon} {/* ✅ Render icon directly */}
                {isActive && (
                  <motion.span
                    layoutId="active-dot"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? "text-purple-400" : "text-gray-400"
                }`}
              >
                {btn.mobileLabel}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}
