"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/utils/route";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await apiFetch(`/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("✅ Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-4">
      <form
        onSubmit={handleRegister}
        className="backdrop-blur-md bg-white/10 border border-purple-500 rounded-xl shadow-lg p-8 max-w-sm w-full"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
        >
          Register
        </button>

        <p className="mt-4 text-center text-purple-300 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline text-purple-400 hover:text-purple-200"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
