const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const paddleWidth = 100;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleY = canvas.height - paddleHeight;

let rightPressed = false;
let leftPressed = false;

let ballX = paddleX + paddleWidth / 2;
let ballY = canvas.height - paddleHeight - 10; // パドルの上にボールがくるように調整
const ballRadius = 10;
let ballYSpeed = 0; // ボールのY方向の速度
let ballXSpeed = 0; // ボールのX方向の速度
let isBallFlying = false; // ボールが飛び始めたか

let blocks = [];
let rows = 3; // 行の数
let numberOfBlocksPerRow = 10; // 1行あたりのブロックの数
let blockWidth = 50; // ブロックの幅
let blockHeight = 20; // ブロックの高さ
let horizontalSpacing = 10; // 水平間隔
let verticalSpacing = 10; // 垂直間隔
let startingY = 50; // ブロックの初めのY座標

for (let row = 0; row < rows; row++) {
  for (let i = 0; i < numberOfBlocksPerRow; i++) {
    let block = {
      x: i * (blockWidth + horizontalSpacing),
      y: startingY + row * (blockHeight + verticalSpacing),
      width: blockWidth,
      height: blockHeight,
      visible: true
    };
    blocks.push(block);
  }
}




document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
  if (e.key === 'Enter' && !isBallFlying) {
    ballYSpeed = -7;
    ballXSpeed = 0;
    isBallFlying = true;
  } else if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
}

function drawPaddle() {
  context.beginPath();
  context.rect(paddleX, paddleY, paddleWidth, paddleHeight);
  context.fillStyle = '#0095DD';
  context.fill();
  context.closePath();
}

function drawBall() {
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  context.fillStyle = '#0095DD';
  context.fill();
  context.closePath();
}

function drawBlock() {
  blocks.forEach(block => {
    if (block.visible) {
      context.beginPath();
      context.rect(block.x, block.y, block.width, block.height);
      context.fillStyle = "#0095DD";
      context.fill();
      context.closePath();
    }
  });
}


function collisionDetection() {
  blocks.forEach(block => {
    if (block.visible && ballX > block.x && ballX < block.x + block.width && ballY > block.y && ballY < block.y + block.height) {
      ballYSpeed = -ballYSpeed; // ボールの方向を反転
      block.visible = false; // ブロックを消す
    }
  });
}


function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBlock();
  drawPaddle();
  drawBall();
  collisionDetection();

  if (ballX + ballXSpeed < ballRadius || ballX + ballXSpeed > canvas.width - ballRadius) {
    ballXSpeed = -ballXSpeed;
  }

  if (ballY + ballYSpeed < ballRadius) {
    ballYSpeed = -ballYSpeed;
  }

  if (ballY + ballYSpeed > canvas.height - paddleHeight - ballRadius && ballX > paddleX - ballRadius && ballX < paddleX + paddleWidth + ballRadius) {
    // パドルの中央からの相対位置
    let relativeIntersect = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
    // 反射角を計算
    let angle = relativeIntersect * Math.PI / 3; // 60度の範囲で反射

    ballYSpeed = -7 * Math.cos(angle);
    ballXSpeed = 7 * Math.sin(angle);
  }

  if (!isBallFlying) {
    ballX = paddleX + paddleWidth / 2;
    ballY = canvas.height - paddleHeight - ballRadius;
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  ballX += ballXSpeed;
  ballY += ballYSpeed;

  // ゲームオーバーのチェック
  if (ballY > canvas.height + ballRadius + 12) {
    alert("GAME OVER");
    document.location.reload(); // ゲームをリセット
    return; // これ以上の更新を停止
  }

  context.fillStyle = "black";
  context.fillText("X: " + ballX + " Y: " + ballY, 10, 10);

  requestAnimationFrame(draw);
}

draw(); // ゲームループを開始
