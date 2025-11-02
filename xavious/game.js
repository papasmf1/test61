// 게임 설정
const config = {
    canvas: null,
    ctx: null,
    width: 1000,
    height: 600,
    scrollSpeed: 2,
    playerSpeed: 5,
    bulletSpeed: 8,
    enemySpeed: 3,
    enemySpawnRate: 0.02,
    backgroundOffset: 0
};

// 게임 상태
const gameState = {
    score: 0,
    lives: 3,
    isRunning: false,
    keys: {}
};

// 오디오 컨텍스트 및 효과
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

// 음향 효과 생성 함수들
function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        // 오디오를 사용할 수 없는 경우 무시
        console.log('Audio not available');
    }
}

// 발사 사운드
function playShootSound() {
    playSound(400, 0.1, 'square', 0.2);
    playSound(600, 0.05, 'square', 0.15);
}

// 폭발 사운드
function playExplosionSound() {
    // 여러 주파수를 섞어서 폭발음 생성
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSound(50 + Math.random() * 100, 0.3, 'sawtooth', 0.3);
        }, i * 30);
    }
}

// 충돌 사운드
function playHitSound() {
    playSound(200, 0.2, 'sawtooth', 0.4);
    playSound(150, 0.2, 'sawtooth', 0.3);
}

// 게임 오버 사운드
function playGameOverSound() {
    playSound(150, 0.5, 'sine', 0.4);
    setTimeout(() => playSound(100, 0.5, 'sine', 0.4), 200);
    setTimeout(() => playSound(80, 0.8, 'sine', 0.4), 400);
}

// 게임 객체들
const player = {
    x: 50,
    y: config.height / 2,
    width: 40,
    height: 30,
    speed: config.playerSpeed
};

const bullets = [];
const enemies = [];
const particles = [];
const stars = [];

// 별 생성 (배경)
function initStars() {
    stars.length = 0;
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1
        });
    }
}

// 별 그리기
function drawStars() {
    config.ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = config.width;
            star.y = Math.random() * config.height;
        }
        config.ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

// 플레이어 그리기 (왼쪽에서 오른쪽을 바라봄)
function drawPlayer() {
    const ctx = config.ctx;
    
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    // 플레이어 비행기 몸체 (오른쪽을 향함)
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.width / 2, 0);  // 앞쪽 (오른쪽)
    ctx.lineTo(-player.width / 4, -player.height / 2);  // 왼쪽 위
    ctx.lineTo(-player.width / 2, 0);  // 뒤쪽 (왼쪽)
    ctx.lineTo(-player.width / 4, player.height / 2);  // 왼쪽 아래
    ctx.closePath();
    ctx.fill();
    
    // 날개 (위쪽)
    ctx.fillStyle = '#00cc00';
    ctx.beginPath();
    ctx.moveTo(-player.width / 6, -player.height / 4);
    ctx.lineTo(-player.width / 3, -player.height / 2);
    ctx.lineTo(0, -player.height / 3);
    ctx.closePath();
    ctx.fill();
    
    // 날개 (아래쪽)
    ctx.beginPath();
    ctx.moveTo(-player.width / 6, player.height / 4);
    ctx.lineTo(-player.width / 3, player.height / 2);
    ctx.lineTo(0, player.height / 3);
    ctx.closePath();
    ctx.fill();
    
    // 엔진 불꽃 효과 (왼쪽 뒤에서)
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(-player.width / 2, -3);
    ctx.lineTo(-player.width / 2 - 8, 0);
    ctx.lineTo(-player.width / 2, 3);
    ctx.closePath();
    ctx.fill();
    
    // 코킷 부분 (오른쪽 앞)
    ctx.fillStyle = '#00dd00';
    ctx.fillRect(player.width / 2 - 3, -2, 3, 4);
    
    ctx.restore();
}

// 플레이어 이동
function updatePlayer() {
    if (gameState.keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (gameState.keys['ArrowDown'] && player.y < config.height - player.height) {
        player.y += player.speed;
    }
    if (gameState.keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (gameState.keys['ArrowRight'] && player.x < config.width - player.width) {
        player.x += player.speed;
    }
    
    // 스페이스바로 발사
    if (gameState.keys[' '] && !gameState.keys['_firing']) {
        shoot();
        gameState.keys['_firing'] = true;
    }
    
    if (!gameState.keys[' ']) {
        gameState.keys['_firing'] = false;
    }
}

// 총알 발사
function shoot() {
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        width: 10,
        height: 4,
        speed: config.bulletSpeed
    });
    playShootSound();
}

