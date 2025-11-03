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
  const [lastTrackId, setLastTrackId] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const songId = currentTrack._id || currentTrack.id;
    if (!songId) return;

    if (lastTrackId !== songId) {
      const streamUrl = `${BASE_URL}/api/music/stream/${songId}`;
      audio.src = streamUrl;
      setLastTrackId(songId);
    }

    const onCanPlay = () => {
      setDuration(audio.duration || 0);
      if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime || 0);
    const onEnded = () => nextTrack();

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isPlaying, lastTrackId, BASE_URL]);

  const playTrack = (track, newQueue = []) => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setCurrentTrack(track);
    if (newQueue.length) setQueue(newQueue);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      setIsPlaying(true);
      audio.play();
    } else {
      audio.pause();
    }
  };

  const nextTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t._id === currentTrack._id);
    setCurrentTrack(queue[idx < queue.length - 1 ? idx + 1 : 0]);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t._id === currentTrack._id);
    setCurrentTrack(queue[idx > 0 ? idx - 1 : queue.length - 1]);
    setIsPlaying(true);
  };

  const seek = (value) => {
    const audio = audioRef.current;
    if (audio && duration > 0 && audio.readyState >= 2) {
      audio.currentTime = value * duration;
      setProgress(audio.currentTime);
    }
  };

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
        stopPlayback,
      }}
    >
      {children}
      <audio ref={audioRef} className="hidden" preload="metadata" crossOrigin="use-credentials" controlsList="nodownload noremoteplayback" />
    </PlayerContext.Provider>
  );
}
