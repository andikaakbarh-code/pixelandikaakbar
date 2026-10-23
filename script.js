
/* ==========================================
   BANZE PIXEL ADVENTURE
   SCRIPT.JS
   ========================================== */

   const canvas = document.getElementById("game-canvas");
   const ctx = canvas.getContext("2d");
   
   const startScreen = document.getElementById("start-screen");
   const startButton = document.getElementById("start-button");
   const coinCount = document.getElementById("coin-count");
   const livesText = document.getElementById("lives");
   const gameMessage = document.getElementById("game-message");
   
   ctx.imageSmoothingEnabled = false;
   
   // Ukuran dunia dan layar
   const SCREEN_WIDTH = canvas.width;
   const SCREEN_HEIGHT = canvas.height;
   const WORLD_WIDTH = 4200;
   const GROUND_Y = 460;
   
 // PENGATURAN FISIKA BANZE
const GRAVITY = 0.55;
const MOVE_SPEED = 4.5;
const JUMP_POWER = -12.5;

// Pengaturan tambahan gerakan
const ACCELERATION = 0.7;
const FRICTION = 0.8;
const MAX_FALL_SPEED = 12;
   // Status permainan
   let gameStarted = false;
   let gameOver = false;
   let cameraX = 0;
   let score = 0;
   let lives = 3;
   let keys = {};
   let lastTime = 0;
   
   // Karakter Banze
   const player = {
       x: 80,
       y: 300,
       width: 30,
       height: 42,
       vx: 0,
       vy: 0,
       onGround: false,
       facing: 1,
       animTime: 0,
       invincible: 0
   };
   
   // Platform: posisi x, posisi y, lebar, tinggi
   const platforms = [
       { x: 0, y: GROUND_Y, w: 700, h: 100 },
       { x: 790, y: GROUND_Y, w: 480, h: 100 },
       { x: 1370, y: GROUND_Y, w: 570, h: 100 },
       { x: 2040, y: GROUND_Y, w: 500, h: 100 },
       { x: 2650, y: GROUND_Y, w: 600, h: 100 },
       { x: 3350, y: GROUND_Y, w: 850, h: 100 },
   
       // Platform melayang
       { x: 320, y: 365, w: 120, h: 18 },
       { x: 510, y: 305, w: 110, h: 18 },
       { x: 900, y: 370, w: 120, h: 18 },
       { x: 1080, y: 315, w: 110, h: 18 },
       { x: 1510, y: 365, w: 130, h: 18 },
       { x: 1710, y: 305, w: 110, h: 18 },
       { x: 2190, y: 360, w: 120, h: 18 },
       { x: 2380, y: 300, w: 120, h: 18 },
       { x: 2790, y: 365, w: 120, h: 18 },
       { x: 3000, y: 310, w: 120, h: 18 },
       { x: 3500, y: 365, w: 130, h: 18 },
       { x: 3720, y: 305, w: 120, h: 18 }
   ];
   
   // Koin yang bisa dikumpulkan
   let coins = [];
   
   function createCoins() {
       coins = [];
   
       const coinPositions = [
           [350, 325], [550, 265], [610, 415],
           [930, 330], [1120, 275], [1180, 415],
           [1540, 325], [1750, 265], [1840, 415],
           [2220, 320], [2420, 260], [2470, 415],
           [2820, 325], [3040, 270], [3150, 415],
           [3540, 325], [3760, 265], [3900, 415]
       ];
   
       coinPositions.forEach(([x, y]) => {
           coins.push({
               x,
               y,
               collected: false,
               phase: Math.random() * Math.PI * 2
           });
       });
   }
   
   createCoins();
   
   // Monster yang bergerak bolak-balik
   const enemies = [
       { x: 430, y: GROUND_Y - 28, start: 400, end: 600, dir: 1, speed: 1.2, alive: true },
       { x: 980, y: GROUND_Y - 28, start: 850, end: 1150, dir: 1, speed: 1.5, alive: true },
       { x: 1590, y: GROUND_Y - 28, start: 1430, end: 1840, dir: 1, speed: 1.4, alive: true },
       { x: 2260, y: GROUND_Y - 28, start: 2110, end: 2480, dir: 1, speed: 1.7, alive: true },
       { x: 2840, y: GROUND_Y - 28, start: 2700, end: 3150, dir: 1, speed: 1.5, alive: true },
       { x: 3590, y: GROUND_Y - 28, start: 3400, end: 4050, dir: 1, speed: 1.8, alive: true }
   ];
   
   // Dekorasi pohon yang konsisten
   const trees = [];
   
   for (let x = 100; x < WORLD_WIDTH; x += 170) {
       trees.push({
           x: x + Math.sin(x) * 35,
           height: 65 + (Math.abs(Math.sin(x * 0.17)) * 40)
       });
   }
   // ==========================================
