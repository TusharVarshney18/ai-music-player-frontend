"use client";
import { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};
const isOpposite = (dir1, dir2) => dir1.x + dir2.x === 0 && dir1.y + dir2.y === 0;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveInterval = useRef(null);
  const touchStartRef = useRef(null);

  const getNewFoodPosition = (snakePositions) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snakePositions.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const handleKeyDown = (e) => {
    const newDir = DIRECTIONS[e.key];
    if (!newDir) return;
    if (!isOpposite(direction, newDir)) setDirection(newDir);
  };

  const handleButtonPress = (directionKey) => {
    const newDir = DIRECTIONS[directionKey];
    if (!newDir) return;
    if (!isOpposite(direction, newDir)) setDirection(newDir);
  };

  const handleTouchStart = (e) => {
    // Only block default on board swipe, not for simple button taps
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      let newDir = null;
      if (Math.abs(dx) > Math.abs(dy)) {
        newDir = dx > 0 ? DIRECTIONS.ArrowRight : DIRECTIONS.ArrowLeft;
      } else {
        newDir = dy > 0 ? DIRECTIONS.ArrowDown : DIRECTIONS.ArrowUp;
      }
      if (newDir && !isOpposite(direction, newDir)) {
        setDirection(newDir);
        touchStartRef.current = null;
      }
    }
  };

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      let newHead = {
        x: (head.x + direction.x + BOARD_SIZE) % BOARD_SIZE,
        y: (head.y + direction.y + BOARD_SIZE) % BOARD_SIZE,
      };
      // Self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }
      let newSnake;
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        setFood(getNewFoodPosition(prevSnake.concat(newHead)));
        newSnake = [newHead, ...prevSnake];
      } else {
        newSnake = [newHead, ...prevSnake.slice(0, -1)];
      }
      return newSnake;
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const board = document.getElementById("game-board");
    if (!board) return;
    // FIX: passive: false!
    board.addEventListener("touchstart", handleTouchStart, { passive: false });
    board.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      if (!board) return;
      board.removeEventListener("touchstart", handleTouchStart);
      board.removeEventListener("touchmove", handleTouchMove);
    };
  }, [direction]);

  useEffect(() => {
    if (!gameOver) {
      moveInterval.current = setInterval(moveSnake, 150);
      return () => clearInterval(moveInterval.current);
    }
  }, [direction, gameOver]);

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.ArrowRight);
    setFood(getNewFoodPosition(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  };

  // Back button handler
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 sm:p-6 relative">
      {/* Floating styled Back Button */}
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="
          fixed top-4 left-4 z-30
          flex items-center gap-2
          bg-black/60 hover:bg-black/80 active:bg-black/90
          border border-white/10
          shadow-lg
          rounded-full
          px-4 py-2
          text-white text-base font-bold
          transition-all
          backdrop-blur
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
      >
        <svg
          viewBox="0 0 24 24"
          width={24}
          height={24}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">🐍 Snake Game</h1>
      <div className="flex flex-col items-center gap-4">
        {/* Game Board */}
        <div
          id="game-board"
          className="relative bg-gray-900 border border-gray-700 touch-none"
          style={{
            width: "min(400px, 90vw)",
            height: "min(400px, 90vw)",
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            gap: 1,
            borderRadius: 8,
            touchAction: "none",
          }}
        >
          {[...Array(BOARD_SIZE)].map((_, rowIndex) =>
            [...Array(BOARD_SIZE)].map((_, colIndex) => {
              const isSnake = snake.some((segment) => segment.x === colIndex && segment.y === rowIndex);
              const isHead = snake.length && snake[0].x === colIndex && snake[0].y === rowIndex;
              const isFood = food.x === colIndex && food.y === rowIndex;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`rounded ${isHead ? "bg-green-400" : isSnake ? "bg-green-600" : isFood ? "bg-red-600" : "bg-gray-800"}`}
                ></div>
              );
            })
          )}
        </div>
        {/* Mobile Control Buttons */}
        <div className="lg:hidden flex flex-col items-center gap-2 mt-4">
          <button
            onTouchStart={() => handleButtonPress("ArrowUp")}
            onClick={() => handleButtonPress("ArrowUp")}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
            aria-label="Up"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onTouchStart={() => handleButtonPress("ArrowLeft")}
              onClick={() => handleButtonPress("ArrowLeft")}
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
              aria-label="Left"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleButtonPress("ArrowDown")}
              onClick={() => handleButtonPress("ArrowDown")}
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
              aria-label="Down"
            >
              ▼
            </button>
            <button
              onTouchStart={() => handleButtonPress("ArrowRight")}
              onClick={() => handleButtonPress("ArrowRight")}
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all"
              aria-label="Right"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 text-white text-xl">
        Score: <span className="font-mono">{score}</span>
      </div>
      {gameOver && <div className="mt-4 text-red-500 text-2xl font-bold">Game Over!</div>}
      <button onClick={handleRestart} className="mt-4 px-6 py-3 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition">
        Restart
      </button>
      <p className="mt-6 text-gray-400 max-w-sm text-center text-sm sm:text-base">
        Desktop: Use arrow keys. Mobile: Use buttons below or swipe on the board. Eat red food to grow!
      </p>
    </div>
  );
}
