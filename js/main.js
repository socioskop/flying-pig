import { Pig }             from './Pig.js';
import { Coin }            from './Coin.js';
import { Toilet }          from './Toilet.js';
import { MovingPlatform }  from './MovingPlatform.js';
import { Lava }            from './Lava.js';
import { CrumblingPlank }  from './CrumblingPlank.js';
import { River }           from './River.js';
import { Knife }           from './Knife.js';
import { MeatGrinder }     from './MeatGrinder.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const keys   = {};

// ─── Game State ──────────────────────────────────────────────────────────────
let currentLevel      = 1;
let isGameOver        = false;

let pigSwallowed      = false;
let swallowProgress   = 0;

let pigBurning        = false;
let burnTimer         = 0;

let pigDrowning       = false;
let drownTimer        = 0;

let pigChopped        = false;
let chopTimer         = 0;

// ─── The Pig (persists across levels) ────────────────────────────────────────
const pig = new Pig(80, 400);

// ─── Level Builders ──────────────────────────────────────────────────────────

function buildLevel1() {
    return {
        platforms: [
            { x: 0,   y: 460, w: 900, h: 40, color: "#5a3e1b" },
            { x: 150, y: 370, w: 120, h: 18, color: "#7a5c2e" },
            { x: 340, y: 300, w: 100, h: 18, color: "#7a5c2e" },
            { x: 500, y: 230, w: 130, h: 18, color: "#7a5c2e" },
            { x: 680, y: 310, w: 110, h: 18, color: "#7a5c2e" },
            { x: 60,  y: 250, w: 90,  h: 18, color: "#7a5c2e" },
        ],
        movingPlatforms:  [],
        crumblingPlanks:  [],
        coins: [
            new Coin(200, 345), new Coin(385, 275), new Coin(560, 205),
            new Coin(725, 285), new Coin(100, 225), new Coin(450, 435),
            new Coin(650, 435), new Coin(300, 435),
        ],
        toilet:  new Toilet(820, 402),
        lava:    null,
        river:   null,
        knives:  [],
        grinder: null,
        bgTop:    "#87ceeb", bgBottom: "#d4f1a0",
        spawnX: 80, spawnY: 400,
    };
}

function buildLevel2() {
    return {
        platforms: [
            { x: 0,   y: 200, w: 130, h: 18, color: "#7a5c2e" },
            { x: 750, y: 200, w: 130, h: 18, color: "#7a5c2e" },
        ],
        movingPlatforms: [
            new MovingPlatform(180, 320, 100, 18, "x", 180, 420, 2.5),
            new MovingPlatform(350, 250, 90,  18, "x", 350, 580, 3),
            new MovingPlatform(480, 350, 80,  18, "y", 280, 380, 2),
            new MovingPlatform(600, 300, 110, 18, "x", 550, 750, 2),
            new MovingPlatform(280, 160, 80,  18, "x", 200, 480, 3.5),
        ],
        crumblingPlanks: [],
        coins: [
            new Coin(230, 295), new Coin(390, 225), new Coin(520, 325),
            new Coin(650, 275), new Coin(320, 135),
        ],
        toilet:  new Toilet(790, 142),
        lava:    new Lava(canvas.width, canvas.height),
        river:   null,
        knives:  [],
        grinder: null,
        bgTop:    "#1a0500", bgBottom: "#3d0c00",
        spawnX: 30, spawnY: 160,
    };
}

function buildLevel3() {
    // A bridge of crumbling planks across a river.
    const bridgeY  = 340;
    const plankW   = 70;
    const gap      = 20;
    const startX   = 160;
    const planks   = [];
    const coinList = [];

    for (let i = 0; i < 9; i++) {
        const px = startX + i * (plankW + gap);
        planks.push(new CrumblingPlank(px, bridgeY, plankW));
        if (i % 2 === 0) coinList.push(new Coin(px + plankW / 2, bridgeY - 30));
    }

    return {
        platforms: [
            { x: 0,   y: 320, w: 160, h: 180, color: "#556b2f" },
            { x: 780, y: 320, w: 120, h: 180, color: "#556b2f" },
        ],
        movingPlatforms:  [],
        crumblingPlanks:  planks,
        coins:            coinList,
        toilet:  new Toilet(800, 262),
        lava:    null,
        river:   new River(canvas.width, canvas.height),
        grinder: null,
        knives:  [],
        bgTop:    "#4a7fa5", bgBottom: "#2a5f80",
        spawnX: 30, spawnY: 270,
    };
}

