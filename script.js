/* =====================================================================
   Y2K PORTFOLIO - script.js
   Everything the page DOES lives here. Sections, in order:
     1. SITE SETTINGS   <- the part you'll edit most (email, skills, projects, game, pixel girl)
     2. Small helpers
     3. Boot screen
     4. Windows (drag, minimize, close) and the taskbar
     5. Start menu, clock, light/dark mode, shut down
     6. CRT screensaver
     7. Skills bars
     8. Projects explorer
     9. Contact form
    10. Sparkle cursor trail
    11. Trophies and Game mode (pixel runner)
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. SITE SETTINGS - change these to make the site yours
   --------------------------------------------------------------------- */
const SITE = {
  // Where contact messages go. Also change the "To:" text in index.html.
  email: "saraiojeda005@gmail.com",

  // Text bouncing around on the CRT screensaver.
  screensaverText: "sarai.exe",

  // Each skill is just a name. Clicking "Install" fills its loading bar to 100%.
   // Each skill: [name, level from 0 to 100]
  skills: [
    ["AWS", 75],
    ["Figma", 85],
    ["Docker", 65],
    ["Blender", 75],
    ["Python", 80],
    ["JavaScript", 90],
    [ "Java", 80],
    ["Flutter", 75],
    ["C/C++", 70],
    ["React", 80],
  ],

  // Each project shows up as a file in the projects window.
  //   type must be one of: "web", "design", "app" (matches the filter buttons)
  //   icon must be one of: "crt", "folder", "cd", "floppy", "modem"
  //   image is the thumbnail (optional, hidden if it can't load)
  //   links is a list of [button label, web address]
  projects: [
    {
      name: "RUMBL", type: "web", icon: "crt",
      description: "Frontend web application similar to Tinder but for recipes.",
      image: "https://www.sarai-ojeda.com/image/rumbl_thumbnail.png",
      links: [["GitHub", "https://github.com/scnora/RUMBL"]],
    },
    {
      name: "Psychora", type: "design", icon: "cd",
      description: "UI for a mental health app.",
      image: "https://www.sarai-ojeda.com/image/Psychora.jpg",
      links: [["Figma", "https://www.figma.com/design/BeZ1zN7yrnEJZU3WtIyo4F/Psychora?node-id=1-98&t=LzVNxz4QsFxlHpzA-1"]],
    },
    {
      name: "Namer App", type: "app", icon: "modem",
      description: "A Flutter app that generates random names for users.",
      image: "https://www.sarai-ojeda.com/image/namer_thumbnail.png",
      links: [["GitHub", "https://github.com/scnora/Namer-App"]],
    },
  ],

  // Game mode rules (the runner works a lot like the Chrome dino game)
  game: {
    startSpeed: 5,    // how fast the world scrolls at the start
    maxSpeed: 11,     // the fastest it ever gets
    speedUp: 0.002,   // how quickly it speeds up (bigger = faster ramp)
    gravity: 0.7,     // how fast she falls after jumping
    jumpPower: 13,    // how high she jumps (bigger = higher)
    coinPoints: 10,   // points per coin (distance run also adds points)
  },

  // Colors for the pixel girl. Change these until she looks like you!
  girl: {
    hair: "#4A2B1A",   // curly hair
    skin: "#C68642",
    shirt: "#FF3EA5",
    pants: "#4B2FFF",
    shoes: "#FFFFFF",
  },

  // Trophies: the player unlocks each fact by reaching this score in the runner.
  // Each trophy: [score needed, text revealed]
  trophies: [
    [50,  "I'm currently working on a Space Platform game!."],
    [150, "I play the saxophone for the Rutgers Marching Band"],
    [300, "I have two dogs, both are yorkies!"],
  ],
};


/* ---------------------------------------------------------------------
   2. SMALL HELPERS
   --------------------------------------------------------------------- */
// $("#id") finds one element, $$(".class") finds all of them as an array.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// True if the visitor asked their device for less motion.
// We use this to turn off animations like the bouncing screensaver.
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keeps track of which window is on top (higher number = in front).
let topWindowLayer = 10;


/* ---------------------------------------------------------------------
   3. BOOT SCREEN - the fake BIOS that plays when the page opens
   --------------------------------------------------------------------- */
