"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children, user = null }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [liked, setLiked] = useState(new Set());
  const [activeToken, setActiveToken] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  /* --------------------- Load likes from storage --------------------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    setLiked(new Set(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify([...liked]));
  }, [liked]);

  /* --------------------- Main playback effect --------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !user) return;

    const id = currentTrack._id || currentTrack.id;
    if (!id) return;

    let abort = false;

    // Fetch a fresh short-lived stream token
    const fetchTokenAndPlay = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/music/stream-token/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Token fetch failed");
        const { token } = await res.json();
        if (abort) return;

        setActiveToken(token);
        const streamUrl = `${BASE_URL}/api/music/stream/${id}?t=${encodeURIComponent(token)}`;

        audio.src = streamUrl;
        audio.crossOrigin = "use-credentials";
        audio.load();

        if (isPlaying) {
          await audio.play().catch((err) => {
            console.warn("Autoplay prevented:", err);
          });
        }
      } catch (err) {
        console.error("Stream token error:", err);
        setIsPlaying(false);
      }
    };

    fetchTokenAndPlay();

    // Handlers
    const handleCanPlay = () => {
      setDuration(audio.duration || 0);
      if (isPlaying) audio.play().catch(console.warn);
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
      console.warn("Audio error:", e);
      // Retry once if token expired
      if (!abort && e.target?.error?.code === e.target?.error?.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        console.log("Retrying with new stream token...");
        fetchTokenAndPlay();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      abort = true;
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrack, isPlaying, loop, user, BASE_URL]);

  /* --------------------- Stop everything on logout --------------------- */
  useEffect(() => {
    if (!user) stopPlayback();
  }, [user]);

  /* --------------------- Controls --------------------- */
  const playTrack = (track, newQueue = []) => {
    if (!track) return;
    if (newQueue.length) setQueue(newQueue);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
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
    setActiveToken(null);
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
      <audio ref={audioRef} preload="metadata" className="hidden" controlsList="nodownload noremoteplayback" crossOrigin="use-credentials" />
    </PlayerContext.Provider>
  );
}
