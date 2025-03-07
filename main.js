// Configuração do canvas
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

// Variáveis do jogo
let score = 0;
let lives = 3;
let level = 1;
let powerPelletActive = false;
let powerPelletTimer = 0;
let powerMeter = 0;
let freezePowerAvailable = false;
let speedPowerAvailable = false;
let ghostPowerAvailable = false;
let freezePowerActive = false;
let speedPowerActive = false;
let ghostPowerActive = false;
let freezeTimer = 0;
let speedTimer = 0;
let ghostTimer = 0;

// Tamanho da célula e labirinto
const cellSize = 30;
const rows = 20;
const cols = 20;

// Direções
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

// Cores
const COLORS = {
  wall: "#0062ff",
  dot: "#ffffff",
  powerPellet: "#ffcc00",
  pacman: "#ffff00",
  blinky: "#ff0000", // Vermelho
  pinky: "#ffb8de", // Rosa
  inky: "#00ffff", // Ciano
  clyde: "#ffb852", // Laranja
  frightenedGhost: "#2121ff", // Azul
  frightenedGhostEnding: "#ffffff", // Branco piscando
};

// Estado do jogo
let gameRunning = true;

// Labirinto (0 = parede, 1 = ponto, 2 = vazio, 3 = power pellet)
let maze = [];

// Pacman
let pacman = {
  x: 10,
  y: 15,
  size: cellSize - 4,
  speed: 5,
  baseSpeed: 5,
  direction: RIGHT,
  nextDirection: RIGHT,
  mouthOpen: 0,
  mouthDir: 0.1,
};

// Fantasmas
let ghosts = [];

// Configuração do jogo
function setupGame() {
  // Resetar contadores
  score = 0;
  updateScore();
  lives = 3;
  updateLives();
  level = 1;
  updateLevel();
  powerMeter = 0;
  updatePowerMeter();

  // Resetar poderes
  freezePowerAvailable = false;
  speedPowerAvailable = false;
  ghostPowerAvailable = false;
  updatePowerupButtons();

  // Criar labirinto
  createMaze();

  // Posicionar Pacman
  pacman.x = 10;
  pacman.y = 15;
  pacman.direction = RIGHT;
  pacman.nextDirection = RIGHT;

  // Criar fantasmas
  createGhosts();

  // Iniciar jogo
  gameRunning = true;
  hideGameOver();
  hideLevelComplete();

  // Game loop
  requestAnimationFrame(gameLoop);
}

// Criar labirinto
function createMaze() {
  // Definição do labirinto (0 = parede, 1 = ponto, 2 = vazio, 3 = power pellet)
  maze = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 3, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 3, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 3, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Adaptar labirinto conforme o nível
  if (level > 1) {
    // Adicionar mais paredes e desafios em níveis mais altos
    for (let i = 0; i < level * 3; i++) {
      let x = Math.floor(Math.random() * cols);
      let y = Math.floor(Math.random() * rows);

      // Evitar bloquear o pacman ou criar áreas isoladas
      if (
        maze[y][x] === 1 &&
        !(x === pacman.x && y === pacman.y) &&
        !(x >= 9 && x <= 10 && y >= 9 && y <= 12)
      ) {
        // Evitar o centro onde ficam os fantasmas
        maze[y][x] = 0; // Adicionar parede
      }
    }

    // Adicionar mais power pellets em níveis mais altos
    if (level >= 3) {
      for (let i = 0; i < Math.min(level - 2, 4); i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * cols);
          y = Math.floor(Math.random() * rows);
        } while (maze[y][x] !== 1);

        maze[y][x] = 3; // Power pellet
      }
    }
  }
}

