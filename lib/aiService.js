export async function askAIStream(message, onWord) {
   try {
      const res = await fetch("https://ai-music-player-backend.vercel.app/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI response");

      // Get a reader for streaming chunks
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let buffer = "";

      while (!done) {
         const { value, done: doneReading } = await reader.read();
         done = doneReading;
         buffer += decoder.decode(value, { stream: true });

         // Split by newline for word chunks
         let lines = buffer.split("\n");
         buffer = lines.pop(); // keep last incomplete line

         for (const line of lines) {
            const text = line.replace(/^data: /, "").trim();
            if (text && text !== "[DONE]") {
               onWord(text); // call callback for each word
            }
         }
      }
   } catch (error) {
      console.error("AI Stream Error:", error);
      onWord("Sorry, I couldn't get recommendations right now.");
   }
}
