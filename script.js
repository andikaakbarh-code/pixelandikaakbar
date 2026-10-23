// ==================================================
// KONTROL KEYBOARD DAN HP
// BANZE PIXEL ADVENTURE
// ==================================================


// ------------------------------------------
// 1. KONTROL KEYBOARD
// ------------------------------------------

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    // Mencegah halaman bergulir saat bermain
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

    // Menyimpan tombol yang sedang ditekan
    keys[key] = true;

    // Melompat menggunakan keyboard
    if (
        gameStarted &&
        !gameOver &&
        (
            key === " " ||
            key === "arrowup" ||
            key === "w"
        ) &&
        player.onGround
    ) {
        player.vy = JUMP_POWER;
        player.onGround = false;
    }

    // Mengulang permainan saat game over
    if (gameOver && key === "enter") {
        resetGame();
    }
});


// Melepaskan tombol keyboard
document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});


// Menghentikan gerakan jika jendela kehilangan fokus
window.addEventListener("blur", function() {
    keys = {};
});


// ------------------------------------------
// 2. FUNGSI KONTROL SENTUH UNTUK HP
// ------------------------------------------

function pasangKontrolSentuh(idTombol, arah) {

    // Mencari tombol berdasarkan ID
    const tombol = document.getElementById(idTombol);

    // Jika tombol tidak ditemukan, tampilkan pesan
    if (!tombol) {
        console.warn(
            "Tombol tidak ditemukan di HTML:",
            idTombol
        );
        return;
    }

    // Mencegah sentuhan mengganggu halaman
    tombol.style.touchAction = "none";
    tombol.style.userSelect = "none";
    tombol.style.webkitUserSelect = "none";

    // Saat tombol disentuh
    tombol.addEventListener("pointerdown", function(event) {

        event.preventDefault();
        event.stopPropagation();

        // Gerak ke kiri
        if (arah === "arrowleft") {
            keys["arrowleft"] = true;
        }

        // Gerak ke kanan
        if (arah === "arrowright") {
            keys["arrowright"] = true;
        }

        // Melompat
        if (
            arah === "jump" &&
            gameStarted &&
            !gameOver &&
            player.onGround
        ) {
            player.vy = JUMP_POWER;
            player.onGround = false;
        }

        // Menjaga tombol tetap terdeteksi saat disentuh
        if (tombol.setPointerCapture) {
            tombol.setPointerCapture(event.pointerId);
        }
    });


    // Saat sentuhan dilepaskan
    function lepaskanTombol(event) {

        event.preventDefault();

        if (arah === "arrowleft") {
            keys["arrowleft"] = false;
        }

        if (arah === "arrowright") {
            keys["arrowright"] = false;
        }
    }

    tombol.addEventListener("pointerup", lepaskanTombol);

    tombol.addEventListener(
        "pointercancel",
        lepaskanTombol
    );

    // Menghentikan gerakan ketika sentuhan terputus
    tombol.addEventListener(
        "lostpointercapture",
        function() {

            if (arah === "arrowleft") {
                keys["arrowleft"] = false;
            }

            if (arah === "arrowright") {
                keys["arrowright"] = false;
            }
        }
    );
}


// ------------------------------------------
// 3. MEMASANG TOMBOL KONTROL
// ------------------------------------------

// Tombol kiri
pasangKontrolSentuh("leftButton", "arrowleft");

// Tombol kanan
pasangKontrolSentuh("rightButton", "arrowright");

// Tombol lompat
pasangKontrolSentuh("jumpButton", "jump");