const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const instructionsEl = document.getElementById('instructions');
const startButton = document.getElementById('startButton');
const messageEl = document.getElementById('message');

const GRAVITY = 0.65;
const GROUND_HEIGHT = 80;
const LEVEL_LENGTH = 5200;
const WORLD_FLOOR = canvas.height - GROUND_HEIGHT;

const state = {
  running: false,
  cameraX: 0,
  lastTime: 0,
  score: 0,
  coins: 0,
  messageTimer: 0,
  respawnPoint: { x: 120, y: WORLD_FLOOR - 48 },
};

const keys = {
  left: false,
  right: false,
  jump: false,
};

const player = {
  x: 120,
  y: WORLD_FLOOR - 48,
  width: 32,
  height: 48,
  vx: 0,
  vy: 0,
  speed: 4,
  jumpForce: 13,
  onGround: false,
  prevX: 0,
  prevY: 0,
};

const flag = {
  x: LEVEL_LENGTH - 160,
  y: WORLD_FLOOR - 160,
  width: 20,
  height: 160,
  wave: 0,
};

const platforms = createPlatforms();
const coins = createCoins();
const enemies = createEnemies();

startButton.addEventListener('click', () => startGame());
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', handleResize);

handleResize();
requestAnimationFrame(loop);

function startGame() {
  if (state.running) {
    return;
  }

  instructionsEl.style.display = 'none';
  resetGame();
  state.running = true;
  state.lastTime = performance.now();
  showMessage('행운을 빌어요!', 1500);
}

function resetGame() {
  player.x = state.respawnPoint.x;
  player.y = state.respawnPoint.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;

  state.cameraX = 0;
  state.score = 0;
  state.coins = 0;

  coins.forEach((coin) => {
    coin.collected = false;
  });

  enemies.forEach((enemy) => {
    enemy.alive = true;
    enemy.x = enemy.startX;
    enemy.direction = 1;
  });
}

function loop(timestamp) {
  const delta = timestamp - state.lastTime;
  state.lastTime = timestamp;

  if (state.running) {
    update(Math.min(delta, 32));
  }

  draw();
  requestAnimationFrame(loop);
}

function update(delta) {
  handlePlayerMovement();
  applyPhysics(delta);
  resolvePlatformCollisions();
  updateEnemies(delta);
  handleItemCollection();
  updateCamera();
  updateScore();
  checkLevelBounds();
  flag.wave += delta * 0.003;

  if (state.messageTimer > 0) {
    state.messageTimer -= delta;
    if (state.messageTimer <= 0) {
      messageEl.style.display = 'none';
    }
  }
}

function handlePlayerMovement() {
  player.vx = 0;

  if (keys.left) {
    player.vx -= player.speed;
  }
  if (keys.right) {
    player.vx += player.speed;
  }
}

function applyPhysics() {
  player.prevX = player.x;
  player.prevY = player.y;

  player.x += player.vx;

  player.vy += GRAVITY;
  player.y += player.vy;
}

function resolvePlatformCollisions() {
  player.onGround = false;

  for (const platform of platforms) {
    if (!isIntersecting(player, platform)) {
      continue;
    }

    const previousBottom = player.prevY + player.height;
    const previousTop = player.prevY;
    const previousRight = player.prevX + player.width;
    const previousLeft = player.prevX;

    if (player.prevY + player.height <= platform.y && player.vy >= 0) {
      // 상단 충돌
      player.y = platform.y - player.height;
      player.vy = 0;
      player.onGround = true;
    } else if (previousTop >= platform.y + platform.height && player.vy < 0) {
      // 하단 충돌
      player.y = platform.y + platform.height;
      player.vy = 0;
    } else if (previousRight <= platform.x && player.vx > 0) {
      // 왼쪽 측면 충돌
      player.x = platform.x - player.width;
    } else if (previousLeft >= platform.x + platform.width && player.vx < 0) {
      // 오른쪽 측면 충돌
      player.x = platform.x + platform.width;
    }
  }
}

function updateEnemies(delta) {
  enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    enemy.x += enemy.direction * enemy.speed;

    if (enemy.x < enemy.minX || enemy.x > enemy.maxX - enemy.width) {
      enemy.direction *= -1;
      enemy.x = Math.max(enemy.minX, Math.min(enemy.x, enemy.maxX - enemy.width));
    }

    if (!isIntersecting(player, enemy)) {
      return;
    }

    const playerAbove = player.prevY + player.height <= enemy.y;
    if (playerAbove && player.vy > 0) {
      enemy.alive = false;
      player.vy = -10;
      state.score += 200;
      showMessage('굿! 적을 물리쳤어요!', 1000);
    } else {
      handleDamage();
    }
  });
}

