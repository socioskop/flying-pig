export class Lava {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth  = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.y = canvasHeight - 40; // sits at the bottom
        this.h = 40;
        this.tick = 0;
    }

    update() {
        this.tick += 0.05;
    }

    draw(ctx) {
        const y = this.y;
        const w = this.canvasWidth;

        // ── Glow underneath ──────────────────────────────────────────────────
        const glow = ctx.createLinearGradient(0, y - 30, 0, y);
        glow.addColorStop(0, "rgba(255, 80, 0, 0)");
        glow.addColorStop(1, "rgba(255, 80, 0, 0.35)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, y - 30, w, 30);

        // ── Wavy lava surface ────────────────────────────────────────────────
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 10) {
            const wave = Math.sin(x * 0.03 + this.tick) * 5
                       + Math.sin(x * 0.07 - this.tick * 1.3) * 3;
            ctx.lineTo(x, y + wave);
        }
        ctx.lineTo(w, this.canvasHeight);
        ctx.lineTo(0, this.canvasHeight);
        ctx.closePath();

        // Lava gradient: bright orange on top, deep red below
        const grad = ctx.createLinearGradient(0, y, 0, this.canvasHeight);
        grad.addColorStop(0,   "#ff6600");
        grad.addColorStop(0.3, "#dd2200");
        grad.addColorStop(1,   "#880000");
        ctx.fillStyle = grad;
        ctx.fill();

        // ── Bright wave highlight ────────────────────────────────────────────
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 10) {
            const wave = Math.sin(x * 0.03 + this.tick) * 5
                       + Math.sin(x * 0.07 - this.tick * 1.3) * 3;
            ctx.lineTo(x, y + wave);
        }
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 3;
        ctx.stroke();

        // ── Bubbles ──────────────────────────────────────────────────────────
        const bubbles = [80, 220, 400, 570, 720, 850];
        bubbles.forEach((bx, i) => {
            const by = y - 4 + Math.sin(this.tick * 2 + i) * 3;
            ctx.beginPath();
            ctx.arc(bx, by, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 180, 0, 0.6)";
            ctx.fill();
        });
    }

    // Returns true if the pig touches the lava surface
    isTouching(pig) {
        return pig.y + pig.height >= this.y - 8;
    }
}
