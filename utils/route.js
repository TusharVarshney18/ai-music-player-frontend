// utils/apiFetch.js
export async function apiFetch(path, options = {}) {
   const headers = { ...(options.headers || {}) };

   if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
   }

   let res = await fetch(
      `https://ai-music-player-backend.vercel.app${path}`,
      {
         ...options,
         credentials: "include", // send cookies
         headers,
      }
   );

   // ✅ If access token expired, try refresh once
   if (res.status === 401 && path !== "/api/auth/refresh") {
      const refreshRes = await fetch(
         `https://ai-music-player-backend.vercel.app/api/auth/refresh`,
         { method: "POST", credentials: "include" }
      );

      if (refreshRes.ok) {
         // retry original request
         res = await fetch(
            `https://ai-music-player-backend.vercel.app${path}`,
            {
               ...options,
               credentials: "include",
               headers,
            }
         );
      }
   }

   return res;
}

// 🎵 Music API helpers
apiFetch.songs = {
   // Get all songs
   async list() {
      const res = await apiFetch("/api/music", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch songs");
      return res.json();
   },

   // Upload new song
   async upload(formData) {
      const res = await apiFetch("/api/music/upload", {
         method: "POST",
         body: formData,
      });
      if (!res.ok) throw new Error("Song upload failed");
      return res.json();
   },

   // Delete song
   async remove(publicId) {
      const res = await apiFetch(`/api/music/${publicId}`, {
         method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
   },
};


