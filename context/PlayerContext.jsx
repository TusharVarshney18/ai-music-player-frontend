"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children, user = null }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // 🧩 Normalize track URL
  const getAudioUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  // 🎧 Handle audio loading & playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const src =
      currentTrack.audioUrl || currentTrack.url || currentTrack.src || "";

    if (!src) {
      console.warn("⚠️ No valid audio source found for", currentTrack);
      return;
    }

    const finalUrl = getAudioUrl(src);
    audio.src = finalUrl;
    audio.load();

    const handleMetadata = () => {
      setDuration(audio.duration || 0);
      if (isPlaying) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn(
              "⚠️ Playback prevented until user interaction:",
              err.message
            );
            setIsPlaying(false);
          });
      }
    };

    const updateProgress = () => setProgress(audio.currentTime || 0);
    const handleEnded = () => nextTrack();

    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack]);

  // 🛑 Stop audio on logout
  useEffect(() => {
    if (!user) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      setCurrentTrack(null);
      setQueue([]);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
    }
  }, [user]);

  // ▶️ Toggle play/pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err.message);
        setIsPlaying(false);
      }
    }
  };

  // 🎵 Play new track
  const playTrack = (track, newQueue = []) => {
    const audio = audioRef.current;
    if (audio) audio.pause();

    setCurrentTrack(track);
    if (newQueue.length) setQueue(newQueue);
    setIsPlaying(true);
  };

  // ⏭️ Next track
  const nextTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t._id === currentTrack._id);
    if (idx < queue.length - 1) {
      setCurrentTrack(queue[idx + 1]);
    } else {
      // Loop back to start
      setCurrentTrack(queue[0]);
    }
  };

  // ⏮️ Previous track
  const prevTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t._id === currentTrack._id);
    if (idx > 0) {
      setCurrentTrack(queue[idx - 1]);
    } else {
      // Go to last track
      setCurrentTrack(queue[queue.length - 1]);
    }
  };

  // ⏩ Seek progress
  const seek = (value) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = value * duration;
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  //
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        queue,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setIsPlaying,
        stopPlayback,
      }}
    >
      {children}
      <audio ref={audioRef} className="hidden" preload="metadata" />
    </PlayerContext.Provider>
  );
}
