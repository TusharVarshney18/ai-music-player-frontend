"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function TicTacToeGame() {
  const router = useRouter();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(5); // 1–10 scale

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (newBoard) => {
    for (let [a, b, c] of winPatterns) {
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        return newBoard[a];
      }
    }
    if (!newBoard.includes(null)) return "Draw";
    return null;
  };

  const handlePlayerMove = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setPlayerTurn(false);
  };

  // 🎯 AI Move logic with difficulty scaling
  const getAIMove = (board, difficulty) => {
    const empty = board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);

    const smartChance = difficulty * 10; // 10% smarter per level
    const smartPlay = Math.random() * 100 < smartChance;

    // If smart, try to win or block
    if (smartPlay) {
      // Try to win
      for (let [a, b, c] of winPatterns) {
        if (board[a] === "O" && board[b] === "O" && board[c] === null) return c;
        if (board[a] === "O" && board[c] === "O" && board[b] === null) return b;
        if (board[b] === "O" && board[c] === "O" && board[a] === null) return a;
      }

      // Try to block
      for (let [a, b, c] of winPatterns) {
        if (board[a] === "X" && board[b] === "X" && board[c] === null) return c;
        if (board[a] === "X" && board[c] === "X" && board[b] === null) return b;
        if (board[b] === "X" && board[c] === "X" && board[a] === null) return a;
      }
    }

    // Else pick random
    return empty[Math.floor(Math.random() * empty.length)];
  };

  // 🧠 AI Turn
  useEffect(() => {
    if (!playerTurn && !winner && !gameOver) {
      const move = getAIMove(board, difficulty);
      if (move === undefined) return;
      setTimeout(() => {
        const newBoard = [...board];
        newBoard[move] = "O";
        setBoard(newBoard);
        setPlayerTurn(true);
      }, 700);
    }
  }, [playerTurn]);

  // Check winner
  useEffect(() => {
    const result = checkWinner(board);
    if (result) {
      setWinner(result);
      setGameOver(true);
    }
  }, [board]);

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setGameOver(false);
    setPlayerTurn(true);
  };

  const handleBack = () => router.push("/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-800 to-pink-700 text-white relative overflow-hidden p-6">
      {/* Back Button */}
      <motion.button
        onClick={handleBack}
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </motion.button>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
        ❌ Tic Tac Toe ⭕
      </h1>
      {!winner && (
        <p className="mb-3 text-lg">
          Turn: {playerTurn ? "You (X)" : "AI (O)"} • Difficulty: {difficulty}
        </p>
      )}

      {/* Difficulty Slider */}
      {!gameOver && (
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="difficulty" className="text-sm text-gray-300">
            Difficulty
          </label>
          <input
            id="difficulty"
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-40 accent-pink-500 cursor-pointer"
          />
        </div>
      )}

      {/* Winner Message */}
      {winner && (
        <motion.p
          className="text-2xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {winner === "Draw"
            ? "😐 It's a Draw!"
            : winner === "X"
            ? "🎉 You Win!"
            : "🤖 AI Wins!"}
        </motion.p>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-3 gap-3 bg-black/30 p-4 rounded-xl border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            onClick={() => handlePlayerMove(i)}
            disabled={!!cell || !playerTurn || winner}
            className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-4xl font-bold flex items-center justify-center rounded-lg bg-gray-800/70 hover:bg-gray-700 transition ${
              cell === "X"
                ? "text-pink-400"
                : cell === "O"
                ? "text-blue-400"
                : "text-gray-400"
            }`}
            whileTap={{ scale: 0.9 }}
          >
            {cell}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        <motion.button
          onClick={handleRestart}
          className="flex items-center gap-2 px-6 py-3 bg-pink-500 rounded-full font-semibold hover:bg-pink-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RotateCcw size={18} /> Restart
        </motion.button>
      </div>
    </div>
  );
}