function runBootScreen() {
  if (prefersReducedMotion) return; // skip the intro for these visitors

  const bootScreen = $("#boot");
  const progressBar = $("#pbi");
  let percent = 0;

  bootScreen.classList.add("on"); // show it

  // Hide the boot screen and clean up everything we set up.
  function finish() {
    clearInterval(timer);
    bootScreen.classList.remove("on");
    removeEventListener("keydown", finish);
    bootScreen.removeEventListener("pointerdown", finish);
  }

  // Fill the loading bar a little every 110 ms, then finish.
  const timer = setInterval(() => {
    percent += 8;
    progressBar.style.width = Math.min(percent, 100) + "%";
    if (percent >= 120) finish();
  }, 110);

  // Any key press or click skips the intro.
  addEventListener("keydown", finish);
  bootScreen.addEventListener("pointerdown", finish);
}
runBootScreen();


/* ---------------------------------------------------------------------
   4. WINDOWS - drag by title bar, minimize (_), close (x)
   --------------------------------------------------------------------- */
// The taskbar buttons look "pressed" while their window is open.
function updateTaskbarButtons() {
  $$("[data-t]").forEach((button) => {
    const windowIsOpen = !$("#" + button.dataset.t).hidden;
    button.setAttribute("aria-pressed", String(windowIsOpen));
  });
}

// Open a window by id (e.g. "about"), bring it to the front, and scroll to it.
function openWindow(id) {
  const win = $("#" + id);
  win.hidden = false;
  win.classList.remove("min");
  win.style.zIndex = ++topWindowLayer;
  updateTaskbarButtons();
  win.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  closeStartMenu();
}

// Set up dragging and the _ / x buttons on every window.
$$(".win").forEach((win) => {
  const titleBar = win.querySelector(".tb");
  let isDragging = false;
  let startX, startY;           // where the pointer was when dragging began
  let offsetX = 0, offsetY = 0; // how far this window has been moved

  // Clicking anywhere on a window brings it to the front.
  win.addEventListener("pointerdown", () => {
    win.style.zIndex = ++topWindowLayer;
  });

  // Start dragging (but not when clicking the _ / x buttons, and not on phones).
  titleBar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || innerWidth <= 820) return;
    isDragging = true;
    titleBar.setPointerCapture(event.pointerId);
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;
  });

  // Move the window while dragging.
  titleBar.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
    win.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  titleBar.addEventListener("pointerup", () => (isDragging = false));

  // The _ button collapses the window, the x button hides it.
  win.querySelectorAll("[data-act]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.act === "min") {
        win.classList.toggle("min");
      } else {
        win.hidden = true;
        updateTaskbarButtons();
      }
    });
  });
});

// Any button with data-go="windowId" opens that window (taskbar, menu, hero buttons).
$$("[data-go]").forEach((button) => {
  button.addEventListener("click", () => openWindow(button.dataset.go));
});

updateTaskbarButtons();


/* ---------------------------------------------------------------------
   5. START MENU, CLOCK, LIGHT/DARK MODE, SHUT DOWN
   --------------------------------------------------------------------- */
function closeStartMenu() {
  $("#menu").hidden = true;
  $("#start").setAttribute("aria-expanded", "false");
}

$("#start").addEventListener("click", () => {
  const menu = $("#menu");
  menu.hidden = !menu.hidden;
  $("#start").setAttribute("aria-expanded", String(!menu.hidden));
});

// Esc closes the start menu.
addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeStartMenu();
});

// Taskbar clock, refreshed every 30 seconds.
function updateClock() {
  $("#clock").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 30000);

// Light/dark: if the visitor picked a mode we use it, otherwise we follow their device.
function isDarkMode() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen) return chosen === "dark";
  return matchMedia("(prefers-color-scheme: dark)").matches;
}
$("#mode").addEventListener("click", () => {
  document.documentElement.dataset.theme = isDarkMode() ? "light" : "dark";
  closeStartMenu();
});

// "Shut down" shows a black screen; "Restart" brings the site back.
$("#shut").addEventListener("click", () => {
  closeStartMenu();
  $("#off").classList.add("on");
  $("#restart").focus();
});
$("#restart").addEventListener("click", () => $("#off").classList.remove("on"));