// Criar fantasmas
function createGhosts() {
  ghosts = [
    {
      x: 9,
      y: 9,
      size: cellSize - 4,
      speed: 4 + level * 0.2,
      color: COLORS.blinky,
      direction: UP,
      frightened: false,
      respawning: false,
      respawnTimer: 0,
      name: "blinky",
      originalColor: COLORS.blinky,
    },
    {
      x: 10,
      y: 9,
      size: cellSize - 4,
      speed: 3.8 + level * 0.2,
      color: COLORS.pinky,
      direction: UP,
      frightened: false,
      respawning: false,
      respawnTimer: 0,
      name: "pinky",
      originalColor: COLORS.pinky,
    },
    {
      x: 9,
      y: 10,
      size: cellSize - 4,
      speed: 3.6 + level * 0.2,
      color: COLORS.inky,
      direction: LEFT,
      frightened: false,
      respawning: false,
      respawnTimer: 0,
      name: "inky",
      originalColor: COLORS.inky,
    },
    {
      x: 10,
      y: 10,
      size: cellSize - 4,
      speed: 3.4 + level * 0.2,
      color: COLORS.clyde,
      direction: LEFT,
      frightened: false,
      respawning: false,
      respawnTimer: 0,
      name: "clyde",
      originalColor: COLORS.clyde,
    },
  ];

  // Adicionar mais fantasmas em níveis mais altos
  if (level >= 3) {
    for (let i = 0; i < Math.min(level - 2, 3); i++) {
      const ghostColors = ["#00ff00", "#ff00ff", "#800080"];
      ghosts.push({
        x: 9 + (i % 2),
        y: 11,
        size: cellSize - 4,
        speed: 4.5 + level * 0.3,
        color: ghostColors[i],
        direction: DOWN,
        frightened: false,
        respawning: false,
        respawnTimer: 0,
        name: "extra" + (i + 1),
        originalColor: ghostColors[i],
      });
    }
  }
}

// Game loop
function gameLoop(timestamp) {
  if (!gameRunning) return;

  // Limpar canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Verificar vitória
  checkWinCondition();

  // Atualizar estado
  updatePacman();
  updateGhosts();

  // Verificar colisões
  //   checkCollisions();

  // Atualizar timers para poderes
  updatePowerTimers();

  // Desenhar elementos
  drawMaze();
  drawPacman();
  drawGhosts();

  // Continuar loop
  requestAnimationFrame(gameLoop);
}

// Atualizar Pacman
function updatePacman() {
  // Verificar se a próxima direção é válida
  if (canMove(pacman.x, pacman.y, pacman.nextDirection)) {
    pacman.direction = pacman.nextDirection;
  }

  // Aplicar velocidade aumentada se ativo
  let currentSpeed = pacman.speed;
  if (speedPowerActive) {
    currentSpeed = pacman.speed * 1.5;
  }

  // Mover Pacman
  if (canMove(pacman.x, pacman.y, pacman.direction)) {
    console.log("MOVER PAC MAN", pacman.direction);
    pacman.x += (pacman.direction.x * currentSpeed) / cellSize;
    pacman.y += (pacman.direction.y * currentSpeed) / cellSize;

    if (pacman.direction === UP) {
      pacman.y = parseInt(pacman.y);
    }

    // Normalizar posição para evitar problemas de colisão
    if (
      Math.abs(pacman.x - Math.round(pacman.x)) < 0.1 &&
      Math.abs(pacman.y - Math.round(pacman.y)) < 0.1
    ) {
      pacman.x = Math.round(pacman.x);
      pacman.y = Math.round(pacman.y);
    }
  }

  // Túneis (esquerda-direita)
  if (pacman.x < 0) pacman.x = cols - 1;
  if (pacman.x >= cols) pacman.x = 0;

  // Animação da boca
  pacman.mouthOpen += pacman.mouthDir;
  if (pacman.mouthOpen > 0.5 || pacman.mouthOpen < 0) {
    pacman.mouthDir *= -1;
  }

  // Coletar pontos
  const cellX = Math.floor(pacman.x);
  const cellY = Math.floor(pacman.y);

  if (cellX >= 0 && cellY >= 0 && cellX < cols && cellY < rows) {
    if (maze[cellY][cellX] === 1) {
      // Ponto normal
      maze[cellY][cellX] = 2; // Marcar como vazio
      score += 10;
      powerMeter += 2;
      updateScore();
      updatePowerMeter();
      checkPowerupAvailability();
    } else if (maze[cellY][cellX] === 3) {
      // Power pellet
      maze[cellY][cellX] = 2; // Marcar como vazio
      score += 50;
      powerMeter += 10;
      updateScore();
      updatePowerMeter();
      activatePowerPellet();
      checkPowerupAvailability();
    }
  }
}

