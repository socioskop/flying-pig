export class Toilet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width  = 54;
        this.height = 58; // total height for collision

        this.bobAngle  = 0;

        // Lid animation state
        // "idle" | "opening" | "open" | "swallowing"
        this.state   = "idle";
        this.lidAngle = 0;       // 0 = closed, up to -Math.PI * 0.75 = fully open
        this.swallowTimer = 0;   // counts down after lid is open
    }

    // Call this when pig lands on top
    triggerOpen() {
        if (this.state === "idle") this.state = "opening";
    }

    // Returns true once the swallow animation is done
    get isDone() {
        return this.state === "swallowing" && this.swallowTimer <= 0;
    }

    update() {
        this.bobAngle += 0.05;

        if (this.state === "opening") {
            // Lid swings open (counter-clockwise)
            this.lidAngle -= 0.09;
            if (this.lidAngle <= -Math.PI * 0.75) {
                this.lidAngle = -Math.PI * 0.75;
                this.state = "open";
                this.swallowTimer = 40; // frames before "done"
            }
        }

        if (this.state === "open") {
            this.swallowTimer--;
            if (this.swallowTimer <= 0) this.state = "swallowing";
        }
    }

    draw(ctx) {
        // Only bob when idle
        const pulse = this.state === "idle" ? Math.sin(this.bobAngle) * 2 : 0;

        ctx.save();
        ctx.translate(this.x, this.y + pulse);

        // ── Side-view toilet ─────────────────────────────────────────────────

        // Base / pedestal
        ctx.fillStyle = "#e8e8e8";
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(8, 44, 38, 14, [0, 0, 6, 6]);
        ctx.fill(); ctx.stroke();

        // Bowl body (the main S-bend shape, simplified as a trapezoid)
        ctx.fillStyle = "#f4f4f4";
        ctx.beginPath();
        ctx.moveTo(6,  44);
        ctx.lineTo(0,  20);
        ctx.lineTo(54, 20);
        ctx.lineTo(48, 44);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Water inside bowl
        ctx.fillStyle = "rgba(100, 190, 255, 0.45)";
        ctx.beginPath();
        ctx.ellipse(27, 36, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tank (back, taller rectangle on the left side like a real side-view)
        ctx.fillStyle = "#ececec";
        ctx.strokeStyle = "#bbb";
        ctx.beginPath();
        ctx.roundRect(0, 0, 22, 22, 4);
        ctx.fill(); ctx.stroke();

        // Tank lid (flat top of tank — static)
        ctx.fillStyle = "#ddd";
        ctx.beginPath();
        ctx.roundRect(-1, -4, 24, 6, 3);
        ctx.fill(); ctx.stroke();

        // ── Seat lid (hinged at back-left, swings up) ────────────────────────
        ctx.save();
        ctx.translate(6, 20); // hinge point at back of bowl rim
        ctx.rotate(this.lidAngle);

        ctx.fillStyle = "#d0d0d0";
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, -5, 48, 8, 4); // lid as a flat plank
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // ── Urgency sparkles (only when idle) ───────────────────────────────
        if (this.state === "idle") {
            const t = this.bobAngle;
            ctx.fillStyle = "#ffdd00";
            const sparks = [
                { ox: -10, oy:  5, r: 3 + Math.sin(t * 1.3) },
                { ox:  60, oy:  5, r: 3 + Math.sin(t * 1.7 + 1) },
                { ox: -8,  oy: 28, r: 2 + Math.sin(t * 2.1 + 2) },
                { ox:  58, oy: 28, r: 2 + Math.sin(t * 1.9 + 3) },
            ];
            for (const s of sparks) {
                ctx.beginPath();
                ctx.arc(s.ox, s.oy, Math.max(1, s.r), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ── "Swirling" effect when open ──────────────────────────────────────
        if (this.state === "open" || this.state === "swallowing") {
            const t = this.bobAngle * 3;
            ctx.strokeStyle = "rgba(100, 190, 255, 0.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(27, 36, 8 + Math.sin(t) * 3, 0, Math.PI * 1.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Pig lands on top of the toilet (feet touch the rim at y=20)
    isLandedOn(pig) {
        return (
            this.state === "idle" &&
            pig.x + pig.width  > this.x + 4  &&
            pig.x              < this.x + this.width - 4 &&
            pig.y + pig.height >= this.y + 18 &&
            pig.y + pig.height <= this.y + 28 &&
            pig.vy >= 0
        );
    }
}