/* ---------------------------------------------------------------------
   6. CRT SCREENSAVER - text bounces around and changes color on each bounce.
      Click the screen to add more bouncers (up to 6, then it resets).
   --------------------------------------------------------------------- */
const saverCanvas = $("#saver");
const saverCtx = saverCanvas.getContext("2d");
let bouncers = [{ x: 20, y: 30, dx: 1.5, dy: 1.1, hue: 300 }]; // dx/dy = speed per frame

function drawScreensaver() {
  // Paint the dark background.
  saverCtx.fillStyle = "#050514";
  saverCtx.fillRect(0, 0, saverCanvas.width, saverCanvas.height);
  saverCtx.font = "16px Silkscreen, monospace";
  saverCtx.textBaseline = "top";
  const textWidth = saverCtx.measureText(SITE.screensaverText).width;

  bouncers.forEach((b) => {
    if (!prefersReducedMotion) {
      b.x += b.dx;
      b.y += b.dy;
    }
    // Bounce off the left/right edges, then the top/bottom edges.
    if (b.x < 0 || b.x + textWidth > saverCanvas.width) {
      b.dx *= -1;
      b.hue += 47;
      b.x = Math.max(0, Math.min(saverCanvas.width - textWidth, b.x));
    }
    if (b.y < 0 || b.y + 16 > saverCanvas.height) {
      b.dy *= -1;
      b.hue += 47;
      b.y = Math.max(0, Math.min(saverCanvas.height - 16, b.y));
    }
    saverCtx.fillStyle = `hsl(${b.hue % 360}, 100%, 65%)`;
    saverCtx.fillText(SITE.screensaverText, b.x, b.y);
  });

  // Keep animating unless the visitor prefers reduced motion.
  if (!prefersReducedMotion) requestAnimationFrame(drawScreensaver);
}
drawScreensaver();

saverCanvas.addEventListener("click", () => {
  if (bouncers.length >= 6) {
    bouncers = bouncers.slice(0, 1); // too many: start over with one
  } else {
    const randomDirection = () => (Math.random() < 0.5 ? -1 : 1);
    bouncers.push({
      x: Math.random() * 80,
      y: Math.random() * 120,
      dx: (Math.random() + 0.8) * randomDirection(),
      dy: (Math.random() + 0.6) * randomDirection(),
      hue: Math.random() * 360,
    });
  }
  if (prefersReducedMotion) drawScreensaver(); // no animation loop, so redraw once
});


/* ---------------------------------------------------------------------
   7. SKILLS - click "Install" and the loading bar fills up
   --------------------------------------------------------------------- */

$("#skills").innerHTML = SITE.skills
  .map(([label, level], index) => `
    <div class="sk">
      <button class="bv" data-i="${index}" aria-label="Download ${label}">Download ${label}</button>
      <div class="bar inset"><i id="b${index}"></i></div>
      <span class="pct" id="p${index}">0%</span>
    </div>`)
  .join("");

$$("#skills button").forEach((button) => {

  button.addEventListener("click", () => {
    const index = button.dataset.i;
    const level = SITE.skills[index][1];
    const fill = $("#b" + index);
    const percentText = $("#p" + index);

    // Reset, then let the bar fill up to this skill's level.
    fill.style.width = "0";
    requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = level + "%")));

    // Count the number up alongside the bar.
    clearInterval(button.counter);
    let shown = 0;
    percentText.textContent = "0%";
    button.counter = setInterval(() => {
      shown = Math.min(level, shown + 3);
      percentText.textContent = shown + "%";
      if (shown >= level) clearInterval(button.counter);
    }, 40);
  });
});

/* ---------------------------------------------------------------------
   8. PROJECTS - file explorer with filter buttons and a preview panel
   --------------------------------------------------------------------- */
const fileList = $("#files");
const previewPanel = $("#prev");
let selectedProject = null;

