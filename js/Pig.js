export class Pig {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 36;

        this.vx = 0;
        this.vy = 0;

        this.speed = 4;
        this.jumpPower = -13;
        this.gravity = 0.66;

        this.onGround = false;
        this.jumpsLeft = 5;   // 2 = can double-jump/fly
        this.isFlying = false; // true during 2nd jump (wings out)

        this.lives = 3;
        this.score = 0;
        this.damageTimer = 0;

        this.wingAngle = 0;   // for flapping animation
        this.facing = 1;      // 1 = right, -1 = left
    }

    update(keys, platforms, canvasWidth, canvasHeight) {
        // --- Horizontal movement ---
        if (keys['ArrowLeft']  || keys['a']) { this.vx = -this.speed; this.facing = -1; }
        else if (keys['ArrowRight'] || keys['d']) { this.vx =  this.speed; this.facing =  1; }
        else this.vx = 0;

        // --- Jump / fly ---
        if ((keys[' '] || keys['ArrowUp'] || keys['w']) && !keys['_prevJump']) {
            if (this.jumpsLeft > 0) {
                this.vy = this.jumpPower;
                this.jumpsLeft--;
                this.isFlying = (this.jumpsLeft === 0); // second jump = flying
            }
        }
        keys['_prevJump'] = keys[' '] || keys['ArrowUp'] || keys['w'];

        // --- Gravity (reduced when flying) ---
        const grav = this.isFlying ? this.gravity * 0.66 : this.gravity;
        this.vy += grav;

        // --- Move ---
        this.x += this.vx;
        this.y += this.vy;

        // --- Wing flap animation ---
        this.wingAngle += this.isFlying ? 0.3 : 0.1;

        // --- Platform collisions ---
        this.onGround = false;
        for (const p of platforms) {
            if (
                this.x + this.width > p.x &&
                this.x < p.x + p.w &&
                this.y + this.height > p.y &&
                this.y + this.height < p.y + p.h + 16 &&
                this.vy >= 0
            ) {
                this.y = p.y - this.height;
                this.vy = 0;
                this.onGround = true;
                this.jumpsLeft = 5;
                this.isFlying = false;
            }
        }

        // --- Screen boundaries ---
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        // --- Fell off the bottom (level 1 only safety net) ---
        // In level 2, lava handles death before the pig reaches canvasHeight
        if (this.y > canvasHeight + 100) {
            this.respawn();
        }

        // --- Damage timer countdown ---
        if (this.damageTimer > 0) this.damageTimer--;
    }

    respawn() {
        this.lives = Math.max(0, this.lives - 1);
        this.x = 80;
        this.y = 350;
        this.vx = 0;
        this.vy = 0;
        this.damageTimer = 90;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.facing, 1);

        // Flash when damaged (blink every 6 frames)
        if (this.damageTimer > 0 && Math.floor(this.damageTimer / 6) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        const flap = Math.sin(this.wingAngle) * (this.isFlying ? 1.0 : 0.4);

        // ── Cape (drawn first, behind everything) ────────────────────────────
        const capeFlutter = Math.sin(this.wingAngle * 0.8) * (this.isFlying ? 6 : 3);
        ctx.save();
        ctx.translate(-4, -6); // attach at upper-back of body
        const capeGrad = ctx.createLinearGradient(0, 0, -36, 26);
        capeGrad.addColorStop(0, "#dd0000");
        capeGrad.addColorStop(1, "#6a0000");
        ctx.fillStyle = capeGrad;
        ctx.beginPath();
        ctx.moveTo(2, -8);                                          // collar top
        ctx.quadraticCurveTo(-4,  -2, -30, 10 + capeFlutter);      // outer top sweep
        ctx.quadraticCurveTo(-32, 22 + capeFlutter, -22, 28 + capeFlutter); // outer bottom
        ctx.quadraticCurveTo(-10, 26 + capeFlutter,  0,  18);      // inner hem sweep
        ctx.quadraticCurveTo( 2,   8,  2, -8);                     // back to collar
        ctx.closePath();
        ctx.fill();
        // Inner shadow fold
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.quadraticCurveTo(-6, 4, -24, 14 + capeFlutter);
        ctx.quadraticCurveTo(-20, 20 + capeFlutter, -14, 18 + capeFlutter);
        ctx.quadraticCurveTo(-8, 10, -2, 0);
        ctx.closePath();
        ctx.fill();
        // Highlight edge
        ctx.strokeStyle = "rgba(255,120,120,0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.quadraticCurveTo(-8, 2, -28, 12 + capeFlutter);
        ctx.stroke();
        ctx.restore();

        // ── Wing (hinged mid-body, slightly forward) ──────────────────────────
        ctx.save();
        ctx.translate(2, -4);               // moved forward compared to before
        ctx.rotate(-0.25 + flap * 0.75);

        ctx.fillStyle = "#ffccdd";
        ctx.strokeStyle = "#e8889a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-14, -12, -26, -4);  // top sweep
        ctx.quadraticCurveTo(-20,   8,  -6,  12); // tip curves back down
        ctx.quadraticCurveTo( -2,   8,   0,   0); // back to root
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wing membrane lines
        ctx.strokeStyle = "rgba(220,100,130,0.5)";
        ctx.lineWidth = 1;
        [0.3, 0.55, 0.75].forEach(t => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                -26 * t, -4 + (1 - t) * 10,
                -26 * t - 2, -4 + (1 - t) * 13
            );
            ctx.stroke();
        });
        ctx.restore();

        // ── Body ─────────────────────────────────────────────────────────────
        ctx.fillStyle = "#ffb3c6";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── Snout ─────────────────────────────────────────────────────────────
        ctx.fillStyle = "#ff8fab";
        ctx.beginPath();
        ctx.ellipse(16, 2, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cc5577";
        ctx.beginPath(); ctx.arc(14, 1, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(18, 1, 2, 0, Math.PI * 2); ctx.fill();

        // ── Eye ───────────────────────────────────────────────────────────────
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(10, -6, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath(); ctx.arc(11, -6, 2.5, 0, Math.PI * 2); ctx.fill();

        // ── Ear ───────────────────────────────────────────────────────────────
        ctx.fillStyle = "#ff8fab";
        ctx.beginPath();
        ctx.moveTo(4, -12); ctx.lineTo(-2, -20); ctx.lineTo(10, -16);
        ctx.closePath(); ctx.fill();

        ctx.restore();
    }
}