// Ativar Power Pellet
function activatePowerPellet() {
  powerPelletActive = true;
  powerPelletTimer = 8000 - level * 1000; // Reduz o tempo em níveis mais altos
  if (powerPelletTimer < 3000) powerPelletTimer = 3000; // Mínimo de 3 segundos

  // Ativar modo assustado dos fantasmas
  for (let ghost of ghosts) {
    if (!ghost.respawning) {
      ghost.frightened = true;
      ghost.direction = {
        x: -ghost.direction.x,
        y: -ghost.direction.y,
      };
    }
  }

  // Definir temporizador para desativar
  setTimeout(() => {
    // Aviso de "piscando"
    for (let ghost of ghosts) {
      if (ghost.frightened) {
        ghost.color = COLORS.frightenedGhostEnding;
      }
    }

    // Desativar após 3 segundos
    setTimeout(() => {
      powerPelletActive = false;
      for (let ghost of ghosts) {
        if (ghost.frightened) {
          ghost.frightened = false;
          ghost.color = ghost.originalColor;
        }
      }
    }, 3000);
  }, powerPelletTimer - 3000);
}

// Modificação na função canMove para corrigir o problema de movimento para a esquerda
function canMove(x, y, direction) {
  // Para movimento para a esquerda, precisamos considerar a posição atual do Pacman
  let checkX = x;
  let checkY = y;

  // Se estiver movendo para a esquerda e estiver perto da borda de uma célula
  if (direction === LEFT && x - Math.floor(x) < 0.1) {
    checkX = Math.floor(x);
  }

  // Se estiver movendo para a esquerda e estiver perto da borda de uma célula
  checkY = Math.floor(y);

  const newX =
    direction === LEFT
      ? checkX + direction.x
      : Math.floor(checkX + direction.x);

  const newY = checkY + direction.y;

  // Se estiver no modo fantasma, pode atravessar paredes
  if (ghostPowerActive) {
    return true;
  }

  // Verificar se é um túnel
  if (newX < 0 || newX >= cols) return true;

  // Verificar se há parede
  return (
    newX >= 0 &&
    newY >= 0 &&
    newX < cols &&
    newY < rows &&
    maze[newY][newX] !== 0
  );
}

// Verificar se pode mover para determinada direção
function canMoveGhost(x, y, direction) {
  const newX = Math.floor(x + direction.x);
  const newY = Math.floor(y + direction.y);

  // Se estiver no modo fantasma, pode atravessar paredes
  if (ghostPowerActive) {
    return true;
  }

  // Verificar se é um túnel
  if (newX < 0 || newX >= cols) return true;

  // Verificar se há parede
  return (
    newX >= 0 &&
    newY >= 0 &&
    newX < cols &&
    newY < rows &&
    maze[newY][newX] !== 0
  );
}