function handleDamage() {
  showMessage('아이구! 다시 도전해봐요!', 1400);
  player.x = state.respawnPoint.x;
  player.y = state.respawnPoint.y;
  player.vx = 0;
  player.vy = 0;
  state.cameraX = Math.max(0, player.x - canvas.width * 0.35);
}

function handleItemCollection() {
  coins.forEach((coin) => {
    if (coin.collected) {
      return;
    }

    if (isIntersecting(player, coin)) {
      coin.collected = true;
      state.coins += 1;
      state.score += 100;
      showMessage('코인 겟!', 800);
    }
  });

  if (
    player.x + player.width >= flag.x &&
    player.x <= flag.x + flag.width &&
    player.y + player.height >= flag.y &&
    player.y <= flag.y + flag.height
  ) {
    finishLevel();
  }
}

function finishLevel() {
  state.running = false;
  showMessage('축하합니다! 깃발에 도달했어요! 🎉', 4000);
}

function updateCamera() {
  const target = player.x - canvas.width * 0.35;
  state.cameraX += (target - state.cameraX) * 0.12;
  state.cameraX = clamp(state.cameraX, 0, LEVEL_LENGTH - canvas.width + 200);
}

function updateScore() {
  state.score = Math.max(state.score, Math.floor(player.x * 0.5) + state.coins * 200);
  scoreEl.textContent = state.score.toString();
  coinsEl.textContent = state.coins.toString();
}

function checkLevelBounds() {
  if (player.y > canvas.height + 300) {
    handleDamage();
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x > LEVEL_LENGTH - player.width) {
    player.x = LEVEL_LENGTH - player.width;
  }
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  ctx.translate(-state.cameraX, 0);

  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawFlag();
  drawPlayer();

  ctx.restore();
}

function drawBackground() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#8bd5ff');
  skyGradient.addColorStop(1, '#5cabff');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const parallaxOffset = state.cameraX * 0.3;

  ctx.fillStyle = '#ffffff99';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 280 - parallaxOffset * 0.4) % (canvas.width + 300)) - 150;
    ctx.beginPath();
    ctx.ellipse(x, 120 + (i % 2) * 30, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#5fb25e';
  for (let i = 0; i < 5; i++) {
    const baseX = ((i * 620 - parallaxOffset) % (canvas.width + 640)) - 200;
    ctx.beginPath();
    ctx.moveTo(baseX, canvas.height);
    ctx.lineTo(baseX + 120, canvas.height - 180);
    ctx.lineTo(baseX + 240, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#784315';
  ctx.fillRect(0, WORLD_FLOOR, canvas.width, GROUND_HEIGHT);
  ctx.fillStyle = '#2f8f3c';
  ctx.fillRect(0, WORLD_FLOOR, canvas.width, 20);
}

function drawPlatforms() {
  platforms.forEach((platform) => {
    ctx.fillStyle = platform.type === 'ground' ? '#784315' : '#c96b28';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    if (platform.type !== 'ground') {
      ctx.fillStyle = '#f7b25b';
      ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height / 3);
    }
  });
}

function drawCoins() {
  coins.forEach((coin) => {
    if (coin.collected) {
      return;
    }
    const sparkle = Math.sin(state.lastTime * 0.01 + coin.x) * 4;
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.ellipse(coin.x + coin.width / 2, coin.y + coin.height / 2 + sparkle * 0.1, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f4a700';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    ctx.fillStyle = '#ce442d';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
    ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 8, 8, 8);
  });
}

function drawFlag() {
  ctx.fillStyle = '#f1f2f4';
  ctx.fillRect(flag.x, flag.y, 8, flag.height);

  const flagWave = Math.sin(flag.wave) * 8;
  ctx.fillStyle = '#ff3d30';
  ctx.beginPath();
  ctx.moveTo(flag.x + 8, flag.y + 20);
  ctx.lineTo(flag.x + 8 + 50 + flagWave, flag.y + 40);
  ctx.lineTo(flag.x + 8, flag.y + 60);
  ctx.closePath();
  ctx.fill();
}

function drawPlayer() {
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#ff3d30';
  ctx.fillRect(player.x, player.y, player.width, player.height / 3);

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(player.x + 6, player.y + 10, 8, 8);
  ctx.fillRect(player.x + player.width - 14, player.y + 10, 8, 8);
}

function handleKeyDown(event) {
  if (event.repeat) {
    return;
  }

  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = true;
      break;
    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      if (!state.running) {
        startGame();
      }
      performJump();
      break;
    case 'Enter':
      if (!state.running) {
        startGame();
      }
      break;
    default:
      break;
  }
}