function buildLevel4() {
    // Butcher's gauntlet — platforms at varying heights, guillotine knives
    // chopping down, meat grinder at the bottom
    return {
        platforms: [
            { x: 0,   y: 380, w: 110, h: 120, color: "#4a3520" }, // safe start
            { x: 160, y: 300, w: 80,  h: 18,  color: "#4a3520" },
            { x: 300, y: 350, w: 80,  h: 18,  color: "#4a3520" },
            { x: 440, y: 260, w: 80,  h: 18,  color: "#4a3520" },
            { x: 580, y: 320, w: 80,  h: 18,  color: "#4a3520" },
            { x: 720, y: 270, w: 80,  h: 18,  color: "#4a3520" },
            { x: 820, y: 340, w: 80,  h: 160, color: "#4a3520" }, // safe end
        ],
        movingPlatforms: [],
        crumblingPlanks: [],
        coins: [
            new Coin(200, 275), new Coin(340, 325),
            new Coin(480, 235), new Coin(620, 295), new Coin(760, 245),
        ],
        toilet:  new Toilet(832, 282),
        lava:    null,
        river:   null,
        grinder: new MeatGrinder(canvas.width, canvas.height),
        // x, topY, bottomY, speed, phase — 5 knives, well spaced
        knives: [
            new Knife(200, 20, 270, 14, 0.0),
            new Knife(340, 20, 330, 11, 0.4),
            new Knife(480, 20, 240, 16, 0.2),
            new Knife(620, 20, 300, 12, 0.7),
            new Knife(760, 20, 250, 14, 0.5),
        ],
        bgTop:    "#1a0e05", bgBottom: "#2e1a0a",
        spawnX: 20, spawnY: 330,
    };
}

// ─── Active level ─────────────────────────────────────────────────────────────
let level = buildLevel1();

function resetPigForLevel(lvl) {
    pig.x  = lvl.spawnX;
    pig.y  = lvl.spawnY;
    pig.vx = 0;
    pig.vy = 0;
    pig.damageTimer = 0;
    pigSwallowed    = false;
    swallowProgress = 0;
    pigBurning      = false;
    burnTimer       = 0;
    pigDrowning     = false;
    drownTimer      = 0;
    pigChopped      = false;
    chopTimer       = 0;
}

// ─── Input ────────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => { keys[e.key] = true;  });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

// ─── Background ───────────────────────────────────────────────────────────────
function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, level.bgTop);
    grad.addColorStop(1, level.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentLevel === 1) {
        drawCloud(120, 60, 80);
        drawCloud(400, 40, 100);
        drawCloud(700, 80, 70);
    }
    if (currentLevel === 3) {
        // Misty clouds low over the river
        drawCloud(200, 280, 60);
        drawCloud(500, 300, 50);
        drawCloud(720, 270, 55);
    }
}

function drawCloud(x, y, size) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.arc(x,              y,              size * 0.4,  0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.3,  0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y,              size * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatforms() {
    for (const p of level.platforms) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 4);
        ctx.fill();

        // Top strip colour per level
        const topColor = currentLevel === 2 ? "#a03000"
                       : currentLevel === 3 ? "#4a7c3f"
                       : "#6abf40";
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, 6, [4, 4, 0, 0]);
        ctx.fill();
    }
    for (const mp of level.movingPlatforms) mp.draw(ctx);
    for (const cp of level.crumblingPlanks)  cp.draw(ctx);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
    document.getElementById('scoreDisplay').textContent = `🐷 Score: ${pig.score}`;
    document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
    const hearts = "❤️".repeat(pig.lives) + "🖤".repeat(Math.max(0, 3 - pig.lives));
    document.getElementById('livesDisplay').textContent = hearts;
}

