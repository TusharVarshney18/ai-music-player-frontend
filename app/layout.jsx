"use client";
import "./globals.css";

import { PlayerProvider, usePlayer } from "@/context/PlayerContext";
import PlayerController from "@/components/PlayerControls";

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
  const { currentTrack, playNext, playPrev } = usePlayer();

  return currentTrack ? (
    <PlayerController
      currentTrack={currentTrack}
      onNext={playNext}
      onPrev={playPrev}
    />
  ) : null;
}
