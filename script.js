document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.querySelector('.game-container');
  const bird = document.getElementById('bird');
  const game = document.getElementById('game');
  const scoreDisplay = document.getElementById('score-display');
  const finalScoreDisplay = document.getElementById('final-score');
  const gameOverDisplay = document.getElementById('game-over');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');

  let birdLeft = 80;
  let birdTop = 300;
  let gravity = 0.6;
  let velocity = 0;
  let gap = 180;
  let score = 0;
  let highScore = 0;
  let gameRunning = false;
  let gameLoop;
  let pipeGenerationInterval;
  let pipes = [];
  let pipePairs = [];
  let jumpSound = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
  let scoreSound = new Audio('https://www.soundjay.com/buttons/sounds/button-21.mp3');

  bird.style.left = birdLeft + 'px';
  bird.style.top = birdTop + 'px';

  function startGame() {
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    birdTop = gameContainer.offsetHeight / 2 - 25;
    velocity = 0;
    bird.style.top = birdTop + 'px';
    bird.style.transform = 'rotate(0deg)';

    pipes.forEach(pipe => pipe.element.remove());
    pipes = [];
    pipePairs = [];

    gameOverDisplay.style.display = 'none';
    startScreen.style.display = 'none';

    gameLoop = setInterval(updateGame, 20);
    generatePipes();
    pipeGenerationInterval = setInterval(generatePipes, 1800);
  }

  function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(pipeGenerationInterval);
    finalScoreDisplay.textContent = score;

    if (score > highScore) {
      highScore = score;
      scoreDisplay.textContent = 'High Score: ' + highScore + ' | Score: ' + score;
    }

    gameOverDisplay.style.display = 'block';
    bird.style.transform = 'rotate(90deg)';
  }

  function updateGame() {
    velocity += gravity;
    birdTop += velocity;
    bird.style.top = birdTop + 'px';
    bird.style.transform = `rotate(${velocity * 3}deg)`;

    if (birdTop >= gameContainer.offsetHeight - bird.offsetHeight || birdTop <= 0) {
      endGame();
    }

    pipePairs.forEach(pair => {
      const topPipe = pair.topPipe;
      const bottomPipe = pair.bottomPipe;

      if (
        birdLeft + bird.offsetWidth > topPipe.left &&
        birdLeft < topPipe.left + topPipe.width &&
        (birdTop < topPipe.height || birdTop + bird.offsetHeight > topPipe.height + gap)
      ) {
        endGame();
      }

      if (!pair.passed && birdLeft > topPipe.left + topPipe.width) {
        pair.passed = true;
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        scoreSound.currentTime = 0;
        scoreSound.play();
      }
    });

    pipes = pipes.filter(pipe => {
      pipe.left -= 3;
      pipe.element.style.left = pipe.left + 'px';
      return pipe.left + pipe.width > 0;
    });

    pipePairs = pipePairs.filter(pair => pair.topPipe.left + pair.topPipe.width > 0);
  }

  function generatePipes() {
    if (!gameRunning) return;

    const pipeWidth = 70;
    const minTop = 80;
    const maxTop = gameContainer.offsetHeight - gap - minTop;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    const pipeX = gameContainer.offsetWidth;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.left = pipeX + 'px';
    topPipe.style.top = '0px';
    game.appendChild(topPipe);

    const bottomPipeHeight = gameContainer.offsetHeight - topHeight - gap;
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.height = bottomPipeHeight + 'px';
    bottomPipe.style.left = pipeX + 'px';
    bottomPipe.style.bottom = '0px';
    game.appendChild(bottomPipe);

    const topPipeObj = {
      element: topPipe,
      left: pipeX,
      width: pipeWidth,
      height: topHeight
    };

    const bottomPipeObj = {
      element: bottomPipe,
      left: pipeX,
      width: pipeWidth,
      height: gameContainer.offsetHeight - bottomPipeHeight
    };

    pipes.push(topPipeObj, bottomPipeObj);

    pipePairs.push({
      topPipe: topPipeObj,
      bottomPipe: bottomPipeObj,
      passed: false
    });
  }

  function jump() {
    if (gameRunning) {
      velocity = -9;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === 'ArrowUp') && gameRunning) {
      e.preventDefault();
      jump();
    } else if ((e.code === 'Space' || e.key === 'ArrowUp') && !gameRunning && gameOverDisplay.style.display === 'block') {
      startGame();
    }
  });

  gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning) {
      jump();
    } else if (gameOverDisplay.style.display === 'block') {
      startGame();
    } else {
      startGame();
    }
  });

  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  startScreen.style.display = 'flex';
});
