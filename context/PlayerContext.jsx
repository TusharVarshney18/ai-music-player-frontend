"use client";
import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children, user = null }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [lastTrackId, setLastTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loop, setLoop] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const getAudioUrl = (track = {}) => {
    if (!track) return "";
    const songId = track._id || track.id;
    if (!songId) return "";
    return `${BASE_URL}/api/music/stream/${songId}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const songId = currentTrack._id || currentTrack.id;
    // Only reset/post new src if track actually changed
    if (lastTrackId !== songId) {
      const finalUrl = getAudioUrl(currentTrack);
      audio.pause();
      audio.src = finalUrl;
      audio.currentTime = 0;
      setProgress(0);
      setIsLoading(true);
      setLastTrackId(songId);
    }

    audio.loop = loop;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    };
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress(audio.currentTime || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (loop) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      nextTrack();
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrack, lastTrackId, isPlaying, loop]);

  // On logout, stop everything
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
      setIsLoading(false);
      setLastTrackId(null);
    }
  }, [user]);

  // CONTROLS ---
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
      }
    }
  };

  const playTrack = (track, newQueue = []) => {
    if (!track) return;
    const audio = audioRef.current;
    if (audio) audio.pause();
    setCurrentTrack(track);
    if (newQueue.length) setQueue(newQueue);
    setIsPlaying(true);
    // DON'T touch progress/duration; those update in effect on metadata!
  };

  const nextTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => (t._id || t.id) === (currentTrack._id || currentTrack.id));
    if (idx === -1) return;
    const nextIdx = idx < queue.length - 1 ? idx + 1 : 0;
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => (t._id || t.id) === (currentTrack._id || currentTrack.id));
    if (idx === -1) return;
    const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
    setCurrentTrack(queue[prevIdx]);
    setIsPlaying(true);
  };

  const seek = (value) => {
    const audio = audioRef.current;
    if (audio && duration > 0 && audio.readyState >= 2) {
      const newTime = Math.max(0, Math.min(duration, value * duration));
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const toggleLoop = () => setLoop((prev) => !prev);

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setLastTrackId(null);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        queue,
        isLoading,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        toggleLoop,
        loop,
        setIsPlaying,
        stopPlayback,
      }}
    >
      {children}
      <audio ref={audioRef} className="hidden" preload="metadata" crossOrigin="use-credentials" controlsList="nodownload noremoteplayback" />
    </PlayerContext.Provider>
  );
}