// Draw the files that match the filter ("all", "web", "design", or "art").
function renderProjects(filter) {
  const visible = SITE.projects.filter((p) => filter === "all" || p.type === filter);

  fileList.innerHTML = visible
    .map((p) => `
      <button class="tile" aria-pressed="${selectedProject === p.name}" data-name="${p.name}">
        <svg><use href="#i-${p.icon}"/></svg>${p.name}
      </button>`)
    .join("");
  $("#count").textContent = visible.length + " object(s)";

  // Clicking a file selects it and shows its details in the preview panel.
  $$(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      selectedProject = tile.dataset.name;
      const project = SITE.projects.find((p) => p.name === selectedProject);
      $$(".tile").forEach((t) => t.setAttribute("aria-pressed", String(t === tile)));
      // Thumbnail (removed automatically if the image can't load), tag, text, and link buttons.
      const linkButtons = project.links
        .map(([label, url]) => `<a class="btn bv plain" href="${url}" target="_blank" rel="noopener">${label}</a>`)
        .join(" ");
      previewPanel.innerHTML = `
        <img class="thumb" src="${project.image}" alt="" onerror="this.remove()">
        <h3>${project.name}</h3>
        <span class="tag">${project.type}</span>
        <p>${project.description}</p>
        <div class="row">${linkButtons}</div>`;
    });
  });
}

previewPanel.innerHTML = "<p>Click a file to see what's inside.</p>";
renderProjects("all");

// Filter buttons (All / Design / Web / Art).
$$("[data-f]").forEach((button) => {
  button.addEventListener("click", () => {
    $$("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    renderProjects(button.dataset.f);
  });
});


/* ---------------------------------------------------------------------
   9. CONTACT FORM
   --------------------------------------------------------------------- */
const toast = $("#toast"); // the small status message next to the buttons

function showToast(message) {
  toast.textContent = message;
  setTimeout(() => (toast.textContent = ""), 2500);
}

// "Copy my email" button.
$("#copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(SITE.email);
    showToast("Email copied");
  } catch (error) {
    showToast(SITE.email); // copying was blocked, so just show the address
  }
});




/* ---------------------------------------------------------------------
   10. SPARKLE CURSOR TRAIL - little stars follow the mouse (mouse only)
   --------------------------------------------------------------------- */
if (!prefersReducedMotion && matchMedia("(pointer: fine)").matches) {
  const sparkleColors = ["#FF3EA5", "#B6FF3B", "#3EA8FF", "#FFD84D"];
  let lastSparkleTime = 0;

  addEventListener("pointermove", (event) => {
    // At most one sparkle every 70 ms so the page stays smooth.
    const now = performance.now();
    if (now - lastSparkleTime < 70) return;
    lastSparkleTime = now;

    const sparkle = document.createElement("span");
    sparkle.className = "spark";
    sparkle.textContent = "✦";
    sparkle.style.left = event.clientX + 6 + "px";
    sparkle.style.top = event.clientY + 6 + "px";
    sparkle.style.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700); // matches the CSS animation length
  });
}


/* ---------------------------------------------------------------------
   11. TROPHIES + GAME MODE (pixel runner, like the Chrome dino game)
   How it works:
     - Press Space / Up arrow, or tap the screen, to jump.
     - Jump over the old-school tech (monitors, PC towers, floppy stacks).
     - Grab coins. Score = distance run + points for each coin.
     - Hit an obstacle and the round ends; the best score unlocks trophies.
   --------------------------------------------------------------------- */

/* --- Best score is saved in the visitor's browser (localStorage) --- */
function getBestScore() {
  try {
    return Number(localStorage.getItem("yn-best")) || 0;
  } catch (error) {
    return 0; // storage can be blocked; the game still works
  }
}
function saveBestScore(score) {
  try {
    localStorage.setItem("yn-best", score);
  } catch (error) {
    /* ignore */
  }
}

/* --- Trophies list in the "right_now.exe" window --- */
function renderTrophies() {
  const best = getBestScore();
  $("#gBest").textContent = best;
  $("#trophies").innerHTML = SITE.trophies
    .map(([needed, text]) =>
      best >= needed ? `<li>${text}</li>` : `<li class="lock">Locked: score ${needed} to unlock</li>`)
    .join("");
}
renderTrophies();

