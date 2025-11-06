// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// 게임 상태
let gameState = {
    score: 0,
    lives: 3,
    gameOver: false,
    camera: { x: 0, y: 0 }
};

// 플레이어
const player = {
    x: 100,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    onGround: false,
    color: '#FF0000'
};

// 중력
const gravity = 0.8;
const friction = 0.9;

// 플랫폼 배열
const platforms = [
    { x: 0, y: 360, width: 800, height: 40 },      // 바닥
    { x: 200, y: 300, width: 150, height: 20 },
    { x: 400, y: 250, width: 150, height: 20 },
    { x: 600, y: 200, width: 150, height: 20 },
    { x: 850, y: 300, width: 150, height: 20 },
    { x: 1050, y: 250, width: 150, height: 20 },
    { x: 1250, y: 200, width: 150, height: 20 },
    { x: 1450, y: 150, width: 150, height: 20 },
    { x: 1650, y: 300, width: 150, height: 20 },
    { x: 1800, y: 360, width: 200, height: 40 },   // 끝 플랫폼
];

// 코인 배열
const coins = [
    { x: 250, y: 260, width: 20, height: 20, collected: false },
    { x: 450, y: 210, width: 20, height: 20, collected: false },
    { x: 650, y: 160, width: 20, height: 20, collected: false },
    { x: 900, y: 260, width: 20, height: 20, collected: false },
    { x: 1100, y: 210, width: 20, height: 20, collected: false },
    { x: 1300, y: 160, width: 20, height: 20, collected: false },
    { x: 1500, y: 110, width: 20, height: 20, collected: false },
    { x: 1700, y: 260, width: 20, height: 20, collected: false },
];

// 적 배열
const enemies = [
    { x: 500, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
    { x: 900, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
    { x: 1300, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
    { x: 1600, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
];

// 키 입력 상태
const keys = {};

// 이벤트 리스너
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (player.onGround && !gameState.gameOver) {
            player.velocityY = -player.jumpPower;
            player.onGround = false;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 충돌 감지
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 플랫폼과의 충돌
function handlePlatformCollision() {
    player.onGround = false;
    
    for (let platform of platforms) {
        if (checkCollision(player, platform)) {
            // 플레이어가 플랫폼 위에 떨어지는 경우
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // 플레이어가 플랫폼 아래에서 올라오는 경우
            else if (player.velocityY < 0 && player.y + player.height > platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // 좌우 충돌
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }
}

// 코인 수집
function collectCoins() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            gameState.score += 100;
            updateUI();
        }
    }
}

// 적과의 충돌
function handleEnemyCollision() {
    for (let enemy of enemies) {
        if (checkCollision(player, enemy)) {
            // 플레이어가 적 위에서 떨어지면 적 제거
            if (player.velocityY > 0 && player.y < enemy.y) {
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                player.velocityY = -5; // 튀어오르기
                gameState.score += 200;
                updateUI();
            } else {
                // 적과 충돌 시 생명 감소
                gameState.lives--;
                updateUI();
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    showGameOver();
                } else {
                    // 리스폰
                    player.x = 100;
                    player.y = 300;
                    player.velocityX = 0;
                    player.velocityY = 0;
                }
            }
        }
    }
}

// 적 업데이트
function updateEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.velocityX;
        
        // 적이 바닥에 닿았는지 확인
        let onGround = false;
        for (let platform of platforms) {
            if (enemy.x < platform.x + platform.width &&
                enemy.x + enemy.width > platform.x &&
                enemy.y + enemy.height <= platform.y + 5 &&
                enemy.y + enemy.height >= platform.y - 5) {
                onGround = true;
                break;
            }
        }
        
        // 바닥에 없으면 방향 전환
        if (!onGround || enemy.x < 0 || enemy.x > 2000) {
            enemy.velocityX *= -1;
        }
    }
}

// 카메라 업데이트
function updateCamera() {
    // 플레이어가 화면 중앙에 오도록 카메라 이동
    const targetX = player.x - canvas.width / 2;
    gameState.camera.x = Math.max(0, targetX);
    gameState.camera.x = Math.min(gameState.camera.x, 2000 - canvas.width);
}

// 플레이어 업데이트
function updatePlayer() {
    // 좌우 이동
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }
    
    // 중력 적용
    player.velocityY += gravity;
    
    // 위치 업데이트
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // 바닥과 천장 제한
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // 플랫폼 충돌 처리
    handlePlatformCollision();
    
    // 코인 수집
    collectCoins();
    
    // 적 충돌 처리
    handleEnemyCollision();
    
    // 카메라 업데이트
    updateCamera();
}

// 렌더링
function draw() {
    // 화면 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 카메라 오프셋 적용
    ctx.save();
    ctx.translate(-gameState.camera.x, 0);
    
    // 배경 그리기
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 2000, canvas.height);
    
    // 땅 그리기
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 40, 2000, 40);
    
    // 플랫폼 그리기
    ctx.fillStyle = '#8B4513';
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        // 플랫폼 테두리
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // 코인 그리기
    ctx.fillStyle = '#FFD700';
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    // 적 그리기
    for (let enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // 눈 그리기
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
    }
    
    // 플레이어 그리기 (마리오 스타일)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 플레이어 모자 (빨간색)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x - 2, player.y, player.width + 4, 10);
    
    // 플레이어 얼굴
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(player.x + 5, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 17, player.y + 10, 8, 8);
    
    ctx.restore();
}

// UI 업데이트
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// 게임 오버 표시
function showGameOver() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// 재시작
function restartGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    gameState.camera.x = 0;
    
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // 코인 초기화
    coins.forEach(coin => coin.collected = false);
    
    // 적 초기화
    enemies.length = 0;
    enemies.push(
        { x: 500, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
        { x: 900, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
        { x: 1300, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' },
        { x: 1600, y: 320, width: 30, height: 30, velocityX: -2, color: '#8B4513' }
    );
    
    document.getElementById('gameOver').classList.add('hidden');
    updateUI();
}

// 재시작 버튼 이벤트
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('restartBtn2').addEventListener('click', restartGame);

// 게임 루프
function gameLoop() {
    if (!gameState.gameOver) {
        updatePlayer();
        updateEnemies();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
updateUI();
gameLoop();

