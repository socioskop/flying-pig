export class MeatGrinder {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth  = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.y     = canvasHeight - 55;
        this.h     = 55;
        this.angle = 0;   // spinning teeth angle
    }

    update() {
        this.angle += 0.08; // spin the teeth
    }

    draw(ctx) {
        const w = this.canvasWidth;
        const y = this.y;

        // ── Base body (dark steel) ──────────────────────────────────────────
        const bodyGrad = ctx.createLinearGradient(0, y, 0, y + this.h);
        bodyGrad.addColorStop(0,   "#444");
        bodyGrad.addColorStop(0.4, "#333");
        bodyGrad.addColorStop(1,   "#111");
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(0, y, w, this.h);

        // ── Top serrated edge (teeth) ───────────────────────────────────────
        const toothW = 22;
        const toothH = 18;
        const count  = Math.ceil(w / toothW) + 1;
        const offset = (this.angle * 6) % toothW; // scroll teeth left

        ctx.fillStyle   = "#555";
        ctx.strokeStyle = "#222";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(-offset, y);
        for (let i = 0; i < count; i++) {
            const tx = -offset + i * toothW;
            ctx.lineTo(tx,              y);
            ctx.lineTo(tx + toothW / 2, y - toothH);
            ctx.lineTo(tx + toothW,     y);
        }
        ctx.lineTo(w + toothW, y + this.h);
        ctx.lineTo(-offset,    y + this.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // ── Spinning circular blades along the top ──────────────────────────
        const bladePositions = [80, 200, 340, 480, 620, 760, 860];
        bladePositions.forEach((bx, i) => {
            const r   = 18;
            const rot = this.angle * (i % 2 === 0 ? 1 : -1); // alternate spin dirs
            ctx.save();
            ctx.translate(bx, y - 4);
            ctx.rotate(rot);

            // Blade disc
            const discGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
            discGrad.addColorStop(0,   "#aaa");
            discGrad.addColorStop(0.6, "#888");
            discGrad.addColorStop(1,   "#555");
            ctx.fillStyle = discGrad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            // Blade spokes / teeth
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth   = 3;
            for (let t = 0; t < 6; t++) {
                const a = (t / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 6,  Math.sin(a) * 6);
                ctx.lineTo(Math.cos(a) * r,  Math.sin(a) * r);
                ctx.stroke();
            }

            // Centre bolt
            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // ── Blood-red glow at the very top ──────────────────────────────────
        const glow = ctx.createLinearGradient(0, y - 20, 0, y + 10);
        glow.addColorStop(0,   "rgba(180,0,0,0)");
        glow.addColorStop(0.6, "rgba(180,0,0,0.18)");
        glow.addColorStop(1,   "rgba(180,0,0,0.35)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, y - 20, w, 30);

        // ── Warning stripes on the body ──────────────────────────────────────
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle   = "#ffdd00";
        for (let i = 0; i < w / 60; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 60,      y + 10);
            ctx.lineTo(i * 60 + 30, y + 10);
            ctx.lineTo(i * 60 + 20, y + this.h);
            ctx.lineTo(i * 60 - 10, y + this.h);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    isTouching(pig) {
        return pig.y + pig.height >= this.y - 10;
    }
}
