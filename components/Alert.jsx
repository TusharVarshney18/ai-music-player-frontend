"use client";
import { useState } from "react";

export default function DemoAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-6 rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-xl font-bold text-yellow-900 hover:text-red-600"
          aria-label="Dismiss"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-2">⚠ Note</h2>
        <p className="text-sm mb-1">
          This project is for <strong>demonstration purposes only</strong>.
        </p>
        <p className="text-sm mb-1">
          Your username and password are encrypted and stored securely.
        </p>
        <p className="text-sm mb-1">
          We do not seek or share any personal information.
        </p>
        <p className="text-sm text-red-700 font-semibold mt-2">
          ⚠ The songs used here are not owned by me. They are included only for
          project purposes.
        </p>
        <p className="text-sm text-red-700 font-semibold mt-2">
          ⚠ Please do not use this project for commercial purposes.
        </p>
      </div>
    </div>
  );
}