// KONTROL LAYAR SENTUH BANZE
// ==========================================

function holdButton(buttonId, keyName) {
    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        keys[keyName] = true;
        button.setPointerCapture(event.pointerId);
    });

    function releaseButton(event) {
        event.preventDefault();
        keys[keyName] = false;
    }

    button.addEventListener("pointerup", releaseButton);
    button.addEventListener("pointercancel", releaseButton);
    button.addEventListener("lostpointercapture", function () {
        keys[keyName] = false;
    });
}

holdButton("leftButton", "ArrowLeft");
holdButton("rightButton", "ArrowRight");
holdButton("jumpButton", "ArrowUp");
   
   // ==================================================
   // INPUT KEYBOARD
   // ==================================================
   
   document.addEventListener("keydown", function(event) {
       const key = event.key.toLowerCase();
       
/* =====================================
   KONTROL TOUCHSCREEN UNTUK HP
===================================== */

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");
const jumpButton = document.getElementById("jump-button");

// Menahan tombol kiri atau kanan agar Banze terus bergerak
function pasangTombolGerak(tombol, namaTombol) {
    if (!tombol) return;

    tombol.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        keys[namaTombol] = true;

        if (tombol.setPointerCapture) {
            tombol.setPointerCapture(event.pointerId);
        }
    });

    function lepaskanTombol(event) {
        keys[namaTombol] = false;
    }

    tombol.addEventListener("pointerup", lepaskanTombol);
    tombol.addEventListener("pointercancel", lepaskanTombol);
    tombol.addEventListener("lostpointercapture", lepaskanTombol);
}

// Tombol kiri dan kanan
pasangTombolGerak(leftButton, "arrowleft");
pasangTombolGerak(rightButton, "arrowright");

