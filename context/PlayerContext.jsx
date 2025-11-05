"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [liked, setLiked] = useState(new Set());

  /* ---------------- Load Likes ---------------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setLiked(new Set(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify([...liked]));
  }, [liked]);

  /* ---------------- Main Playback Logic ---------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const url = currentTrack.url;
    if (!url) return;

    // Set source to direct Cloudinary URL
    audio.src = url;
    audio.crossOrigin = "anonymous"; // Cloudinary serves CORS-enabled media
    audio.load();

    // Play when ready if state says so
    const handleCanPlay = async () => {
      setDuration(audio.duration || 0);
      if (isPlaying) {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay prevented:", err);
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress(audio.currentTime || 0);
    const handleEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    const handleError = (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrack, isPlaying, loop]);

  /* ---------------- Controls ---------------- */
  const playTrack = (track, newQueue = []) => {
    if (!track) return;
    if (newQueue.length) setQueue(newQueue);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused || audio.readyState < 2) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Play error:", err);
      }
    } else {
      audio.pause();
    }
  };

  const nextTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => (t._id || t.id) === (currentTrack._id || currentTrack.id));
    let nextIdx;
    if (shuffle) {
      do {
        nextIdx = Math.floor(Math.random() * queue.length);
      } while (nextIdx === idx && queue.length > 1);
    } else {
      nextIdx = idx < queue.length - 1 ? idx + 1 : 0;
    }
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => (t._id || t.id) === (currentTrack._id || currentTrack.id));
    const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
    setCurrentTrack(queue[prevIdx]);
    setIsPlaying(true);
  };

  const seek = (ratio) => {
    const audio = audioRef.current;
    if (audio && duration > 0 && audio.readyState >= 2) {
      const newTime = ratio * duration;
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const toggleLoop = () => setLoop((p) => !p);
  const toggleShuffle = () => setShuffle((p) => !p);

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setDuration(0);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        progress,
        duration,
        loop,
        shuffle,
        liked,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        toggleLoop,
        toggleShuffle,
        toggleLike,
        stopPlayback,
        setIsPlaying,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" className="hidden" controlsList="nodownload noremoteplayback" crossOrigin="anonymous" />
    </PlayerContext.Provider>
  );
}
