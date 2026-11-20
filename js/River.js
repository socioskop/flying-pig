export class River {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth  = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.y = canvasHeight - 80; // river surface
        this.h = 80;
        this.tick = 0;
    }

    update() {
        this.tick += 0.04;
    }

    draw(ctx) {
        const { canvasWidth: w, y, h, tick } = this;

        // ── Deep water base ──────────────────────────────────────────────────
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0,   "#1a6fb5");
        grad.addColorStop(0.4, "#0d4d8a");
        grad.addColorStop(1,   "#072a4f");
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, w, h);

        // ── Flowing surface waves ────────────────────────────────────────────
        // Layer 1 — main wave
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 8) {
            const wy = Math.sin(x * 0.025 + tick * 2) * 5
                     + Math.sin(x * 0.06  - tick * 1.5) * 2;
            ctx.lineTo(x, y + wy);
        }
        ctx.lineTo(w, y + h);
        ctx.lineTo(0, y + h);
        ctx.closePath();
        ctx.fillStyle = "rgba(30, 120, 200, 0.6)";
        ctx.fill();

        // Layer 2 — lighter shimmer on top
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 8) {
            const wy = Math.sin(x * 0.04 - tick * 2.5) * 3
                     + Math.cos(x * 0.08 + tick) * 2;
            ctx.lineTo(x, y + wy);
        }
        ctx.strokeStyle = "rgba(120, 200, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // ── Foam streaks (flowing right) ─────────────────────────────────────
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        const streaks = [0.1, 0.3, 0.55, 0.75, 0.9];
        streaks.forEach((t, i) => {
            const sx = ((t * w + tick * 60 * (i % 2 === 0 ? 1 : 0.7)) % w);
            const sy = y + 8 + Math.sin(tick + i) * 4;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 30 + i * 5, 3, 0.1, 0, Math.PI * 2);
            ctx.fill();
        });

        // ── River bank shadow at top ──────────────────────────────────────────
        const shadow = ctx.createLinearGradient(0, y - 10, 0, y + 20);
        shadow.addColorStop(0, "rgba(0,0,0,0.3)");
        shadow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = shadow;
        ctx.fillRect(0, y - 10, w, 30);
    }

    // Returns true if pig has fallen into the river
    isTouching(pig) {
        return pig.y + pig.height >= this.y + 6;
    }
}