// 총알 업데이트 및 그리기
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.speed;
        
        if (bullet.x > config.width) {
            bullets.splice(i, 1);
            continue;
        }
        
        // 총알 그리기
        config.ctx.fillStyle = '#ffff00';
        config.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        config.ctx.fillStyle = '#ff8800';
        config.ctx.fillRect(bullet.x, bullet.y, bullet.width / 2, bullet.height);
    }
}

// 적 생성
function spawnEnemy() {
    if (Math.random() < config.enemySpawnRate) {
        enemies.push({
            x: config.width,
            y: Math.random() * (config.height - 40),
            width: 35,
            height: 25,
            speed: config.enemySpeed + Math.random() * 2,
            type: Math.random() > 0.7 ? 'fast' : 'normal'
        });
    }
}

// 적 업데이트 및 그리기
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x -= enemy.speed;
        
        if (enemy.x + enemy.width < 0) {
            enemies.splice(i, 1);
            continue;
        }
        
        // 적 그리기
        const ctx = config.ctx;
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        
        ctx.fillStyle = enemy.type === 'fast' ? '#ff0000' : '#ff6600';
        ctx.beginPath();
        ctx.moveTo(0, -enemy.height / 2);
        ctx.lineTo(enemy.width / 2, enemy.height / 2);
        ctx.lineTo(0, enemy.height / 4);
        ctx.lineTo(-enemy.width / 2, enemy.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// 충돌 감지
function checkCollisions() {
    // 총알과 적 충돌
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // 폭발 효과
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                playExplosionSound();
                
                // 점수 추가
                gameState.score += enemy.type === 'fast' ? 20 : 10;
                updateScore();
                
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }
    
    // 플레이어와 적 충돌
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            playHitSound();
            
            gameState.lives--;
            updateLives();
            enemies.splice(i, 1);
            
            if (gameState.lives <= 0) {
                gameOver();
            } else {
                // 무적 시간
                player.x = 50;
                player.y = config.height / 2;
            }
            break;
        }
    }
}

// 폭발 효과 생성
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            maxLife: 30,
            size: Math.random() * 3 + 2
        });
    }
}

// 파티클 업데이트 및 그리기
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        const alpha = p.life / p.maxLife;
        config.ctx.fillStyle = `rgba(255, ${Math.floor(255 * alpha)}, 0, ${alpha})`;
        config.ctx.fillRect(p.x, p.y, p.size, p.size);
    }
}

// 점수 업데이트
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

// 생명 업데이트
function updateLives() {
    document.getElementById('lives').textContent = gameState.lives;
}

// 게임 오버
function gameOver() {
    gameState.isRunning = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
    playGameOverSound();
}

// 게임 초기화
function init() {
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');
    config.canvas.width = config.width;
    config.canvas.height = config.height;
    
    initStars();
    updateScore();
    updateLives();
    
    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;
        if (e.key === 'r' || e.key === 'R') {
            restart();
        }
        // 오디오 컨텍스트 활성화
        getAudioContext();
    });
    
    // 클릭으로 오디오 컨텍스트 활성화
    document.addEventListener('click', () => {
        getAudioContext();
    }, { once: true });
    
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
    
    start();
}

// 게임 시작
function start() {
    gameState.isRunning = true;
    gameLoop();
}

// 게임 재시작
function restart() {
    gameState.score = 0;
    gameState.lives = 3;
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    player.x = 50;
    player.y = config.height / 2;
    document.getElementById('gameOver').classList.add('hidden');
    updateScore();
    updateLives();
    start();
}

// 게임 루프
function gameLoop() {
    if (!gameState.isRunning) return;
    
    // 화면 클리어
    config.ctx.fillStyle = '#000011';
    config.ctx.fillRect(0, 0, config.width, config.height);
    
    // 별 그리기
    drawStars();
    
    // 게임 로직 업데이트
    updatePlayer();
    spawnEnemy();
    updateBullets();
    updateEnemies();
    updateParticles();
    checkCollisions();
    
    // 플레이어 그리기
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// 게임 객체 (전역에서 접근 가능하도록)
window.game = {
    restart: restart
};

// 게임 시작
init();
