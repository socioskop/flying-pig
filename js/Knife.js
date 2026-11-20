export class Knife {
    // x        = horizontal position (centre of chop)
    // topY     = how high the knife retracts to
    // bottomY  = how low the blade drops to
    // speed    = chop speed in px/frame
    // phase    = starting offset (0..1) so knives don't all sync
    constructor(x, topY, bottomY, speed, phase = 0) {
        this.x       = x;
        this.topY    = topY;
        this.bottomY = bottomY;
        this.speed   = speed;
        this.phase   = phase;

        // Internal state
        // "waiting" → blade is up, counting down
        // "chopping" → blade falls fast
        // "retracting" → blade rises slowly
        this.state     = "waiting";
        this.y         = topY;                   // current blade tip Y
        this.waitMax   = Math.round(40 + phase * 80); // stagger wait times
        this.waitTimer = this.waitMax;

        this.bladeW  = 28;
        this.bladeH  = 60;
        this.handleH = 20;
    }

    update() {
        if (this.state === "waiting") {
            this.waitTimer--;
            // Slight wobble while waiting — telegraphs the chop
            this.y = this.topY + Math.sin(Date.now() * 0.008) * 3;
            if (this.waitTimer <= 0) {
                this.state = "chopping";
                this.y     = this.topY;
            }
        } else if (this.state === "chopping") {
            this.y += this.speed;
            if (this.y >= this.bottomY) {
                this.y     = this.bottomY;
                this.state = "retracting";
            }
        } else if (this.state === "retracting") {
            this.y -= this.speed * 0.4;   // rises slower than it falls
            if (this.y <= this.topY) {
                this.y         = this.topY;
                this.state     = "waiting";
                this.waitTimer = this.waitMax;
            }
        }
    }

    draw(ctx) {
        const cx = this.x;
        const ty = this.y;

        // ── Track / guide rail ──────────────────────────────────────────────
        ctx.strokeStyle = "#555";
        ctx.lineWidth   = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, this.topY - this.handleH);
        ctx.lineTo(cx, this.bottomY + this.bladeH);
        ctx.stroke();
        ctx.setLineDash([]);

        // ── Handle (wooden block at top) ────────────────────────────────────
        ctx.fillStyle = "#8B4513";
        ctx.strokeStyle = "#5a2d0c";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - this.bladeW / 2 - 2, ty - this.handleH, this.bladeW + 4, this.handleH, 3);
        ctx.fill();
        ctx.stroke();
        // Handle rivets
        ctx.fillStyle = "#aaa";
        [-6, 0, 6].forEach(ox => {
            ctx.beginPath();
            ctx.arc(cx + ox, ty - this.handleH / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // ── Blade ───────────────────────────────────────────────────────────
        // Main steel body
        const bladeGrad = ctx.createLinearGradient(cx - this.bladeW / 2, 0, cx + this.bladeW / 2, 0);
        bladeGrad.addColorStop(0,   "#aaaaaa");
        bladeGrad.addColorStop(0.3, "#eeeeee");
        bladeGrad.addColorStop(0.6, "#cccccc");
        bladeGrad.addColorStop(1,   "#888888");
        ctx.fillStyle   = bladeGrad;
        ctx.strokeStyle = "#666";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(cx - this.bladeW / 2, ty);
        ctx.lineTo(cx + this.bladeW / 2, ty);
        ctx.lineTo(cx + this.bladeW / 2, ty + this.bladeH - 16);
        ctx.lineTo(cx,                   ty + this.bladeH);   // pointed tip
        ctx.lineTo(cx - this.bladeW / 2, ty + this.bladeH - 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cutting-edge gleam
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - this.bladeW / 2 + 3, ty + 4);
        ctx.lineTo(cx + this.bladeW / 2 - 3, ty + 4);
        ctx.stroke();

        // ── Red flash when at bottom (just chopped) ─────────────────────────
        if (this.state === "retracting" && this.y >= this.bottomY - 5) {
            ctx.fillStyle = "rgba(255,0,0,0.3)";
            ctx.beginPath();
            ctx.ellipse(cx, this.bottomY + this.bladeH, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Returns true only if the pig overlaps the pointed tip zone
    // The tip is a triangle: the bottom ~20px of the blade, narrowing to cx
    isHitting(pig) {
        if (this.state !== "chopping" && this.state !== "retracting") return false;

        const tipY    = this.y + this.bladeH;       // very bottom point
        const tipZone = 20;                          // how many px up from tip counts
        const zoneTop = tipY - tipZone;

        // Pig must overlap vertically with the tip zone
        if (pig.y + pig.height < zoneTop) return false;
        if (pig.y              > tipY)    return false;

        // At each vertical slice the blade narrows linearly from bladeW/2 → 0
        // Use the pig's vertical centre for the width check
        const pigMidY   = pig.y + pig.height / 2;
        const clampedY  = Math.max(zoneTop, Math.min(tipY, pigMidY));
        const frac      = (clampedY - zoneTop) / tipZone; // 0 at top, 1 at tip
        const halfWidth = (this.bladeW / 2) * (1 - frac) + 2; // narrows to 2px

        const pigCx = pig.x + pig.width / 2;
        return Math.abs(pigCx - this.x) < halfWidth;
    }
}
