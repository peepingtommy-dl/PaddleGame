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
let isBallVisible = true;


let blocks = [];
let rows = 3; // 行の数
let numberOfBlocksPerRow = 10; // 1行あたりのブロックの数
let blockWidth = 50; // ブロックの幅
let blockHeight = 20; // ブロックの高さ
let horizontalSpacing = 10; // 水平間隔
let verticalSpacing = 10; // 垂直間隔
let startingY = 50; // ブロックの初めのY座標
let capsules = [];
let hasSpecialAbility = false;
const capsuleBlockIndex = 2; // 例: 6番目のブロックがカプセルを落とす
const hardBlockIndex = 5; // 例: 6番目のブロックが硬いメタリックなブロック
const capsuleColor = '#00FF00'; // カプセルの色
let bullets = [];
const bulletSpeed = 5;
const bulletRadius = 4;
let targetRow = 1; // 真ん中の行（0から始まるインデックス）
let targetColumn = 5; // 左から6番目の列（0から始まるインデックス）
let metallicBlockIndex = targetRow * numberOfBlocksPerRow + targetColumn;





// ブロックの生成部分
for (let row = 0; row < rows; row++) {
  for (let i = 0; i < numberOfBlocksPerRow; i++) {
    let block = {
      x: i * (blockWidth + horizontalSpacing),
      y: startingY + row * (blockHeight + verticalSpacing),
      width: blockWidth,
      height: blockHeight,
      visible: true,
      durability: row === 1 && i === 5 ? 20 : 1 // 例: 6番目のブロックの耐久力を20に設定
    };
    blocks.push(block);
  }
}





document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    fireBullet();
  }
});


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
  if (isBallVisible) {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
  }
}


function drawBlock() {
  blocks.forEach((block, index) => {
    if (block.visible) {
      context.beginPath();
      context.rect(block.x, block.y, block.width, block.height);
      // 6番目のブロックをメタリックな色に設定
      if (index === metallicBlockIndex) {
        context.fillStyle = "#A9A9A9";
      } 
      // カプセルを落とすブロックの色をカプセルの色と同じにする
      else if (index === capsuleBlockIndex) {
        context.fillStyle = capsuleColor;
      } 
      // 他のブロックの色
      else {
        context.fillStyle = "#0095DD";
      }
      context.fill();
      context.closePath();
    }
  });
}





function drawCapsules() {
  capsules.forEach(capsule => {
    context.beginPath();
    context.arc(capsule.x, capsule.y, capsule.radius, 0, Math.PI * 2);
    context.fillStyle = '#00FF00'; // カプセルの色
    context.fill();
    context.closePath();
  });
}

function drawBullets() {
  bullets.forEach(bullet => {
    context.beginPath();
    context.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
    context.fillStyle = '#FF0000'; // 弾の色
    context.fill();
    context.closePath();
  });
}

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bulletSpeed; // 弾を上に移動

    // 弾が画面外に出たら削除
    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  });
}


function collisionDetection() {
  blocks.forEach((block, index) => {
    if (block.visible && ballX > block.x && ballX < block.x + block.width && ballY > block.y && ballY < block.y + block.height) {
      ballYSpeed = -ballYSpeed;
      block.durability -= 1; // 耐久力を減らす
      if (block.durability <= 0) {
        block.visible = false; // 耐久力が0になったらブロックを消す
      }

      // カプセルを落とすブロックが壊れたときにカプセルを生成
      if (index === capsuleBlockIndex && block.durability <= 0) {
        capsules.push({
          x: block.x + block.width / 2,
          y: block.y,
          radius: 5,
          speed: 2
        });
      }
    }
  });
  bullets.forEach((bullet, bulletIndex) => {
    blocks.forEach((block, blockIndex) => {
      if (block.visible && bullet.x > block.x && bullet.x < block.x + block.width && bullet.y > block.y && bullet.y < block.y + block.height) {
        block.durability -= 1; // 耐久力を減らす
        if (block.durability <= 0) {
          block.visible = false; // 耐久力が0になったらブロックを消す
        }
        bullets.splice(bulletIndex, 1); // 弾を削除
      }
    });
  });

  bullets.forEach((bullet, bulletIndex) => {
    if (ballX > bullet.x - ballRadius && ballX < bullet.x + ballRadius && ballY > bullet.y - ballRadius && ballY < bullet.y + ballRadius) {
      isBallVisible = false; // ボールを非表示に設定
      bullets.splice(bulletIndex, 1); // 弾を削除
    }
  });
  
  
  
  
}



function updateCapsules() {
  capsules.forEach(capsule => {
    capsule.y += capsule.speed; // カプセルを下に移動
  });
}

function checkCapsuleCollision() {
  capsules.forEach((capsule, index) => {
    if (capsule.y + capsule.radius > paddleY && capsule.x > paddleX && capsule.x < paddleX + paddleWidth) {
      hasSpecialAbility = true; // 特殊能力を有効にする
      capsules.splice(index, 1); // カプセルを削除
    }
  });
}

function fireBullet() {
  if (hasSpecialAbility) {
    bullets.push({
      x: paddleX + paddleWidth / 2,
      y: paddleY
    });
  }
}



function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBlock();
  drawPaddle();
  drawBall();
  collisionDetection();
  drawCapsules(); // カプセルを描画
  updateCapsules(); // カプセルを更新
  checkCapsuleCollision(); // カプセルとパドルの衝突検出
  drawBullets(); // 弾を描画
  updateBullets(); // 弾を更新


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
  if (isBallVisible && ballY > canvas.height + ballRadius + 12) {
    alert("GAME OVER");
    document.location.reload(); // ゲームをリセット
    return; // これ以上の更新を停止
  }

  // context.fillStyle = "black";
  // context.fillText("X: " + ballX + " Y: " + ballY, 10, 10);

  requestAnimationFrame(draw);
}

draw(); // ゲームループを開始