// Tombol lompat
if (jumpButton) {
    jumpButton.addEventListener("pointerdown", function (event) {
        event.preventDefault();

        if (jumpButton.setPointerCapture) {
            jumpButton.setPointerCapture(event.pointerId);
        }

        keys[" "] = true;
    });

    function lepaskanLompatan() {
        keys[" "] = false;
    }

    jumpButton.addEventListener("pointerup", lepaskanLompatan);
    jumpButton.addEventListener("pointercancel", lepaskanLompatan);
    jumpButton.addEventListener("lostpointercapture", lepaskanLompatan);
}

   
       if (
           key === "arrowleft" ||
           key === "arrowright" ||
           key === " "
       ) {
           event.preventDefault();
       }
   
       keys[key] = true;
   
       // Lompatan hanya jika Banze menyentuh tanah/platform
       if (
           gameStarted &&
           !gameOver &&
           (key === " " || key === "arrowup" || key === "w") &&
           player.onGround
       ) {
           player.vy = JUMP_POWER;
           player.onGround = false;
       }
   
       // Mulai ulang jika game selesai
       if (gameOver && key === "enter") {
           resetGame();
       }
   });
   
   document.addEventListener("keyup", function(event) {
       keys[event.key.toLowerCase()] = false;
   });
   
   // Mencegah tombol tetap ditekan saat jendela kehilangan fokus
   window.addEventListener("blur", function() {
       keys = {};
   });
   
   // ==================================================
   // MULAI DAN RESET GAME
   // ==================================================
   
   startButton.addEventListener("click", function() {
       startScreen.classList.add("hidden");
       gameMessage.classList.add("hidden");
   
       if (gameOver) {
           resetGame();
       }
   
       gameStarted = true;
       lastTime = performance.now();
   });
   
   function resetGame() {
       player.x = 80;
       player.y = 300;
       player.vx = 0;
       player.vy = 0;
       player.onGround = false;
       player.facing = 1;
       player.invincible = 0;
   
       cameraX = 0;
       score = 0;
       lives = 3;
       gameOver = false;
   
       enemies.forEach(enemy => {
           enemy.alive = true;
           enemy.x = enemy.start;
           enemy.dir = 1;
       });
   
       createCoins();
       updateHUD();
   
       gameMessage.classList.add("hidden");
   }
   
   // ==================================================
   // UPDATE PERMAINAN
   // ==================================================
   
   function update(delta) {
       if (!gameStarted || gameOver) return;
   
       // Menormalkan kecepatan supaya lebih konsisten
       const dt = Math.min(delta / 16.67, 2);
   
       // Gerakan horizontal
       
    // GERAKAN HORIZONTAL YANG LEBIH HALUS
    player.targetVx = 0;

    if (keys["arrowright"] || keys["d"]) {
        player.targetVx = MOVE_SPEED;
        player.facing = 1;
    }

    if (keys["arrowleft"] || keys["a"]) {
        player.targetVx = -MOVE_SPEED;
        player.facing = -1;
    }

    // Mempercepat gerakan secara bertahap
    if (player.targetVx !== 0) {
        player.vx +=
            (player.targetVx - player.vx) *
            Math.min(1, ACCELERATION * dt);
    } else {
        // Memperlambat Banze saat tombol dilepas
        player.vx *= Math.pow(FRICTION, dt);

        if (Math.abs(player.vx) < 0.1) {
            player.vx = 0;
        }
    }

    // Memindahkan Banze
    player.x += player.vx * dt;

   
       // Batas awal dan akhir dunia
       player.x = Math.max(
           0,
           Math.min(player.x, WORLD_WIDTH - player.width)
       );
   
       // Gravitasi
       const previousBottom = player.y + player.height;
   
      // Gravitasi dengan batas kecepatan jatuh
player.vy += GRAVITY * dt;
player.vy = Math.min(player.vy, MAX_FALL_SPEED);
player.y += player.vy * dt;
       player.onGround = false;
   
       // Tabrakan dari atas dengan platform
       for (const platform of platforms) {
           const currentBottom = player.y + player.height;
   
           const overlapX =
               player.x + player.width > platform.x &&
               player.x < platform.x + platform.w;
   
           const crossedTop =
               previousBottom <= platform.y + 2 &&
               currentBottom >= platform.y;
   
           if (
               overlapX &&
               crossedTop &&
               player.vy >= 0
           ) {
               player.y = platform.y - player.height;
               player.vy = 0;
               player.onGround = true;
           }
       }
   
       // Animasi langkah Banze
       if (Math.abs(player.vx) > 0) {
           player.animTime += dt * 0.18;
       } else {
           player.animTime = 0;
       }
   
       if (player.invincible > 0) {
           player.invincible -= dt;
       }
   
       // Ambil koin
       for (const coin of coins) {
           if (coin.collected) continue;
   
           const dx = player.x + player.width / 2 - coin.x;
           const dy = player.y + player.height / 2 - coin.y;
   
           if (Math.hypot(dx, dy) < 27) {
               coin.collected = true;
               score++;
               updateHUD();
           }
       }
   
       // Gerakan monster
       for (const enemy of enemies) {
           if (!enemy.alive) continue;
   
           enemy.x += enemy.speed * enemy.dir * dt;
   
           if (enemy.x >= enemy.end) {
               enemy.x = enemy.end;
               enemy.dir = -1;
           }
   
           if (enemy.x <= enemy.start) {
               enemy.x = enemy.start;
               enemy.dir = 1;
           }
   
           // Tabrakan Banze dan monster
           const touching =
               player.x < enemy.x + 28 &&
               player.x + player.width > enemy.x &&
               player.y < enemy.y + 24 &&
               player.y + player.height > enemy.y;
   
           if (touching && player.invincible <= 0) {
               // Melompat di atas monster mengalahkannya
               if (
                   player.vy > 0 &&
                   player.y + player.height < enemy.y + 16
               ) {
                   enemy.alive = false;
                   player.vy = -8;
               } else {
                   lives--;
                   updateHUD();
   
                   if (lives <= 0) {
                       endGame(false);
                       return;
                   }
   
                   player.invincible = 100;
                   player.vy = -6;
                   player.x = Math.max(0, player.x - 45);
               }
           }
       }
   
       // Kamera mengikuti Banze
       // KAMERA SIDE-SCROLLING YANG LEBIH HALUS
const targetCameraX = player.x - SCREEN_WIDTH * 0.38;

const batasKamera = WORLD_WIDTH - SCREEN_WIDTH;

cameraX += (targetCameraX - cameraX) * Math.min(1, 0.12 * dt);

// Jangan keluar dari batas dunia
cameraX = Math.max(0, Math.min(cameraX, batasKamera));
   
       // Jatuh ke jurang
       if (player.y > SCREEN_HEIGHT + 100) {
           lives--;
           updateHUD();
   
           if (lives <= 0) {
               endGame(false);
               return;
           }
   
           // Kembali ke titik aman terdekat
           player.x = Math.max(0, player.x - 120);
           player.y = 250;
           player.vx = 0;
           player.vy = 0;
           player.invincible = 100;
       }
   
       // Mencapai ujung dunia
       if (player.x >= WORLD_WIDTH - 100) {
           endGame(true);
       }
   }
   
   function updateHUD() {
       coinCount.textContent = score;
       livesText.textContent = lives;
   }
   
   function endGame(won) {
       gameOver = true;
   
       gameMessage.innerHTML = won
           ? "🏆 PETUALANGAN SELESAI!<br>Kamu berhasil mencapai akhir dunia!<br><br>Tekan ENTER untuk bermain lagi."
           : "GAME OVER<br>Petualangan Banze belum selesai!<br><br>Tekan ENTER untuk mencoba lagi.";
   
       gameMessage.classList.remove("hidden");
   }
   
   // ==================================================
   // GAMBAR LATAR
   // ==================================================
   
   function drawBackground() {
       // Langit
       const sky = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
       sky.addColorStop(0, "#68b8e8");
       sky.addColorStop(1, "#d2f0df");
   
       ctx.fillStyle = sky;
       ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
   
       // Matahari
       ctx.fillStyle = "#ffe78b";
       ctx.fillRect(760, 70, 54, 54);
       ctx.fillRect(772, 58, 30, 78);
   
       // Awan bergerak lambat (parallax)
       ctx.fillStyle = "#f4fff4";
   
       for (let i = 0; i < 9; i++) {
           const worldCloudX = i * 480 + 100;
           const screenX = worldCloudX - cameraX * 0.25;
   
           if (screenX > -130 && screenX < SCREEN_WIDTH + 130) {
               ctx.fillRect(screenX, 75 + (i % 3) * 42, 64, 18);
               ctx.fillRect(screenX + 16, 59 + (i % 3) * 42, 32, 18);
               ctx.fillRect(screenX + 32, 75 + (i % 3) * 42, 48, 18);
           }
       }
   
       // Bukit jauh
       ctx.fillStyle = "#93c99a";
   
       for (let i = 0; i < 12; i++) {
           const x = i * 430 - cameraX * 0.4;
   
           ctx.beginPath();
           ctx.moveTo(x - 100, GROUND_Y);
           ctx.lineTo(x + 120, 180);
           ctx.lineTo(x + 340, GROUND_Y);
           ctx.fill();
       }
   
       // Bukit dekat
       ctx.fillStyle = "#5c9b68";
   
       for (let i = 0; i < 15; i++) {
           const x = i * 350 - cameraX * 0.65;
   
           ctx.beginPath();
           ctx.moveTo(x - 80, GROUND_Y);
           ctx.lineTo(x + 100, 275);
           ctx.lineTo(x + 280, GROUND_Y);
           ctx.fill();
       }
   
       // Pohon dekorasi
       for (const tree of trees) {
           const screenX = tree.x - cameraX * 0.82;
   
           if (screenX < -80 || screenX > SCREEN_WIDTH + 80) {
               continue;
           }
   
           const trunkHeight = tree.height * 0.55;
   
           ctx.fillStyle = "#76503b";
           ctx.fillRect(screenX, GROUND_Y - trunkHeight, 14, trunkHeight);
   
           ctx.fillStyle = "#26734b";
           ctx.fillRect(screenX - 22, GROUND_Y - tree.height, 58, 32);
           ctx.fillRect(screenX - 12, GROUND_Y - tree.height - 20, 38, 25);
           ctx.fillRect(screenX - 4, GROUND_Y - tree.height - 34, 22, 18);
   
           ctx.fillStyle = "#46985a";
           ctx.fillRect(screenX - 12, GROUND_Y - tree.height + 8, 18, 10);
       }
   }
   
   // ==================================================
   // GAMBAR TANAH DAN PLATFORM
   // ==================================================
   
   function drawPlatforms() {
       for (const platform of platforms) {
           const screenX = platform.x - cameraX;
   
           if (
               screenX + platform.w < 0 ||
               screenX > SCREEN_WIDTH
           ) {
               continue;
           }
   
           // Tanah
           ctx.fillStyle = "#855536";
           ctx.fillRect(screenX, platform.y, platform.w, platform.h);
   
           // Lapisan rumput
           ctx.fillStyle = "#3f9d51";
           ctx.fillRect(screenX, platform.y, platform.w, 10);
   
           ctx.fillStyle = "#76cf65";
           ctx.fillRect(screenX, platform.y, platform.w, 4);
   
           // Tekstur tanah pixel
           ctx.fillStyle = "#a77345";
   
           for (let x = 0; x < platform.w; x += 38) {
               ctx.fillRect(
                   screenX + x + 8,
                   platform.y + 24,
                   10,
                   5
               );
   
               ctx.fillRect(
                   screenX + x + 22,
                   platform.y + 53,
                   6,
                   6
               );
           }
   
           // Lapisan bawah yang lebih gelap
           ctx.fillStyle = "#5d3c2e";
           ctx.fillRect(
               screenX,
               platform.y + platform.h - 12,
               platform.w,
               12
           );
       }
   
       // Bendera finis
       const finishX = WORLD_WIDTH - 100 - cameraX;
   
       ctx.fillStyle = "#65452d";
       ctx.fillRect(finishX, GROUND_Y - 95, 6, 95);
   
       ctx.fillStyle = "#ffdf64";
       ctx.fillRect(finishX + 6, GROUND_Y - 95, 40, 25);
   
       ctx.fillStyle = "#d95b54";
       ctx.fillRect(finishX + 6, GROUND_Y - 70, 20, 25);
   }
   
   // ==================================================
   // GAMBAR KOIN
   // ==================================================
   
   function drawCoins(time) {
       for (const coin of coins) {
           if (coin.collected) continue;
   
           const x = coin.x - cameraX;
           const bob = Math.sin(time * 0.004 + coin.phase) * 4;
           const y = coin.y + bob;
   
           if (x < -40 || x > SCREEN_WIDTH + 40) continue;
   
           // Koin berbentuk pixel
           ctx.fillStyle = "#b77816";
           ctx.fillRect(x - 9, y - 12, 18, 24);
   
           ctx.fillStyle = "#ffcf45";
           ctx.fillRect(x - 6, y - 12, 12, 24);
           ctx.fillRect(x - 10, y - 7, 20, 14);
   
           ctx.fillStyle = "#fff2a1";
           ctx.fillRect(x - 3, y - 7, 4, 9);
       }
   }
   
   // ==================================================
   // GAMBAR MONSTER
   // ==================================================
   
   function drawEnemies() {
       for (const enemy of enemies) {
           if (!enemy.alive) continue;
   
           const x = enemy.x - cameraX;
           const y = enemy.y;
   
           if (x < -50 || x > SCREEN_WIDTH + 50) continue;
   
           // Badan monster hijau
           ctx.fillStyle = "#287a50";
           ctx.fillRect(x + 3, y + 8, 22, 16);
           ctx.fillRect(x, y + 14, 28, 10);
   
           // Bagian atas
           ctx.fillStyle = "#45bd69";
           ctx.fillRect(x + 5, y + 4, 18, 10);
   
           // Mata putih
           ctx.fillStyle = "#ffffff";
           ctx.fillRect(x + 6, y + 10, 6, 6);
           ctx.fillRect(x + 17, y + 10, 6, 6);
   
           // Pupil
           ctx.fillStyle = "#17221f";
           ctx.fillRect(x + 9, y + 12, 3, 3);
           ctx.fillRect(x + 19, y + 12, 3, 3);
   
           // Kaki
           ctx.fillStyle = "#1d5d3e";
           ctx.fillRect(x + 4, y + 22, 6, 5);
           ctx.fillRect(x + 18, y + 22, 6, 5);
       }
   }
   
   // ==================================================
   // GAMBAR BANZE - KARAKTER PIXEL ART
   // ==================================================
   
  