/* --- Game size and handy numbers --- */
const canvas = $("#gameCanvas");
const ctx = canvas.getContext("2d");
const WORLD_W = 800;        // the canvas is 800 x 300 "game pixels"
const GROUND_Y = 250;       // y position of the ground line
const PIXEL = 4;            // each pixel-art square is 4 x 4 game pixels
const GIRL_X = 70;          // she stays at this x; the world scrolls past her
const GIRL_W = 12 * PIXEL;  // sprite is 12 squares wide...
const GIRL_H = 16 * PIXEL;  // ...and 16 squares tall
const SPEED_SCALE = prefersReducedMotion ? 0.6 : 1; // calmer pace for reduced motion

/* --- PIXEL ART: the girl ---
   Each string is one row of squares. Letters are colors:
   H = hair, S = skin, E = eyes, T = shirt, P = pants, B = shoes, "." = empty.
   Edit the letters to redraw her! (Every row must stay 12 characters wide.) */
const GIRL_TOP = [
  "..H.HH.HH.H.",   // curly hair, top bumps
  ".HHHHHHHHHH.",
  "HHHHHHHHHHHH",
  "HHHSSSSSSHHH",
  "HHSSESSESSHH",   // eyes
  "HHSSSSSSSSHH",
  ".HHSSSSSSHH.",
  "..HH.SS.HH..",   // curls on the sides, neck
  "...TTTTTT...",   // shirt
  "..STTTTTTS..",   // arms
  "..STTTTTTS..",
  "...TTTTTT...",
  "...PPPPPP...",   // pants
];
// Three leg poses: two for running (swapped back and forth) and one for jumping.
const GIRL_LEGS = {
  runA: ["...PP..PP...", "...PP..PP...", "..BBB..BBB.."],
  runB: ["....PPPP....", "....PPPP....", "...BBBBBB..."],
  jump: ["..PPP..PPP..", "..PP....PP..", "..BB....BB.."],
};

/* --- Obstacles: old-school tech. w/h are their size in game pixels. --- */
const OBSTACLE_TYPES = [
  { type: "monitor",  w: 44, h: 44 },
  { type: "tower",    w: 28, h: 58 },
  { type: "floppies", w: 32, h: 26 },
];
const COIN_SIZE = 16;

/* --- Game state --- */
const gameScreen = $("#game");   // the full-screen overlay
const arena = $("#arena");       // holds the canvas and the start/results box
const gamePanel = $("#gp");      // the start / results box
let world = null;                // everything that changes while you play
let isPlaying = false;
let animationId = 0;
let lastFrameTime = 0;

// Start a fresh world: girl on the ground, nothing on screen yet.
function resetWorld() {
  world = {
    speed: SITE.game.startSpeed * SPEED_SCALE,
    distance: 0,
    coins: 0,
    frame: 0,
    girl: { y: GROUND_Y - GIRL_H, vy: 0, onGround: true },
    obstacles: [],
    coinItems: [],
    untilNextObstacle: 400, // distance (in px) before the first obstacle appears
  };
  updateHud();
}

const currentScore = () => Math.floor(world.distance / 40) + world.coins * SITE.game.coinPoints;

function updateHud() {
  $("#gScore").textContent = currentScore();
  $("#gCoins").textContent = world.coins;
}

/* --- Showing the start / game over box --- */
function showPanel(title, htmlBody, buttonLabel) {
  gamePanel.hidden = false;
  gamePanel.innerHTML = `<h2>${title}</h2>${htmlBody}<button class="btn bv hot" id="go">${buttonLabel}</button>`;
  $("#go").addEventListener("click", startRound);
  // Small delay so a jump key you're still holding can't instantly restart the game.
  setTimeout(() => $("#go") && $("#go").focus(), 500);
}

function openGame() {
  gameScreen.hidden = false;
  closeStartMenu();
  document.body.style.overflow = "hidden"; // stop the page scrolling behind the game
  resetWorld();
  drawWorld();
  showPanel(
    "Pixel run",
    `<p>Jump over the old-school tech and grab the coins.</p>
     <p>Press Space or the Up arrow, or tap the screen, to jump.</p>`,
    "Start game"
  );
}

function closeGame() {
  stopRound();
  gameScreen.hidden = true;
  document.body.style.overflow = "";
  $("#gameBtn").focus();
}

function stopRound() {
  isPlaying = false;
  cancelAnimationFrame(animationId);
}