// Atualizar fantasmas
function updateGhosts() {
  for (let ghost of ghosts) {
    if (ghost.respawning) {
      ghost.respawnTimer -= 16; // 16ms por frame aproximadamente
      if (ghost.respawnTimer <= 0) {
        ghost.respawning = false;
        ghost.frightened = false;
        ghost.color = ghost.originalColor;
        ghost.x = 9 + (Math.random() > 0.5 ? 1 : 0);
        ghost.y = 9 + (Math.random() > 0.5 ? 1 : 0);
      }
      continue;
    }

    // Pular atualização se o poder de congelamento estiver ativo
    if (freezePowerActive) continue;

    // Decidir direção
    if (Math.floor(ghost.x) === ghost.x && Math.floor(ghost.y) === ghost.y) {
      let possibleDirections = [];

      // Evitar inverter a direção a menos que seja necessário
      const oppositeDirection = {
        x: -ghost.direction.x,
        y: -ghost.direction.y,
      };

      // Verificar todas as direções possíveis
      for (const dir of [UP, DOWN, LEFT, RIGHT]) {
        // Evitar a direção oposta, a menos que esteja assustado
        if (
          !ghost.frightened &&
          dir.x === oppositeDirection.x &&
          dir.y === oppositeDirection.y
        ) {
          continue;
        }

        if (canMoveGhost(ghost.x, ghost.y, dir)) {
          possibleDirections.push(dir);
        }
      }

      // Se não houver direções possíveis, tentar a direção oposta
      if (
        possibleDirections.length === 0 &&
        canMoveGhost(ghost.x, ghost.y, oppositeDirection)
      ) {
        possibleDirections.push(oppositeDirection);
      }

      if (possibleDirections.length > 0) {
        if (ghost.frightened) {
          // Movimento aleatório quando assustado
          ghost.direction =
            possibleDirections[
              Math.floor(Math.random() * possibleDirections.length)
            ];
        } else {
          // Movimento inteligente: tendência a seguir o Pacman
          possibleDirections.sort((a, b) => {
            const distanceA = getDistance(
              ghost.x + a.x,
              ghost.y + a.y,
              pacman.x,
              pacman.y
            );
            const distanceB = getDistance(
              ghost.x + b.x,
              ghost.y + b.y,
              pacman.x,
              pacman.y
            );

            // Quanto mais baixo o nível, mais aleatório o movimento
            const randomFactor = (5 - Math.min(level, 4)) * 3;

            return (
              distanceA +
              Math.random() * randomFactor -
              (distanceB + Math.random() * randomFactor)
            );
          });

          ghost.direction = possibleDirections[0];
        }
      }
    }

    // Velocidade do fantasma (reduzida quando assustado)
    let ghostSpeed = ghost.frightened ? ghost.speed * 0.6 : ghost.speed;
    ghostSpeed = ghostSpeed / cellSize;

    // Mover fantasma
    ghost.x += ghost.direction.x * ghostSpeed;
    ghost.y += ghost.direction.y * ghostSpeed;

    // Túneis (esquerda-direita)
    if (ghost.x < 0) ghost.x = cols - 1;
    if (ghost.x >= cols) ghost.x = 0;

    // Normalizar posição
    if (
      Math.abs(ghost.x - Math.round(ghost.x)) < 0.1 &&
      Math.abs(ghost.y - Math.round(ghost.y)) < 0.1
    ) {
      ghost.x = Math.round(ghost.x);
      ghost.y = Math.round(ghost.y);
    }
  }
}

// Calcular distância entre dois pontos
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Verificar colisões entre Pacman e fantasmas
function checkCollisions() {
  for (let ghost of ghosts) {
    const distance = getDistance(pacman.x, pacman.y, ghost.x, ghost.y);

    if (distance < 0.7 && !ghost.respawning) {
      if (ghost.frightened) {
        // Comer o fantasma
        score += 200 * level;
        updateScore();
        powerMeter += 15;
        updatePowerMeter();
        checkPowerupAvailability();

        // Marcar fantasma como respawnando
        ghost.respawning = true;
        ghost.respawnTimer = 5000 - level * 500; // Menos tempo para respawn em níveis mais altos
        if (ghost.respawnTimer < 1500) ghost.respawnTimer = 1500; // Mínimo 1.5 segundos

        // Tornar fantasma invisível
        ghost.color = "rgba(0, 0, 0, 0)";
      } else if (!ghostPowerActive) {
        // Perder uma vida
        lives--;
        updateLives();

        if (lives <= 0) {
          gameOver();
        } else {
          resetPositions();
        }
        break;
      }
    }
  }
}

