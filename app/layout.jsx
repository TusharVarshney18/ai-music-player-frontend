"use client";
import "./globals.css";

import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import PlayerControls from "@/components/PlayerControls";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PlayerProvider>
          {children}
          <PlayerControllerGlobal />
        </PlayerProvider>
      </body>
    </html>
  );
}

// 👇 Global player instance (uses global player context)
function PlayerControllerGlobal() {
  const { currentTrack, nextTrack, prevTrack } = usePlayer();

  // Only show player when a track is playing
  return currentTrack ? <PlayerControls /> : null;
}
