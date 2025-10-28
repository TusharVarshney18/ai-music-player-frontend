"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../utils/route";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Login request
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ✅ Save user in localStorage
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // fallback if backend only returns success
        localStorage.setItem("user", JSON.stringify({ username }));
      }

      if (onLogin) onLogin();
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-4">
      <form
        onSubmit={handleLogin}
        className="backdrop-blur-md bg-white/10 border border-purple-500 rounded-xl shadow-lg p-8 max-w-sm w-full"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
        >
          Login
        </button>

        <p className="mt-4 text-center text-purple-300 text-sm">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="underline text-purple-400 hover:text-purple-200"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