function startRound() {
  stopRound();
  resetWorld();
  isPlaying = true;
  gamePanel.hidden = true;
  lastFrameTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

/* --- Jumping --- */
function jump() {
  if (!isPlaying) return;
  const girl = world.girl;
  if (girl.onGround) {
    girl.vy = -SITE.game.jumpPower;
    girl.onGround = false;
  }
}
addEventListener("keydown", (event) => {
  if (gameScreen.hidden || !isPlaying) return;
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault(); // stop Space from scrolling the page
    jump();
  }
});
arena.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("button")) jump();
});

/* --- One step of the game. dt = how many 60fps frames passed (keeps speed steady). --- */
function gameLoop(now) {
  if (!isPlaying) return;
  const dt = Math.min(2, (now - lastFrameTime) / 16.67);
  lastFrameTime = now;

  updateWorld(dt);
  drawWorld();
  if (isPlaying) animationId = requestAnimationFrame(gameLoop);
}

function updateWorld(dt) {
  const { gravity, maxSpeed, speedUp } = SITE.game;
  const girl = world.girl;
  world.frame += dt;
  world.speed = Math.min(maxSpeed * SPEED_SCALE, world.speed + speedUp * dt);
  world.distance += world.speed * dt;

  // Gravity and landing.
  if (!girl.onGround) {
    girl.vy += gravity * dt;
    girl.y += girl.vy * dt;
    if (girl.y >= GROUND_Y - GIRL_H) {
      girl.y = GROUND_Y - GIRL_H;
      girl.vy = 0;
      girl.onGround = true;
    }
  }

  // Time for a new obstacle? (The gap grows with speed so it's always jumpable.)
  world.untilNextObstacle -= world.speed * dt;
  if (world.untilNextObstacle <= 0) {
    spawnObstacle();
    world.untilNextObstacle = world.speed * 38 + 160 + Math.random() * 260;
  }

  // Scroll everything left.
  world.obstacles.forEach((o) => (o.x -= world.speed * dt));
  world.coinItems.forEach((c) => (c.x -= world.speed * dt));
  world.obstacles = world.obstacles.filter((o) => o.x + o.w > -20);
  world.coinItems = world.coinItems.filter((c) => c.x + COIN_SIZE > -20);

  // Collect coins the girl touches.
  const girlBox = { x: GIRL_X + 8, y: girl.y + 6, w: GIRL_W - 16, h: GIRL_H - 8 }; // a bit smaller than the sprite = fairer
  world.coinItems = world.coinItems.filter((c) => {
    const touched = overlaps(girlBox, { x: c.x, y: c.y, w: COIN_SIZE, h: COIN_SIZE });
    if (touched) world.coins++;
    return !touched;
  });

  // Hit an obstacle? Game over.
  const hit = world.obstacles.some((o) => overlaps(girlBox, { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 4 }));
  updateHud();
  if (hit) endRound();
}

// True if two boxes {x, y, w, h} overlap.
function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Add one random obstacle at the right edge, and often a row of coins above it.
function spawnObstacle() {
  const kind = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  const x = WORLD_W + 20;
  world.obstacles.push({ ...kind, x, y: GROUND_Y - kind.h });

  if (Math.random() < 0.7) {
    // Three coins in an arc over the obstacle: grab them while you jump.
    const middle = x + kind.w / 2 - COIN_SIZE / 2;
    world.coinItems.push({ x: middle - 32, y: GROUND_Y - 105 });
    world.coinItems.push({ x: middle,      y: GROUND_Y - 122 });
    world.coinItems.push({ x: middle + 32, y: GROUND_Y - 105 });
  }
}

/* --- DRAWING --- */
function drawWorld() {
  // Dark Y2K background with a sliding grid so you can feel the speed.
  ctx.fillStyle = "#050514";
  ctx.fillRect(0, 0, WORLD_W, 300);
  ctx.strokeStyle = "rgba(62, 168, 255, 0.22)";
  ctx.lineWidth = 1;
  const slide = world.distance % 40;
  for (let x = -slide; x < WORLD_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_Y); ctx.stroke();
  }
  for (let y = 50; y < GROUND_Y; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
  }

  // Ground line plus little dashes that scroll by.
  ctx.fillStyle = "#B6FF3B";
  ctx.fillRect(0, GROUND_Y, WORLD_W, 3);
  ctx.fillStyle = "#FF3EA5";
  const dashSlide = world.distance % 60;
  for (let x = -dashSlide; x < WORLD_W; x += 60) ctx.fillRect(x, GROUND_Y + 14, 24, 3);

  world.coinItems.forEach(drawCoin);
  world.obstacles.forEach(drawObstacle);
  drawGirl();
}