// Reiniciar posições após perder uma vida
function resetPositions() {
  // Posicionar Pacman
  pacman.x = 10;
  pacman.y = 15;
  pacman.direction = RIGHT;
  pacman.nextDirection = RIGHT;

  // Posicionar fantasmas
  ghosts.forEach((ghost, index) => {
    ghost.x = 9 + (index % 2);
    ghost.y = 9 + Math.floor(index / 2);
    ghost.frightened = false;
    ghost.respawning = false;
    ghost.color = ghost.originalColor;
  });

  // Desativar power pellet
  powerPelletActive = false;

  // Desativar poderes especiais
  freezePowerActive = false;
  speedPowerActive = false;
  ghostPowerActive = false;

  // Pausar brevemente
  gameRunning = false;
  setTimeout(() => {
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  }, 1000);
}

// Verificar condição de vitória
function checkWinCondition() {
  // Verificar se todos os pontos foram coletados
  let dotsRemaining = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1 || maze[y][x] === 3) {
        dotsRemaining++;
      }
    }
  }

  if (dotsRemaining === 0) {
    levelComplete();
  }
}

// Fim de jogo
function gameOver() {
  gameRunning = false;
  showGameOver();
}

// Mostrar tela de Game Over
function showGameOver() {
  document.getElementById("game-over").style.display = "flex";
}

// Esconder tela de Game Over
function hideGameOver() {
  document.getElementById("game-over").style.display = "none";
}

// Mostrar tela de nível completo
function showLevelComplete() {
  document.getElementById("level-complete").style.display = "flex";
}

// Esconder tela de nível completo
function hideLevelComplete() {
  document.getElementById("level-complete").style.display = "none";
}

// Completar nível
function levelComplete() {
  gameRunning = false;
  level++;
  updateLevel();

  // Bônus por completar nível
  score += level * 1000;
  updateScore();

  showLevelComplete();

  // Preparar próximo nível
  setTimeout(() => {
    hideLevelComplete();
    setupGame();
  }, 3000);
}

// Desenhar labirinto
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = maze[y][x];

      if (cell === 0) {
        // Parede
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Adicionar estilo arredondado às paredes
        const hasTopWall = y === 0 || maze[y - 1][x] !== 0;
        const hasBottomWall = y === rows - 1 || maze[y + 1][x] !== 0;
        const hasLeftWall = x === 0 || maze[y][x - 1] !== 0;
        const hasRightWall = x === cols - 1 || maze[y][x + 1] !== 0;

        // Desenhar cantos arredondados
        ctx.fillStyle = "black";
        if (!hasTopWall && !hasLeftWall) {
          ctx.beginPath();
          ctx.arc(x * cellSize, y * cellSize, 5, 0, Math.PI / 2);
          ctx.fill();
        }
        if (!hasTopWall && !hasRightWall) {
          ctx.beginPath();
          ctx.arc((x + 1) * cellSize, y * cellSize, 5, Math.PI / 2, Math.PI);
          ctx.fill();
        }
        if (!hasBottomWall && !hasLeftWall) {
          ctx.beginPath();
          ctx.arc(
            x * cellSize,
            (y + 1) * cellSize,
            5,
            (3 * Math.PI) / 2,
            2 * Math.PI
          );
          ctx.fill();
        }
        if (!hasBottomWall && !hasRightWall) {
          ctx.beginPath();
          ctx.arc(
            (x + 1) * cellSize,
            (y + 1) * cellSize,
            5,
            Math.PI,
            (3 * Math.PI) / 2
          );
          ctx.fill();
        }
      } else if (cell === 1) {
        // Ponto
        ctx.fillStyle = COLORS.dot;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (cell === 3) {
        // Power Pellet
        ctx.fillStyle = COLORS.powerPellet;
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Adicionar efeito pulsante
        const pulseSize = 2 * Math.sin(Date.now() / 200);
        ctx.beginPath();
        ctx.arc(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          6 + pulseSize,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = COLORS.powerPellet;
        ctx.stroke();
      }
    }
  }
}

