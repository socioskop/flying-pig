export class MovingPlatform {
    constructor(x, y, w, h, axis, min, max, speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = "#7a5c2e";

        this.axis  = axis;  // "x" or "y"
        this.min   = min;
        this.max   = max;
        this.speed = speed;
        this.dir   = 1;     // 1 or -1
    }

    update() {
        if (this.axis === "x") {
            this.x += this.speed * this.dir;
            if (this.x <= this.min || this.x + this.w >= this.max) this.dir *= -1;
        } else {
            this.y += this.speed * this.dir;
            if (this.y <= this.min || this.y >= this.max) this.dir *= -1;
        }
    }

    draw(ctx) {
        // Plank
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 4);
        ctx.fill();
        // Grass top
        ctx.fillStyle = "#6abf40";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, 6, [4, 4, 0, 0]);
        ctx.fill();
    }
}