function drawSprite(rows, x, y, colors) {
  rows.forEach((row, r) => {
    [...row].forEach((letter, c) => {
      if (letter === ".") return;
      ctx.fillStyle = colors[letter];
      ctx.fillRect(Math.round(x + c * PIXEL), Math.round(y + r * PIXEL), PIXEL, PIXEL);
    });
  });
}

function drawGirl() {
  const girl = world.girl;
  const colors = {
    H: SITE.girl.hair, S: SITE.girl.skin, E: "#0B0B25",
    T: SITE.girl.shirt, P: SITE.girl.pants, B: SITE.girl.shoes,
  };
  // Pick the leg pose: jumping, or alternate the two running poses every 8 frames.
  const legs = !girl.onGround ? GIRL_LEGS.jump : Math.floor(world.frame / 8) % 2 ? GIRL_LEGS.runA : GIRL_LEGS.runB;
  drawSprite([...GIRL_TOP, ...legs], GIRL_X, girl.y, colors);
}

function drawCoin(coin) {
  // The coin "spins" by getting narrower and wider.
  const width = 4 + 12 * Math.abs(Math.cos(world.frame / 10));
  const x = coin.x + (COIN_SIZE - width) / 2;
  ctx.fillStyle = "#0B0B25";
  ctx.fillRect(x - 2, coin.y - 2, width + 4, COIN_SIZE + 4);
  ctx.fillStyle = "#FFD84D";
  ctx.fillRect(x, coin.y, width, COIN_SIZE);
  ctx.fillStyle = "#FFF3A0";
  ctx.fillRect(x + width / 4, coin.y + 3, Math.max(2, width / 4), COIN_SIZE - 6);
}

function drawObstacle(o) {
  const dark = "#0B0B25";
  if (o.type === "monitor") {
    ctx.fillStyle = dark;            ctx.fillRect(o.x, o.y, o.w, o.h - 6);
    ctx.fillStyle = "#E8E4F4";       ctx.fillRect(o.x + 3, o.y + 3, o.w - 6, o.h - 12);
    ctx.fillStyle = "#3EA8FF";       ctx.fillRect(o.x + 7, o.y + 7, o.w - 14, o.h - 20);
    ctx.fillStyle = dark;            ctx.fillRect(o.x + o.w / 2 - 6, o.y + o.h - 6, 12, 3);
    ctx.fillRect(o.x + o.w / 2 - 14, o.y + o.h - 3, 28, 3);
  } else if (o.type === "tower") {
    ctx.fillStyle = dark;            ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = "#D8D2EC";       ctx.fillRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
    ctx.fillStyle = dark;            ctx.fillRect(o.x + 6, o.y + 10, o.w - 12, 4);
    ctx.fillRect(o.x + 6, o.y + 20, o.w - 12, 4);
    ctx.fillStyle = "#B6FF3B";       ctx.fillRect(o.x + 7, o.y + o.h - 14, 5, 5);
  } else {
    // two stacked floppy disks
    [0, 13].forEach((offset) => {
      ctx.fillStyle = dark;          ctx.fillRect(o.x, o.y + offset, o.w, 13);
      ctx.fillStyle = "#3EA8FF";     ctx.fillRect(o.x + 2, o.y + offset + 2, o.w - 4, 9);
      ctx.fillStyle = "#FFFFFF";     ctx.fillRect(o.x + 8, o.y + offset + 5, o.w - 16, 6);
    });
  }
}