// ─── All collidable platforms ─────────────────────────────────────────────────
function allPlatforms() {
    // Include crumbling planks only if not gone
    const active = level.crumblingPlanks.filter(p => !p.isGone);
    return [...level.platforms, ...level.movingPlatforms, ...active];
}

// ─── Coin collisions ──────────────────────────────────────────────────────────
function checkCoinCollisions() {
    for (const coin of level.coins) {
        if (coin.collected) continue;
        const dist = Math.hypot(
            (pig.x + pig.width  / 2) - coin.x,
            (pig.y + pig.height / 2) - coin.y
        );
        if (dist < coin.radius + 18) { coin.collected = true; pig.score++; }
    }
}

// ─── Crumbling plank trigger ──────────────────────────────────────────────────
function checkCrumblingPlanks() {
    for (const plank of level.crumblingPlanks) {
        if (plank.isGone) continue;
        const onTop = (
            pig.x + pig.width  > plank.x &&
            pig.x              < plank.x + plank.w &&
            pig.y + pig.height >= plank.y &&
            pig.y + pig.height <= plank.y + plank.h + 10 &&
            pig.vy >= 0
        );
        if (onTop) plank.trigger();
    }
}

// ─── Toilet logic ─────────────────────────────────────────────────────────────
function checkToilet() {
    const toilet = level.toilet;
    if (!toilet) return;

    if (pigSwallowed) {
        swallowProgress += 0.03;
        pig.x += (toilet.x + toilet.width  / 2 - pig.x - pig.width  / 2) * 0.2;
        pig.y += (toilet.y + 20             - pig.y - pig.height) * 0.2;
        if (toilet.isDone || swallowProgress >= 1) onLevelComplete();
        return;
    }
    if (toilet.isLandedOn(pig)) {
        pigSwallowed = true;
        pig.vx = 0; pig.vy = 0;
        toilet.triggerOpen();
    }
}

// ─── Lava logic ───────────────────────────────────────────────────────────────
function checkLava() {
    if (!level.lava || pigBurning) return;
    if (level.lava.isTouching(pig)) {
        pigBurning = true; burnTimer = 60;
        pig.lives = Math.max(0, pig.lives - 1);
        pig.damageTimer = 90;
        updateHUD();
        if (pig.lives <= 0) setTimeout(() => endGame("lava"), 600);
        else setTimeout(() => resetPigForLevel(level), 800);
    }
}

// ─── River logic ──────────────────────────────────────────────────────────────
function checkRiver() {
    if (!level.river || pigDrowning) return;
    if (level.river.isTouching(pig)) {
        pigDrowning = true; drownTimer = 60;
        pig.lives = Math.max(0, pig.lives - 1);
        pig.damageTimer = 90;
        updateHUD();
        if (pig.lives <= 0) setTimeout(() => endGame("river"), 700);
        else setTimeout(() => resetPigForLevel(level), 900);
    }
}

// ─── Knife logic ──────────────────────────────────────────────────────────────
function checkKnives() {
    if (!level.knives || pigChopped) return;
    for (const k of level.knives) {
        if (k.isHitting(pig)) {
            pigChopped = true;
            chopTimer  = 60;
            pig.lives  = Math.max(0, pig.lives - 1);
            pig.damageTimer = 90;
            updateHUD();
            if (pig.lives <= 0) setTimeout(() => endGame("chopped"), 700);
            else setTimeout(() => resetPigForLevel(level), 900);
            break;
        }
    }
}

// ─── Grinder logic ────────────────────────────────────────────────────────────
function checkGrinder() {
    if (!level.grinder || pigChopped) return;
    if (level.grinder.isTouching(pig)) {
        pigChopped = true;
        chopTimer  = 60;
        pig.lives  = Math.max(0, pig.lives - 1);
        pig.damageTimer = 90;
        updateHUD();
        if (pig.lives <= 0) setTimeout(() => endGame("ground"), 700);
        else setTimeout(() => resetPigForLevel(level), 900);
    }
}

