import "../styles/SnakeGame.css";
import React, { useState, useEffect, useRef } from "react";

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export default function SnakeGame() {
  const GRID_SIZE = 20;
  const SPEED = 150;

  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  const directionRef = useRef(direction);
  const touchStartRef = useRef(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  /* ---------- Safe Direction Change ---------- */
  const setSafeDirection = (newDir) => {
    const curr = directionRef.current;
    if (curr.x + newDir.x === 0 && curr.y + newDir.y === 0) return;
    setDirection(newDir);
    setStarted(true);
  };

  const generateFood = (snakeBody) => {
    let newPos = null;

    while (!newPos) {
      const candidate = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

      if (!snakeBody.some((s) => s.x === candidate.x && s.y === candidate.y)) {
        newPos = candidate;
      }
    }

    return newPos;
  };

  const checkCollision = (head, body) => {
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }
    for (let i = 1; i < body.length; i++) {
      if (head.x === body[i].x && head.y === body[i].y) return true;
    }
    return false;
  };

  useEffect(() => {
    if (!started || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        if (checkCollision(newHead, prev)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(interval);
  }, [started, gameOver, food]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;

      if (e.key === "ArrowUp") setSafeDirection(DIRECTIONS.UP);
      if (e.key === "ArrowDown") setSafeDirection(DIRECTIONS.DOWN);
      if (e.key === "ArrowLeft") setSafeDirection(DIRECTIONS.LEFT);
      if (e.key === "ArrowRight") setSafeDirection(DIRECTIONS.RIGHT);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  /* ---------- Swipe Handling ---------- */

  const onTouchStart = (e) => {
    e.preventDefault(); // IMPORTANT
    touchStartRef.current = e.touches[0];
  };

  const onTouchEnd = (e) => {
    e.preventDefault(); // IMPORTANT
    if (!touchStartRef.current) return;

    const start = touchStartRef.current;
    const end = e.changedTouches[0];

    const dx = end.clientX - start.clientX;
    const dy = end.clientY - start.clientY;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Ignore tiny swipes
    if (Math.max(absX, absY) < 15) return;

    if (absX > absY) {
      if (dx > 0) setSafeDirection(DIRECTIONS.RIGHT);
      else setSafeDirection(DIRECTIONS.LEFT);
    } else {
      if (dy > 0) setSafeDirection(DIRECTIONS.DOWN);
      else setSafeDirection(DIRECTIONS.UP);
    }

    touchStartRef.current = null;
  };

  const restart = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setFood({ x: 15, y: 15 });
    setDirection(DIRECTIONS.RIGHT);
    setGameOver(false);
    setScore(0);
    setStarted(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let cls = "cell";
        if (snake[0].x === x && snake[0].y === y) cls += " head";
        else if (snake.some((s) => s.x === x && s.y === y)) cls += " snake";
        else if (food.x === x && food.y === y) cls += " food";

        cells.push(<div key={`${x}-${y}`} className={cls} />);
      }
    }
    return cells;
  };

  return (
    <div className="game-container">
      <h1>NOKIA SNAKE</h1>
      <div className="score">Score: {score}</div>

      <div
        className="board"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {renderGrid()}
      </div>

      {!started && !gameOver && <p>Swipe or use arrows to start</p>}
      {gameOver && <p className="over">Game Over</p>}
      {gameOver && <button onClick={restart}>Restart</button>}
      {
        <div className="touch-controls">
          <button
            className="touch-up"
            onClick={() => setSafeDirection(DIRECTIONS.UP)}
          >
            ↑
          </button>

          <button
            className="touch-left"
            onClick={() => setSafeDirection(DIRECTIONS.LEFT)}
          >
            ←
          </button>

          <button
            className="touch-down"
            onClick={() => setSafeDirection(DIRECTIONS.DOWN)}
          >
            ↓
          </button>

          <button
            className="touch-right"
            onClick={() => setSafeDirection(DIRECTIONS.RIGHT)}
          >
            →
          </button>
        </div>
      }
    </div>
  );
}