// Desenhar Pacman
function drawPacman() {
  const x = pacman.x * cellSize + cellSize / 2;
  const y = pacman.y * cellSize + cellSize / 2;
  const size = pacman.size / 2;

  // Boca (ângulo baseado na direção)
  let mouthAngle = 0;
  if (pacman.direction === RIGHT) mouthAngle = 0;
  else if (pacman.direction === DOWN) mouthAngle = Math.PI / 2;
  else if (pacman.direction === LEFT) mouthAngle = Math.PI;
  else if (pacman.direction === UP) mouthAngle = (3 * Math.PI) / 2;

  // Desenhar Pacman
  ctx.fillStyle = COLORS.pacman;
  ctx.beginPath();
  ctx.arc(
    x,
    y,
    size,
    mouthAngle + pacman.mouthOpen * Math.PI,
    mouthAngle + (2 - pacman.mouthOpen) * Math.PI
  );
  ctx.lineTo(x, y);
  ctx.fill();

  // Olho
  const eyeX = x + (Math.cos(mouthAngle - Math.PI / 6) * size) / 2;
  const eyeY = y + (Math.sin(mouthAngle - Math.PI / 6) * size) / 2;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Desenhar fantasmas
function drawGhosts() {
  for (let ghost of ghosts) {
    if (ghost.respawning) continue; // Não desenhar fantasmas respawnando

    const x = ghost.x * cellSize + cellSize / 2;
    const y = ghost.y * cellSize + cellSize / 2;
    const size = ghost.size / 2;

    // Corpo
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(x, y - 2, size, Math.PI, 0, false);
    ctx.lineTo(x + size, y + size);

    // Ondulações na parte inferior
    const waveSize = size / 3;
    for (let i = 0; i < 3; i++) {
      const waveX = x + size - i * waveSize * 2;
      ctx.lineTo(waveX, y + size - waveSize);
      ctx.lineTo(waveX - waveSize, y + size);
    }

    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x - size, y);
    ctx.fill();

    // Olhos
    const eyeSize = size / 3;
    ctx.fillStyle = "white";

    // Olho esquerdo
    ctx.beginPath();
    ctx.arc(x - eyeSize, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Olho direito
    ctx.beginPath();
    ctx.arc(x + eyeSize, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas (olhando na direção do movimento)
    ctx.fillStyle = "black";

    // Direção do olhar baseada no estado
    let lookX = ghost.direction.x;
    let lookY = ghost.direction.y;

    if (ghost.frightened) {
      // Olhos assustados
      lookX = 0;
      lookY = 0;
    }

    // Pupila esquerda
    ctx.beginPath();
    ctx.arc(
      x - eyeSize + (lookX * eyeSize) / 2,
      y - eyeSize + (lookY * eyeSize) / 2,
      eyeSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pupila direita
    ctx.beginPath();
    ctx.arc(
      x + eyeSize + (lookX * eyeSize) / 2,
      y - eyeSize + (lookY * eyeSize) / 2,
      eyeSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Se assustado, adicionar expressão
    if (ghost.frightened) {
      // Boca de assustado
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y + size / 4);
      for (let i = 0; i < 3; i++) {
        ctx.lineTo(
          x - size / 2 + ((i + 1) * size) / 3,
          y + size / 4 + ((i % 2) * size) / 4
        );
      }
      ctx.stroke();
    }
  }
}

// Atualizar timers para poderes especiais
function updatePowerTimers() {
  if (freezePowerActive) {
    freezeTimer -= 16; // ~16ms por frame
    if (freezeTimer <= 0) {
      freezePowerActive = false;
      document.getElementById("freeze-powerup").classList.remove("active");
    }
  }

  if (speedPowerActive) {
    speedTimer -= 16; // ~16ms por frame
    if (speedTimer <= 0) {
      speedPowerActive = false;
      document.getElementById("speed-powerup").classList.remove("active");
    }
  }

  if (ghostPowerActive) {
    ghostTimer -= 16; // ~16ms por frame
    if (ghostTimer <= 0) {
      ghostPowerActive = false;
      document.getElementById("ghost-powerup").classList.remove("active");
    }
  }
}

// Verificar disponibilidade de poderes
function checkPowerupAvailability() {
  if (powerMeter >= 50 && !freezePowerAvailable && !freezePowerActive) {
    freezePowerAvailable = true;
    document.getElementById("freeze-powerup").classList.add("available");
  }

  if (powerMeter >= 75 && !speedPowerAvailable && !speedPowerActive) {
    speedPowerAvailable = true;
    document.getElementById("speed-powerup").classList.add("available");
  }

  if (powerMeter >= 100 && !ghostPowerAvailable && !ghostPowerActive) {
    ghostPowerAvailable = true;
    document.getElementById("ghost-powerup").classList.add("available");
  }

  updatePowerupButtons();
}

// Atualizar botões de poderes
function updatePowerupButtons() {
  const freezeButton = document.getElementById("freeze-powerup");
  const speedButton = document.getElementById("speed-powerup");
  const ghostButton = document.getElementById("ghost-powerup");

  freezeButton.disabled = !(freezePowerAvailable && !freezePowerActive);
  speedButton.disabled = !(speedPowerAvailable && !speedPowerActive);
  ghostButton.disabled = !(ghostPowerAvailable && !ghostPowerActive);
}

// Ativar poder de congelamento
function activateFreezePower() {
  if (freezePowerAvailable && !freezePowerActive) {
    freezePowerActive = true;
    freezePowerAvailable = false;
    freezeTimer = 5000; // 5 segundos
    powerMeter -= 50;
    updatePowerMeter();

    document.getElementById("freeze-powerup").classList.remove("available");
    document.getElementById("freeze-powerup").classList.add("active");

    updatePowerupButtons();
  }
}

// Ativar poder de velocidade
function activateSpeedPower() {
  if (speedPowerAvailable && !speedPowerActive) {
    speedPowerActive = true;
    speedPowerAvailable = false;
    speedTimer = 5000; // 5 segundos
    powerMeter -= 75;
    updatePowerMeter();

    document.getElementById("speed-powerup").classList.remove("available");
    document.getElementById("speed-powerup").classList.add("active");

    updatePowerupButtons();
  }
}

// Ativar poder fantasma
function activateGhostPower() {
  if (ghostPowerAvailable && !ghostPowerActive) {
    ghostPowerActive = true;
    ghostPowerAvailable = false;
    ghostTimer = 3000; // 3 segundos
    powerMeter -= 100;
    updatePowerMeter();

    document.getElementById("ghost-powerup").classList.remove("available");
    document.getElementById("ghost-powerup").classList.add("active");

    updatePowerupButtons();
  }
}

// Atualizar placar
function updateScore() {
  document.getElementById("score").textContent = score;
}

// Atualizar vidas
function updateLives() {
  document.getElementById("lives").textContent = lives;
}

// Atualizar nível
function updateLevel() {
  document.getElementById("level").textContent = level;
}

// Atualizar medidor de poder
function updatePowerMeter() {
  // Limitar o medidor a 100
  if (powerMeter > 100) powerMeter = 100;

  const meter = document.getElementById("power-fill");
  meter.style.width = powerMeter + "%";
}

document.getElementById("up-btn").addEventListener("click", (e) => {
  pacman.nextDirection = UP;
});

document.getElementById("left-btn").addEventListener("click", (e) => {
  pacman.nextDirection = LEFT;
});

document.getElementById("down-btn").addEventListener("click", (e) => {
  pacman.nextDirection = DOWN;
});

document.getElementById("right-btn").addEventListener("click", (e) => {
  pacman.nextDirection = RIGHT;
});

// Botões de poderes
document
  .getElementById("freeze-powerup")

  .addEventListener("click", activateFreezePower);
document
  .getElementById("speed-powerup")
  .addEventListener("click", activateSpeedPower);
document
  .getElementById("ghost-powerup")
  .addEventListener("click", activateGhostPower);

// Botão de reiniciar
document.getElementById("restart-btn").addEventListener("click", setupGame);
document.getElementById("next-level-btn").addEventListener("click", setupGame);

// Iniciar jogo
window.onload = setupGame;
