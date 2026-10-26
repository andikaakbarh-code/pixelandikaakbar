
/* ==================================================
   BANZE PIXEL ADVENTURE
   GAME ENGINE - SCRIPT.JS
   ================================================== */

   "use strict";

   // ==========================================
   // 1. MENGAMBIL ELEMEN HTML
   // ==========================================
   
   const canvas = document.getElementById("game-canvas");
   const ctx = canvas.getContext("2d");
   
   const startButton = document.getElementById("start-button");
   const startScreen = document.getElementById("start-screen");
   const gameMessage = document.getElementById("game-message");
   
   const coinCount = document.getElementById("coin-count");
   const livesDisplay = document.getElementById("lives");
   
   // ==========================================
   // 2. PENGATURAN GAME
   // ==========================================
   
   const WIDTH = canvas.width;
   const HEIGHT = canvas.height;
   
   const GRAVITY = 0.55;
   const JUMP_POWER = -12;
   const MOVE_SPEED = 4;
   
   let gameStarted = false;
   let gameOver = false;
   let animationId = null;
   let keys = {};
   
   let score = 0;
   let lives = 3;
   let cameraX = 0;
   let elapsedFrames = 0;
   
   // ==========================================
   // 3. KARAKTER BANZE
   // ==========================================
   
   const player = {
       x: 70,
       y: 350,
       width: 30,
       height: 42,
       vx: 0,
       vy: 0,
       onGround: false,
       invincible: 0
   };
   
   // ==========================================
   // 4. DUNIA DAN PLATFORM
   // ==========================================
   
   const worldWidth = 2800;
   
   const platforms = [
       { x: 0, y: 460, w: 650, h: 80 },
       { x: 720, y: 420, w: 400, h: 120 },
       { x: 1200, y: 460, w: 500, h: 80 },
       { x: 1780, y: 410, w: 430, h: 130 },
       { x: 2290, y: 460, w: 510, h: 80 },
   
       { x: 240, y: 370, w: 110, h: 18 },
       { x: 430, y: 310, w: 110, h: 18 },
       { x: 800, y: 330, w: 120, h: 18 },
       { x: 970, y: 275, w: 100, h: 18 },
       { x: 1320, y: 365, w: 120, h: 18 },
       { x: 1510, y: 315, w: 120, h: 18 },
       { x: 1870, y: 320, w: 120, h: 18 },
       { x: 2070, y: 270, w: 100, h: 18 },
       { x: 2420, y: 365, w: 120, h: 18 }
   ];
   
   // ==========================================
   // 5. KOIN
   // ==========================================
   
   const coins = [
       { x: 275, y: 330, collected: false },
       { x: 465, y: 270, collected: false },
       { x: 560, y: 420, collected: false },
       { x: 845, y: 290, collected: false },
       { x: 1005, y: 235, collected: false },
       { x: 1080, y: 380, collected: false },
       { x: 1370, y: 325, collected: false },
       { x: 1550, y: 275, collected: false },
       { x: 1650, y: 420, collected: false },
       { x: 1910, y: 280, collected: false },
       { x: 2110, y: 230, collected: false },
       { x: 2190, y: 370, collected: false },
       { x: 2470, y: 325, collected: false },
       { x: 2640, y: 420, collected: false }
   ];
   
   // ==========================================
   // 6. RINTANGAN
   // ==========================================
   
   const enemies = [
       { x: 380, y: 432, w: 28, h: 28, min: 350, max: 570, speed: 1.2 },
       { x: 850, y: 392, w: 28, h: 28, min: 750, max: 1060, speed: 1.4 },
       { x: 1390, y: 432, w: 28, h: 28, min: 1250, max: 1640, speed: 1.3 },
       { x: 1900, y: 382, w: 28, h: 28, min: 1810, max: 2160, speed: 1.5 },
       { x: 2470, y: 432, w: 28, h: 28, min: 2330, max: 2700, speed: 1.4 }
   ];
   
   // ==========================================
   // 7. FUNGSI GAMBAR BACKGROUND
   // ==========================================
   
   function drawBackground() {
       // Langit
       const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
       sky.addColorStop(0, "#71c5ed");
       sky.addColorStop(1, "#d0f0d1");
   
       ctx.fillStyle = sky;
       ctx.fillRect(0, 0, WIDTH, HEIGHT);
   
       // Matahari
       ctx.fillStyle = "#ffdf72";
       ctx.fillRect(780, 65, 48, 48);
       ctx.fillRect(790, 55, 28, 68);
   
       // Awan pixel
       drawCloud(100 - cameraX * 0.15, 90);
       drawCloud(390 - cameraX * 0.15, 145);
       drawCloud(700 - cameraX * 0.15, 75);
       drawCloud(1000 - cameraX * 0.15, 125);
   
       // Pegunungan
       ctx.fillStyle = "#8bc8a0";
   
       for (let i = -1; i < 8; i++) {
           const x = i * 230 - (cameraX * 0.3 % 230);
   
           ctx.beginPath();
           ctx.moveTo(x, 460);
           ctx.lineTo(x + 115, 230);
           ctx.lineTo(x + 230, 460);
           ctx.closePath();
           ctx.fill();
       }
   }
   
   function drawCloud(x, y) {
       ctx.fillStyle = "#ffffff";
   
       ctx.fillRect(x, y + 10, 70, 22);
       ctx.fillRect(x + 15, y, 25, 30);
       ctx.fillRect(x + 38, y + 4, 24, 26);
   }
   
   // ==========================================
   // 8. GAMBAR TANAH DAN PLATFORM
   // ==========================================
   
   function drawPlatforms() {
       platforms.forEach(platform => {
           const x = platform.x - cameraX;
   
           if (x + platform.w < 0 || x > WIDTH) {
               return;
           }
   
           // Tanah utama
           ctx.fillStyle = "#8b5a35";
           ctx.fillRect(x, platform.y, platform.w, platform.h);
   
           // Rumput
           ctx.fillStyle = "#56a84d";
           ctx.fillRect(x, platform.y, platform.w, 10);
   
           // Detail tanah pixel
           ctx.fillStyle = "#704328";
   
           for (let i = 0; i < platform.w; i += 35) {
               ctx.fillRect(x + i, platform.y + 25, 12, 7);
               ctx.fillRect(x + i + 15, platform.y + 50, 8, 6);
           }
       });
   }
   
   // ==========================================
   // 9. GAMBAR KARAKTER BANZE
   // ==========================================
   
   function drawPlayer() {
       const x = Math.round(player.x - cameraX);
       const y = Math.round(player.y);
   
       // Berkedip sesaat setelah terkena musuh
       if (
           player.invincible > 0 &&
           Math.floor(player.invincible / 5) % 2 === 0
       ) {
           return;
       }
   
       // Kaki
       ctx.fillStyle = "#29334a";
       ctx.fillRect(x + 4, y + 31, 9, 11);
       ctx.fillRect(x + 18, y + 31, 9, 11);
   
       // Sepatu
       ctx.fillStyle = "#5a3828";
       ctx.fillRect(x + 1, y + 38, 13, 4);
       ctx.fillRect(x + 17, y + 38, 13, 4);
   
       // Badan
       ctx.fillStyle = "#e74c3c";
       ctx.fillRect(x + 4, y + 15, 23, 18);
   
       // Kepala
       ctx.fillStyle = "#f2bd8d";
       ctx.fillRect(x + 5, y + 3, 21, 17);
   
       // Rambut
       ctx.fillStyle = "#38261e";
       ctx.fillRect(x + 4, y, 23, 7);
       ctx.fillRect(x + 3, y + 4, 5, 8);
   
       // Mata
       ctx.fillStyle = "#202020";
       ctx.fillRect(x + 20, y + 9, 3, 3);
   
       // Tangan
       ctx.fillStyle = "#f2bd8d";
       ctx.fillRect(x, y + 19, 5, 10);
       ctx.fillRect(x + 26, y + 19, 5, 10);
   }
   
   // ==========================================
   // 10. GAMBAR KOIN
   // ==========================================
   
   function drawCoins() {
       coins.forEach(coin => {
           if (coin.collected) return;
   
           const x = Math.round(coin.x - cameraX);
           const bob = Math.sin(elapsedFrames * 0.08 + coin.x) * 3;
           const y = Math.round(coin.y + bob);
   
           if (x < -20 || x > WIDTH + 20) return;
   
           ctx.fillStyle = "#b77916";
           ctx.fillRect(x - 7, y - 9, 14, 18);
   
           ctx.fillStyle = "#ffcf43";
           ctx.fillRect(x - 5, y - 10, 10, 18);
   
           ctx.fillStyle = "#fff0a3";
           ctx.fillRect(x - 2, y - 7, 3, 7);
       });
   }
   
   // ==========================================
   // 11. GAMBAR MUSUH
   // ==========================================
   
   function drawEnemies() {
       enemies.forEach(enemy => {
           const x = Math.round(enemy.x - cameraX);
   
           if (x < -40 || x > WIDTH + 40) return;
   
           // Tubuh musuh
           ctx.fillStyle = "#7d3c98";
           ctx.fillRect(x, enemy.y + 7, enemy.w, enemy.h - 7);
   
           // Bagian atas
           ctx.fillStyle = "#b56bd1";
           ctx.fillRect(x + 4, enemy.y, enemy.w - 8, 12);
   
           // Mata
           ctx.fillStyle = "#ffffff";
           ctx.fillRect(x + 5, enemy.y + 12, 6, 6);
           ctx.fillRect(x + 18, enemy.y + 12, 6, 6);
   
           ctx.fillStyle = "#202020";
           ctx.fillRect(x + 8, enemy.y + 14, 3, 3);
           ctx.fillRect(x + 21, enemy.y + 14, 3, 3);
       });
   }
   
   // ==========================================
   // 12. GAMBAR BENDERA FINISH
   // ==========================================
   
   function drawFinish() {
       const x = worldWidth - 100 - cameraX;
   
       ctx.fillStyle = "#f4f4f4";
       ctx.fillRect(x, 300, 8, 160);
   
       ctx.fillStyle = "#f0cc43";
       ctx.fillRect(x + 8, 300, 60, 20);
       ctx.fillRect(x + 8, 340, 60, 20);
   
       ctx.fillStyle = "#ffffff";
       ctx.fillRect(x + 8, 320, 60, 20);
       ctx.fillRect(x + 8, 360, 60, 20);
   }
   
   // ==========================================
   // 13. MENGGAMBAR SELURUH GAME
   // ==========================================
   
   function drawGame() {
       ctx.clearRect(0, 0, WIDTH, HEIGHT);
   
       drawBackground();
       drawPlatforms();
       drawCoins();
       drawEnemies();
       drawFinish();
       drawPlayer();
   }
   
   // ==========================================
   // 14. RESET PERMAINAN
   // ==========================================
   
   function resetGame() {
       player.x = 70;
       player.y = 350;
       player.vx = 0;
       player.vy = 0;
       player.onGround = false;
       player.invincible = 0;
   
       score = 0;
       lives = 3;
       cameraX = 0;
       elapsedFrames = 0;
   
       coins.forEach(coin => {
           coin.collected = false;
       });
   
       enemies.forEach(enemy => {
           enemy.x = enemy.min + 30;
           enemy.direction = 1;
       });
   
       keys = {};
       gameOver = false;
   
       updateStatus();
   }
   
   // ==========================================
   // 15. MEMPERBARUI ANGKA KOIN DAN NYAWA
   // ==========================================
   
   function updateStatus() {
       coinCount.textContent = score;
       livesDisplay.textContent = lives;
   }
   
   // ==========================================
   // 16. MENGECEK TABRAKAN PLATFORM
   // ==========================================
   
   function collideWithPlatforms(previousBottom) {
       player.onGround = false;
   
       platforms.forEach(platform => {
           const playerRight = player.x + player.width;
           const playerBottom = player.y + player.height;
   
           const horizontalCollision =
               playerRight > platform.x &&
               player.x < platform.x + platform.w;
   
           const landedOnTop =
               previousBottom <= platform.y + 5 &&
               playerBottom >= platform.y &&
               player.vy >= 0;
   
           if (horizontalCollision && landedOnTop) {
               player.y = platform.y - player.height;
               player.vy = 0;
               player.onGround = true;
           }
       });
   }
   
   // ==========================================
   // 17. MENGAMBIL KOIN
   // ==========================================
   
   function collectCoins() {
       coins.forEach(coin => {
           if (coin.collected) return;
   
           const dx = player.x + player.width / 2 - coin.x;
           const dy = player.y + player.height / 2 - coin.y;
   
           if (Math.abs(dx) < 25 && Math.abs(dy) < 30) {
               coin.collected = true;
               score++;
               updateStatus();
           }
       });
   }
   
   // ==========================================
   // 18. TABRAKAN DENGAN MUSUH
   // ==========================================
   
   function checkEnemies() {
       if (player.invincible > 0) {
           player.invincible--;
           return;
       }
   
       enemies.forEach(enemy => {
           const collision =
               player.x + player.width > enemy.x &&
               player.x < enemy.x + enemy.w &&
               player.y + player.height > enemy.y &&
               player.y < enemy.y + enemy.h;
   
           if (collision) {
               lives--;
               player.invincible = 100;
               player.vy = -6;
               player.vx = player.x < enemy.x ? -4 : 4;
   
               updateStatus();
   
               if (lives <= 0) {
                   endGame(false);
               }
           }
       });
   }
   
   // ==========================================
   // 19. MEMPERBARUI MUSUH
   // ==========================================
   
   function updateEnemies() {
       enemies.forEach(enemy => {
           if (enemy.direction === undefined) {
               enemy.direction = 1;
           }
   
           enemy.x += enemy.speed * enemy.direction;
   
           if (enemy.x >= enemy.max) {
               enemy.x = enemy.max;
               enemy.direction = -1;
           }
   
           if (enemy.x <= enemy.min) {
               enemy.x = enemy.min;
               enemy.direction = 1;
           }
       });
   }
   
   // ==========================================
   // 20. LOGIKA PERGERAKAN
   // ==========================================
   
   function updateGame() {
       elapsedFrames++;
   
       // Gerakan kiri dan kanan
       player.vx = 0;
   
       if (keys["arrowleft"] || keys["a"]) {
           player.vx = -MOVE_SPEED;
       }
   
       if (keys["arrowright"] || keys["d"]) {
           player.vx = MOVE_SPEED;
       }
   
       // Melompat
       if (
           (keys[" "] || keys["arrowup"] || keys["w"]) &&
           player.onGround
       ) {
           player.vy = JUMP_POWER;
           player.onGround = false;
       }
   
       const previousBottom = player.y + player.height;
   
       // Fisika
       player.vy += GRAVITY;
       player.x += player.vx;
       player.y += player.vy;
   
       // Batas dunia
       if (player.x < 0) player.x = 0;
   
       if (player.x + player.width > worldWidth) {
           player.x = worldWidth - player.width;
       }
   
       // Platform
       collideWithPlatforms(previousBottom);
   
       // Jatuh dari dunia
       if (player.y > HEIGHT + 100) {
           lives--;
           updateStatus();
   
           if (lives <= 0) {
               endGame(false);
               return;
           }
   
           player.x = Math.max(0, player.x - 80);
           player.y = 250;
           player.vy = 0;
           player.invincible = 100;
       }
   
       updateEnemies();
       collectCoins();
       checkEnemies();
   
       // Kamera mengikuti karakter
       cameraX = player.x - WIDTH * 0.35;
   
       if (cameraX < 0) cameraX = 0;
   
       if (cameraX > worldWidth - WIDTH) {
           cameraX = worldWidth - WIDTH;
       }
   
       // Menang jika sampai ke ujung dunia
       if (player.x >= worldWidth - 100) {
           endGame(true);
       }
   }
   
   // ==========================================
   // 21. PESAN MENANG ATAU GAME OVER
   // ==========================================
   
   function endGame(won) {
       gameOver = true;
       gameStarted = false;
   
       gameMessage.classList.remove("hidden");
   
       if (won) {
           gameMessage.innerHTML =
               "🎉 PETUALANGAN SELESAI!<br>" +
               "Koin terkumpul: " + score +
               "<br><button id='restart-button'>MAIN LAGI</button>";
       } else {
           gameMessage.innerHTML =
               "GAME OVER<br>" +
               "Koin terkumpul: " + score +
               "<br><button id='restart-button'>COBA LAGI</button>";
       }
   
       const restartButton = document.getElementById("restart-button");
   
       restartButton.addEventListener("click", function() {
           gameMessage.classList.add("hidden");
           startScreen.classList.add("hidden");
           resetGame();
           gameStarted = true;
       });
   }
   
   // ==========================================
   // 22. GAME LOOP
   // ==========================================
   
   function gameLoop() {
       if (gameStarted && !gameOver) {
           updateGame();
       }
   
       drawGame();
   
       animationId = requestAnimationFrame(gameLoop);
   }
   
   // ==========================================
   // 23. TOMBOL MULAI PETUALANGAN
   // ==========================================
   
   startButton.addEventListener("click", function() {
       if (gameStarted) return;
   
       gameMessage.classList.add("hidden");
       startScreen.classList.add("hidden");
   
       resetGame();
   
       gameStarted = true;
   });
   
   // ==========================================
   // 24. KONTROL KEYBOARD
   // ==========================================
   
   document.addEventListener("keydown", function(event) {
       const key = event.key.toLowerCase();
   
       if (
           key === "arrowleft" ||
           key === "arrowright" ||
           key === "arrowup" ||
           key === " " ||
           key === "a" ||
           key === "d" ||
           key === "w"
       ) {
           event.preventDefault();
       }
   
       keys[key] = true;
   
       // Mengulang permainan dari layar game over
       if (gameOver && key === "enter") {
           gameMessage.classList.add("hidden");
           resetGame();
           gameStarted = true;
       }
   });
   
   document.addEventListener("keyup", function(event) {
       keys[event.key.toLowerCase()] = false;
   });
   
   window.addEventListener("blur", function() {
       keys = {};
   });
   
   // ==========================================
   // 25. KONTROL SENTUH HP
   // ==========================================
   
   function pasangKontrolSentuh(idTombol, arah) {
       const tombol = document.getElementById(idTombol);
   
       if (!tombol) {
           console.warn("Tombol tidak ditemukan:", idTombol);
           return;
       }
   
       tombol.style.touchAction = "none";
   
       tombol.addEventListener("pointerdown", function(event) {
           event.preventDefault();
   
           if (arah === "arrowleft") keys["arrowleft"] = true;
           if (arah === "arrowright") keys["arrowright"] = true;
   
           if (
               arah === "jump" &&
               gameStarted &&
               !gameOver &&
               player.onGround
           ) {
               player.vy = JUMP_POWER;
               player.onGround = false;
           }
   
           if (tombol.setPointerCapture) {
               tombol.setPointerCapture(event.pointerId);
           }
       });
   
       function release(event) {
           event.preventDefault();
   
           if (arah === "arrowleft") keys["arrowleft"] = false;
           if (arah === "arrowright") keys["arrowright"] = false;
       }
   
       tombol.addEventListener("pointerup", release);
       tombol.addEventListener("pointercancel", release);
       tombol.addEventListener("lostpointercapture", release);
   }
   
   pasangKontrolSentuh("left-button", "arrowleft");
   pasangKontrolSentuh("right-button", "arrowright");
   pasangKontrolSentuh("jump-button", "jump");
   
   // ==========================================
   // 26. MENJALANKAN GAME PERTAMA KALI
   // ==========================================
   
   resetGame();
   drawGame();
   gameLoop();
   