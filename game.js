const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let frameCount = 0;
let gameOver = false;

const retryBtn = document.getElementById("retryBtn");

let car = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2,
  width: 50,
  height: 80,
  speed: 0,
  maxSpeed: 8, // ← tăng max speed
  color: "red"
};

let keys = { ArrowLeft: false, ArrowRight: false };
let obstacles = [];

function generateObstacles() {
  obstacles = [];
  for (let i = 0; i < 10; i++) {
    obstacles.push({
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * -canvas.height,
      width: 50,
      height: 50,
      color: "yellow"
    });
  }
}

function updateCar() {
  if (car.speed < car.maxSpeed) {
    car.speed += 0.002; // tăng chậm dần dần
    if (car.speed < 1) car.speed = 1;
  }

  if (keys.ArrowLeft && car.x > 0) car.x -= 5;
  if (keys.ArrowRight && car.x + car.width < canvas.width) car.x += 5;
}

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawObstacles() {
  for (let obs of obstacles) {
    obs.y += car.speed;

    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (!gameOver && isColliding(car, obs)) {
      car.color = "gray";
      gameOver = true;

      // Cập nhật kỷ lục nếu cần
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }

      retryBtn.style.display = "block";
    }

    if (obs.y > canvas.height) {
      obs.y = Math.random() * -canvas.height;
      obs.x = Math.random() * (canvas.width - obs.width);
      if (!gameOver) {
        score += Math.floor(car.speed); // cộng điểm theo tốc độ
      }
    }
  }
}

function isColliding(a, b) {
  const buffer = 5;
  return !(
    a.x + a.width - buffer < b.x ||
    a.x + buffer > b.x + b.width ||
    a.y + a.height - buffer < b.y ||
    a.y + buffer > b.y + b.height
  );
}

function updateScoreDisplay() {
  document.getElementById("currentScore").textContent = score;
  document.getElementById("highScore").textContent = highScore;
}

function loop() {
  frameCount++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameOver) updateCar();
  drawObstacles();
  drawCar();
  updateScoreDisplay();
  requestAnimationFrame(loop);
}

// Nút chơi lại
retryBtn.onclick = () => {
  score = 0;
  frameCount = 0;
  gameOver = false;
  car = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2,
    width: 50,
    height: 80,
    speed: 0,
    maxSpeed: 8,
    color: "red"
  };
  generateObstacles();
  retryBtn.style.display = "none";
};

// Giao diện điều khiển
document.getElementById("left").ontouchstart = () => keys.ArrowLeft = true;
document.getElementById("left").ontouchend = () => keys.ArrowLeft = false;
document.getElementById("right").ontouchstart = () => keys.ArrowRight = true;
document.getElementById("right").ontouchend = () => keys.ArrowRight = false;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") keys[e.key] = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") keys[e.key] = false;
});

generateObstacles();
loop();