/* --- Game over: save the best score and show unlocked trophies --- */
function endRound() {
  stopRound();
  const score = currentScore();
  if (score > getBestScore()) saveBestScore(score);
  renderTrophies();

  const best = getBestScore();
  const unlocked = SITE.trophies.filter(([needed]) => best >= needed);
  const unlockedList = unlocked.length
    ? unlocked.map(([, text]) => `<li>${text}</li>`).join("")
    : `<li>Nothing yet. Score ${SITE.trophies[0][0]} to unlock a fun fact.</li>`;

  showPanel(
    "Game over",
    `<p>You scored <b>${score}</b> with <b>${world.coins}</b> coins. Best: <b>${best}</b>.</p>
     <p>Unlocked:</p><ul>${unlockedList}</ul>`,
    "Run again"
  );
}

/* --- Buttons that open / close game mode --- */
["gameBtn", "gameBtn2", "gameMenu"].forEach((id) => $("#" + id).addEventListener("click", openGame));
$("#gx").addEventListener("click", closeGame);
addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !gameScreen.hidden) closeGame();
});


/* ---------------------------------------------------------------------
   12. API call for quotes 
   --------------------------------------------------------------------- */
// fetch("https://api.api-ninjas.com/v2/quotes?categories=success,wisdom", {
//   headers: { 'X-Api-Key': uJsLZwFnQr43MYLeNkrlO46QQtLSvatrJYGs3HIv },
// });



  /* ---------------------------------------------------------------------
   12. QUOTE OF THE DAY
   --------------------------------------------------------------------- */
function showQuote(text, author) {
  $("#quoteText").textContent = text; // textContent is safe even if the API sends odd characters
  $("#quoteAuthor").textContent = author ? "- " + author : "";
}

// YOUR EXISTING FETCH CALL GOES HERE. It should return { text, author }.
// async function fetchQuote() {
//   const response = await fetch("https://api.api-ninjas.com/v2/quotes?categories=success,wisdom", {
//     headers: { "X-Api-Key": uJsLZwFnQr43MYLeNkrlO46QQtLSvatrJYGs3HIv },
//   });
//   if (!response.ok) throw new Error("Quote request failed: " + response.status);

//   const data = await response.json();
//   console.log(data); // check this in the console (F12) to see what the API sent back

//   const quote = Array.isArray(data) ? data[0] : data; // the API returns a list, so take the first item
//   return { text: quote.quote, author: quote.author };
// }

async function fetchQuote() {
  const response = await fetch("https://api.api-ninjas.com/v2/quoteoftheday", {
    headers: { "X-Api-Key": QUOTE_API_KEY },
  });
  if (!response.ok) throw new Error("API says " + response.status);

  const data = await response.json();
  const quote = Array.isArray(data) ? data[0] : data; // handles a list or a single object
  return { text: quote.quote, author: quote.author };
}


async function loadQuote() {
  const today = new Date().toDateString();

  // Reuse today's quote if we already have it, so reloads don't spend API calls.
  try {
    const saved = JSON.parse(localStorage.getItem("yn-quote"));
    if (saved && saved.day === today) return showQuote(saved.text, saved.author);
  } catch (error) {
    /* no saved quote, carry on */
  }

  try {
    const quote = await fetchQuote();
    showQuote(quote.text, quote.author);
    try {
      localStorage.setItem("yn-quote", JSON.stringify({ day: today, ...quote }));
    } catch (error) {
      /* storage blocked, fine */
    }
  } catch (error) {
    showQuote("Today is a good day to build something.", ""); // shown if the API is down
  }
}
loadQuote();




// // Contact Form interaction 

const FORM_ENDPOINT = "https://formspree.io/f/xzeebldp"; // my persoanl Formspree

$("#send").addEventListener("click", async () => {
  const name = $("#n").value.trim();
  const email = $("#e").value.trim();
  const message = $("#m").value.trim();

  if (!name || !email || !message) {
    showToast("Add your name, email, and message first");
    return;
  }

  const sendButton = $("#send");
  sendButton.disabled = true;
  showToast("Sending...");

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    if (!response.ok) throw new Error("Send failed: " + response.status);

    $("#n").value = $("#e").value = $("#m").value = ""; // clear the form
    showToast("Message sent! Thank you.");
  } catch (error) {
    console.error("Contact form failed:", error);
    showToast("Couldn't send. Please try again.");
  } finally {
    sendButton.disabled = false;
  }
});