function drawBanze(time) {
    const x = Math.round(player.x - cameraX);
    const y = Math.round(player.y);

    // Kedipan saat terkena monster
    if (
        player.invincible > 0 &&
        Math.floor(player.invincible / 8) % 2 === 0
    ) {
        return;
    }

    // Animasi kaki saat berjalan
    let legOffset = 0;

    if (Math.abs(player.vx) > 0 && player.onGround) {
        legOffset = Math.round(
            Math.sin(player.animTime * 10) * 2
        );
    }

    // Animasi lengan
    const armOffset = player.onGround
        ? Math.round(Math.sin(player.animTime * 10) * 2)
        : -2;

    ctx.save();

    // Membalik karakter saat menghadap kiri
    if (player.facing === -1) {
        ctx.translate(x + player.width, 0);
        ctx.scale(-1, 1);
        ctx.translate(-x, 0);
    }

    // Bayangan di bawah Banze
    ctx.fillStyle = "rgba(20, 25, 20, 0.3)";
    ctx.fillRect(x - 4, y + 43, 38, 5);

    // ======================================
    // KAKI DAN CELANA
    // ======================================

    // Kaki kiri
    ctx.fillStyle = "#25252c";
    ctx.fillRect(x + 5, y + 29 + legOffset, 9, 8);

    // Kaki kanan
    ctx.fillRect(x + 17, y + 29 - legOffset, 9, 8);

    // Detail celana
    ctx.fillStyle = "#41414a";
    ctx.fillRect(x + 7, y + 30 + legOffset, 3, 4);
    ctx.fillRect(x + 19, y + 30 - legOffset, 3, 4);

    // Sepatu bot
    ctx.fillStyle = "#111116";
    ctx.fillRect(x + 3, y + 37 + legOffset, 12, 4);
    ctx.fillRect(x + 16, y + 37 - legOffset, 12, 4);

    // Sol sepatu
    ctx.fillStyle = "#68636a";
    ctx.fillRect(x + 3, y + 40 + legOffset, 12, 1);
    ctx.fillRect(x + 16, y + 40 - legOffset, 12, 1);

    // ======================================
    // BADAN BEROTOT
    // ======================================

    // Leher
    ctx.fillStyle = "#d99465";
    ctx.fillRect(x + 12, y + 9, 7, 6);

    // Badan utama dengan baju hitam
    ctx.fillStyle = "#111218";
    ctx.fillRect(x + 7, y + 14, 17, 15);

    // Bahu lebar
    ctx.fillStyle = "#d99465";
    ctx.fillRect(x + 3, y + 14, 7, 7);
    ctx.fillRect(x + 21, y + 14, 7, 7);

    // Sorotan bahu
    ctx.fillStyle = "#ffc18b";
    ctx.fillRect(x + 4, y + 14, 4, 2);
    ctx.fillRect(x + 22, y + 14, 4, 2);

    // Dada berotot
    ctx.fillStyle = "#292a32";
    ctx.fillRect(x + 9, y + 16, 6, 5);
    ctx.fillRect(x + 16, y + 16, 5, 5);

    // Bayangan dada
    ctx.fillStyle = "#08090d";
    ctx.fillRect(x + 14, y + 16, 2, 7);

    // Detail otot perut
    ctx.fillStyle = "#393a43";
    ctx.fillRect(x + 10, y + 22, 4, 2);
    ctx.fillRect(x + 16, y + 22, 4, 2);
    ctx.fillRect(x + 11, y + 25, 3, 2);
    ctx.fillRect(x + 16, y + 25, 3, 2);

    // Garis tepi baju
    ctx.fillStyle = "#55545e";
    ctx.fillRect(x + 8, y + 15, 2, 10);
    ctx.fillRect(x + 22, y + 17, 2, 8);

    // ======================================
    // LENGAN BEROTOT
    // ======================================

    // Lengan kiri
    ctx.fillStyle = "#d99465";
    ctx.fillRect(x + 1, y + 18 + armOffset, 6, 7);

    // Lengan kanan
    ctx.fillRect(x + 24, y + 18 - armOffset, 6, 7);

    // Sorotan otot lengan
    ctx.fillStyle = "#ffc18b";
    ctx.fillRect(x + 2, y + 19 + armOffset, 3, 2);
    ctx.fillRect(x + 25, y + 19 - armOffset, 3, 2);

    // Bayangan otot lengan
    ctx.fillStyle = "#b96f4b";
    ctx.fillRect(x + 4, y + 22 + armOffset, 2, 2);
    ctx.fillRect(x + 25, y + 22 - armOffset, 2, 2);

    // Sarung tangan hitam
    ctx.fillStyle = "#15151b";
    ctx.fillRect(x + 1, y + 25 + armOffset, 6, 4);
    ctx.fillRect(x + 23, y + 25 - armOffset, 6, 4);

    // Detail sarung tangan
    ctx.fillStyle = "#62616b";
    ctx.fillRect(x + 2, y + 26 + armOffset, 3, 1);
    ctx.fillRect(x + 24, y + 26 - armOffset, 3, 1);

    // ======================================
    // SABUK
    // ======================================

    ctx.fillStyle = "#786047";
    ctx.fillRect(x + 7, y + 28, 17, 3);

    // Gesper sabuk
    ctx.fillStyle = "#e0c58b";
    ctx.fillRect(x + 14, y + 28, 4, 3);

    // ======================================
    // KEPALA DAN WAJAH
    // ======================================

    // Telinga
    ctx.fillStyle = "#d99465";
    ctx.fillRect(x + 5, y + 6, 4, 5);

    // Wajah
    ctx.fillStyle = "#e9a16e";
    ctx.fillRect(x + 7, y + 3, 17, 12);
    ctx.fillRect(x + 5, y + 6, 21, 6);

    // Bayangan wajah
    ctx.fillStyle = "#b96f4b";
    ctx.fillRect(x + 20, y + 9, 4, 3);

    // Rambut hitam
    ctx.fillStyle = "#151419";
    ctx.fillRect(x + 5, y + 1, 20, 6);
    ctx.fillRect(x + 8, y - 1, 13, 4);
    ctx.fillRect(x + 3, y + 3, 7, 4);
    ctx.fillRect(x + 12, y, 5, 3);
    ctx.fillRect(x + 20, y + 2, 6, 4);

    // Kilau rambut
    ctx.fillStyle = "#393640";
    ctx.fillRect(x + 9, y + 2, 6, 1);
    ctx.fillRect(x + 15, y + 3, 4, 1);

    // Alis tegas
    ctx.fillStyle = "#17151b";
    ctx.fillRect(x + 17, y + 6, 5, 2);

    // Mata
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 19, y + 8, 3, 3);

    // Pupil
    ctx.fillStyle = "#17151b";
    ctx.fillRect(x + 21, y + 8, 1, 3);

    // Hidung
    ctx.fillStyle = "#b96f4b";
    ctx.fillRect(x + 23, y + 9, 2, 2);

    // Mulut
    ctx.fillStyle = "#713e35";
    ctx.fillRect(x + 19, y + 13, 5, 1);

    // ======================================
    // SELESAI MENGGAMBAR BANZE
    // ======================================

    ctx.restore();

    // Nama karakter di atas kepala
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";

    ctx.fillStyle = "#203b2a";
    ctx.fillText(
        "BANZE",
        x + player.width / 2 + 1,
        y - 9
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillText(
        "BANZE",
        x + player.width / 2,
        y - 10
    );
}
   
   
   // ==================================================
   // GAMBAR PETUNJUK DALAM GAME
   // ==================================================
   
   function drawWorldLabel() {
       ctx.fillStyle = "rgba(23, 34, 31, 0.7)";
       ctx.fillRect(15, 15, 190, 35);
   
       ctx.fillStyle = "#f5edcf";
       ctx.font = "bold 13px monospace";
       ctx.textAlign = "left";
       ctx.fillText("WORLD 01: FOREST", 25, 37);
   
       // Bar kemajuan perjalanan
       const progress = player.x / (WORLD_WIDTH - player.width);
   
       ctx.fillStyle = "#263b2f";
       ctx.fillRect(SCREEN_WIDTH - 205, 20, 185, 12);
   
       ctx.fillStyle = "#8bcf69";
       ctx.fillRect(
           SCREEN_WIDTH - 205,
           20,
           185 * progress,
           12
       );
   }
   
   // ==================================================
   // RENDER / MENGGAMBAR SEMUA OBJEK
   // ==================================================
   
   function draw(time) {
       ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
   
       drawBackground();
       drawPlatforms();
       drawCoins(time);
       drawEnemies();
       drawBanze(time);
       drawWorldLabel();
   }
   
   // ==================================================
   // GAME LOOP
   // ==================================================
   
   function gameLoop(time) {
       const delta = lastTime ? time - lastTime : 16.67;
       lastTime = time;
   
       update(delta);
       draw(time);
   
       requestAnimationFrame(gameLoop);
   }
   
   // Gambar layar game sebelum tombol mulai ditekan
   draw(0);
   
   // Jalankan loop animasi
   requestAnimationFrame(gameLoop);
   