function handleKeyUp(event) {
  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = false;
      break;
    default:
      break;
  }
}

function performJump() {
  if (player.onGround) {
    player.vy = -player.jumpForce;
    player.onGround = false;
  }
}

function handleResize() {
  const maxWidth = Math.min(window.innerWidth - 32, 960);
  const aspect = canvas.height / canvas.width;
  canvas.style.width = `${maxWidth}px`;
  canvas.style.height = `${maxWidth * aspect}px`;
}

function showMessage(text, duration = 1500) {
  messageEl.textContent = text;
  messageEl.style.display = 'block';
  state.messageTimer = duration;
}

function isIntersecting(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createPlatforms() {
  const list = [
    { x: -400, y: WORLD_FLOOR, width: LEVEL_LENGTH + 800, height: GROUND_HEIGHT, type: 'ground' },
    { x: 420, y: WORLD_FLOOR - 140, width: 160, height: 24, type: 'platform' },
    { x: 780, y: WORLD_FLOOR - 200, width: 120, height: 24, type: 'platform' },
    { x: 1040, y: WORLD_FLOOR - 120, width: 180, height: 24, type: 'platform' },
    { x: 1480, y: WORLD_FLOOR - 160, width: 140, height: 24, type: 'platform' },
    { x: 1880, y: WORLD_FLOOR - 220, width: 120, height: 24, type: 'platform' },
    { x: 2200, y: WORLD_FLOOR - 260, width: 140, height: 24, type: 'platform' },
    { x: 2560, y: WORLD_FLOOR - 140, width: 280, height: 24, type: 'platform' },
    { x: 3040, y: WORLD_FLOOR - 220, width: 200, height: 24, type: 'platform' },
    { x: 3400, y: WORLD_FLOOR - 180, width: 120, height: 24, type: 'platform' },
    { x: 3720, y: WORLD_FLOOR - 240, width: 160, height: 24, type: 'platform' },
    { x: 4060, y: WORLD_FLOOR - 160, width: 180, height: 24, type: 'platform' },
    { x: 4440, y: WORLD_FLOOR - 200, width: 160, height: 24, type: 'platform' },
  ];

  return list;
}

function createCoins() {
  const coinLayout = [];

  const coinRows = [
    { start: 360, end: 520, step: 40, height: WORLD_FLOOR - 180 },
    { start: 760, end: 880, step: 40, height: WORLD_FLOOR - 240 },
    { start: 1180, end: 1360, step: 40, height: WORLD_FLOOR - 180 },
    { start: 2040, end: 2320, step: 40, height: WORLD_FLOOR - 300 },
    { start: 2680, end: 2880, step: 40, height: WORLD_FLOOR - 190 },
    { start: 3120, end: 3320, step: 40, height: WORLD_FLOOR - 260 },
    { start: 3580, end: 3800, step: 40, height: WORLD_FLOOR - 300 },
    { start: 4200, end: 4400, step: 40, height: WORLD_FLOOR - 220 },
  ];

  coinRows.forEach((row) => {
    for (let x = row.start; x <= row.end; x += row.step) {
      coinLayout.push({ x, y: row.height, width: 24, height: 24, collected: false });
    }
  });

  return coinLayout;
}

function createEnemies() {
  return [
    { x: 680, y: WORLD_FLOOR - 36, width: 36, height: 36, minX: 640, maxX: 820, speed: 1.2, direction: 1, alive: true, startX: 680 },
    { x: 1620, y: WORLD_FLOOR - 36, width: 36, height: 36, minX: 1580, maxX: 1760, speed: 1.4, direction: -1, alive: true, startX: 1620 },
    { x: 2480, y: WORLD_FLOOR - 36, width: 36, height: 36, minX: 2440, maxX: 2640, speed: 1.3, direction: 1, alive: true, startX: 2480 },
    { x: 3320, y: WORLD_FLOOR - 36, width: 36, height: 36, minX: 3280, maxX: 3480, speed: 1.5, direction: 1, alive: true, startX: 3320 },
    { x: 4120, y: WORLD_FLOOR - 36, width: 36, height: 36, minX: 4080, maxX: 4280, speed: 1.35, direction: -1, alive: true, startX: 4120 },
  ];
}

