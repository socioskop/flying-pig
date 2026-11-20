export class CrumblingPlank {
    constructor(x, y, w) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = 14;

        // "idle" | "shaking" | "falling" | "gone"
        this.state      = "idle";
        this.shakeTimer = 0;   // counts down before falling
        this.fallSpeed  = 0;
        this.alpha      = 1;
        this.shakeOffset = 0;
    }

    // Called by main when pig is standing on this plank
    trigger() {
        if (this.state === "idle") {
            this.state      = "shaking";
            this.shakeTimer = 40; // ~0.66s at 60fps
        }
    }

    get isGone() { return this.state === "gone"; }

    update() {
        if (this.state === "shaking") {
            this.shakeTimer--;
            // Vibrate left/right
            this.shakeOffset = Math.sin(this.shakeTimer * 1.5) * 3;
            if (this.shakeTimer <= 0) {
                this.state     = "falling";
                this.fallSpeed = 1;
            }
        } else if (this.state === "falling") {
            this.fallSpeed += 0.4;
            this.y         += this.fallSpeed;
            this.alpha      = Math.max(0, this.alpha - 0.025);
            if (this.alpha <= 0) this.state = "gone";
        }
    }

    draw(ctx) {
        if (this.state === "gone") return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.shakeOffset, 0);

        // Plank colour shifts to red when shaking
        const danger = this.state === "shaking"
            ? `hsl(${20 - (40 - this.shakeTimer) * 1}, 70%, 35%)`
            : "#7a5c2e";

        ctx.fillStyle = danger;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 3);
        ctx.fill();

        // Grass top (green → yellow → gone as it shakes)
        const grassColor = this.state === "shaking"
            ? `hsl(${60 - (40 - this.shakeTimer) * 2}, 80%, 45%)`
            : "#6abf40";
        ctx.fillStyle = grassColor;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, 5, [3, 3, 0, 0]);
        ctx.fill();

        // Wood grain lines
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            const lx = this.x + (this.w / 3) * i;
            ctx.beginPath();
            ctx.moveTo(lx, this.y + 5);
            ctx.lineTo(lx, this.y + this.h);
            ctx.stroke();
        }

        ctx.restore();
    }
}