// ─── Level complete ───────────────────────────────────────────────────────────
function onLevelComplete() {
    if      (currentLevel === 1) showTransition(2);
    else if (currentLevel === 2) showTransition(3);
    else if (currentLevel === 3) showTransition(4);
    else                         endGame("win");
}

const TRANSITIONS = {
    2: {
        border: "#ff6600",
        html: `
            <h1 style="font-size:2.2rem;margin:0">🚽 Level 1 Complete!</h1>
            <p style="color:#ccc;margin:14px 0 6px">The pig is relieved... but the journey isn't over.</p>
            <p style="font-size:1.4rem">🔥 Now cross the <b style="color:#ff6600">LAVA</b>! 🔥</p>`,
        btn: "#ff6600", label: "Into the fire! →",
    },
    3: {
        border: "#1a6fb5",
        html: `
            <h1 style="font-size:2.2rem;margin:0">🔥 Level 2 Complete!</h1>
            <p style="color:#ccc;margin:14px 0 6px">Singed but alive. Now there's a river ahead...</p>
            <p style="font-size:1.4rem">🌊 Cross the <b style="color:#4db8ff">crumbling bridge</b>! 🌊</p>`,
        btn: "#1a6fb5", label: "Cross the bridge! →",
    },
    4: {
        border: "#cc0000",
        html: `
            <h1 style="font-size:2.2rem;margin:0">🌊 Level 3 Complete!</h1>
            <p style="color:#ccc;margin:14px 0 6px">Still in one piece. For now.</p>
            <p style="font-size:1.4rem">🔪 The <b style="color:#ff4444">Butcher's Gauntlet</b> awaits! 🔪</p>`,
        btn: "#cc0000", label: "Face the knives! →",
    },
};

function showTransition(nextLevel) {
    isGameOver = true;
    const t = TRANSITIONS[nextLevel];
    const overlay = document.createElement('div');
    overlay.style = `
        position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.92); color:white;
        padding:40px 60px; border-radius:20px;
        text-align:center; border:4px solid ${t.border};
        z-index:999; font-family:'Courier New',monospace;
    `;
    overlay.innerHTML = `${t.html}
        <br><button id="nextLvlBtn" style="
            margin-top:18px; padding:10px 28px; font-size:1.1rem;
            cursor:pointer; background:${t.btn}; color:#fff;
            border:none; border-radius:8px; font-weight:bold;
        ">${t.label}</button>`;
    document.body.appendChild(overlay);
    document.getElementById('nextLvlBtn').addEventListener('click', () => {
        overlay.remove();
        startLevel(nextLevel);
    });
}

function startLevel(n) {
    currentLevel = n;
    if      (n === 1) level = buildLevel1();
    else if (n === 2) level = buildLevel2();
    else if (n === 3) level = buildLevel3();
    else              level = buildLevel4();
    resetPigForLevel(level);
    isGameOver = false;
    gameLoop();
}

// ─── End Screen ───────────────────────────────────────────────────────────────
function endGame(reason) {
    isGameOver = true;
    const won = reason === "win";
    const messages = {
        win:     ["🎉 The pig made it!", `All 4 levels cleared! Score: ${pig.score} coins. Legendary pig. 🐷`],
        lava:    ["🔥 Crispy pig...",    "Turned into bacon by the lava."],
        river:   ["🌊 Soggy pig...",     "Swept away by the current. Oink."],
        chopped: ["🔪 Chopped pig...",   "The butcher wins. Pork chops tonight."],
        ground:  ["⚙️ Ground pig...",    "Fed into the meat grinder. Oink."],
        dead:    ["💀 Game Over",        "The pig gave up."],
    };
    const [title, subtitle] = messages[reason] || messages.dead;
    const color = won ? "#ffdd00" : "#4db8ff";

    const overlay = document.createElement('div');
    overlay.style = `
        position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.9); color:white;
        padding:40px 60px; border-radius:20px;
        text-align:center; border:4px solid ${color};
        z-index:999; font-family:'Courier New',monospace;
    `;
    overlay.innerHTML = `
        <h1 style="font-size:2.4rem;margin:0">${title}</h1>
        <p style="font-size:1.1rem;margin:12px 0;color:#ccc">${subtitle}</p>
        <button onclick="location.reload()" style="
            padding:10px 28px; font-size:1.1rem; cursor:pointer;
            background:${color}; color:#111;
            border:none; border-radius:8px; font-weight:bold; margin-top:8px;
        ">Try Again</button>
    `;
    document.body.appendChild(overlay);
}

