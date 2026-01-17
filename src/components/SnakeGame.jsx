import "../styles/SnakeGame.css";
import React, { useState, useEffect, useRef } from "react";

export default function SnakeGame() {
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const SPEED = 150;

  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  };

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

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = (snakeBody) => {
    let pos;
    while (true) {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snakeBody.some((s) => s.x === pos.x && s.y === pos.y)) break;
    }
    return pos;
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

      if (e.key === "ArrowUp" && directionRef.current.y !== 1) {
        setDirection(DIRECTIONS.UP);
        setStarted(true);
      }
      if (e.key === "ArrowDown" && directionRef.current.y !== -1) {
        setDirection(DIRECTIONS.DOWN);
        setStarted(true);
      }
      if (e.key === "ArrowLeft" && directionRef.current.x !== 1) {
        setDirection(DIRECTIONS.LEFT);
        setStarted(true);
      }
      if (e.key === "ArrowRight" && directionRef.current.x !== -1) {
        setDirection(DIRECTIONS.RIGHT);
        setStarted(true);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

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

        cells.push(
          <div
            key={`${x}-${y}`}
            className={cls}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          />,
        );
      }
    }
    return cells;
  };

  return (
    <div className="game-container">
      <h1>NOKIA SNAKE</h1>
      <div className="score">Score: {score}</div>
      <div className="board">{renderGrid()}</div>

      {!started && !gameOver && <p>Press Arrow Keys to Start</p>}
      {gameOver && <p className="over">Game Over</p>}
      {gameOver && <button onClick={restart}>Restart</button>}
    </div>
  );
}
