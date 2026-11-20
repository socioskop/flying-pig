export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.bobAngle = Math.random() * Math.PI * 2; // stagger bob animation
    }

    update() {
        this.bobAngle += 0.07;
    }

    draw(ctx) {
        if (this.collected) return;
        const bobY = Math.sin(this.bobAngle) * 4;

        ctx.save();
        ctx.translate(this.x, this.y + bobY);

        // Outer glow
        ctx.shadowColor = "#ffdd00";
        ctx.shadowBlur = 10;

        ctx.fillStyle = "#ffdd00";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner shine
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff9aa";
        ctx.beginPath();
        ctx.arc(-3, -3, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