// ─── Draw pig with effects ────────────────────────────────────────────────────
function drawPigWithEffect() {
    // Chopped by knife / ground by grinder
    if (pigChopped && chopTimer > 0) {
        chopTimer--;
        ctx.save();
        // Top half flies up, bottom half stays
        const split = chopTimer / 60;
        ctx.globalAlpha = split;
        // Top half
        ctx.save();
        ctx.translate(pig.x + pig.width / 2, pig.y + pig.height / 2 - (1 - split) * 20);
        ctx.rotate((1 - split) * 0.4);
        ctx.translate(-pig.width / 2, -pig.height / 2);
        ctx.drawImage; // placeholder — just draw pig tinted red
        pig.draw(ctx);
        ctx.restore();
        ctx.restore();
        return;
    }

    // Burning
    if (pigBurning && burnTimer > 0) {
        burnTimer--;
        ctx.save();
        const sc = 1 + (burnTimer / 60) * 0.3;
        ctx.translate(pig.x + pig.width / 2, pig.y + pig.height / 2);
        ctx.scale(sc, sc);
        ctx.globalAlpha = burnTimer / 60;
        ctx.fillStyle = "#ff4400";
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 18, 0, Math.PI * 2, 0);
        ctx.fill();
        ctx.restore();
        return;
    }

    // Drowning
    if (pigDrowning && drownTimer > 0) {
        drownTimer--;
        ctx.save();
        ctx.globalAlpha = drownTimer / 60;
        ctx.translate(pig.x + pig.width / 2, pig.y + pig.height / 2);
        ctx.scale(1, 1 - (1 - drownTimer / 60) * 0.5); // squish down
        ctx.translate(-pig.width / 2, -pig.height / 2);
        pig.draw(ctx);
        ctx.restore();
        return;
    }

    // Swallowed by toilet
    if (pigSwallowed) {
        const scale = Math.max(0, 1 - swallowProgress);
        ctx.save();
        ctx.translate(pig.x + pig.width / 2, pig.y + pig.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-pig.width / 2, -pig.height / 2);
        pig.draw(ctx);
        ctx.restore();
        return;
    }

    pig.draw(ctx);
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Hazards drawn first (behind everything)
    if (level.lava)  { level.lava.update();  level.lava.draw(ctx);  }
    if (level.river) { level.river.update(); level.river.draw(ctx); }

    drawPlatforms();

    // Update crumbling planks
    for (const cp of level.crumblingPlanks) cp.update();

    level.toilet?.update();
    level.toilet?.draw(ctx);

    for (const mp of level.movingPlatforms) mp.update();

    if (!pigSwallowed && !pigBurning && !pigDrowning && !pigChopped) {
        pig.update(keys, allPlatforms(), canvas.width, canvas.height);
        checkCoinCollisions();
        checkCrumblingPlanks();
        checkLava();
        checkRiver();
        checkKnives();
        checkGrinder();
    }

    checkToilet();

    // Update + draw knives
    if (level.knives) {
        for (const k of level.knives) { k.update(); k.draw(ctx); }
    }

    // Update + draw meat grinder
    if (level.grinder) { level.grinder.update(); level.grinder.draw(ctx); }

    level.coins.forEach(c => { c.update(); c.draw(ctx); });
    drawPigWithEffect();
    updateHUD();

    requestAnimationFrame(gameLoop);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
updateHUD();
gameLoop();
