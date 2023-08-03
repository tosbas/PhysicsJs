const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const arrayOfBalls = [];

class Balls {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.mass = 1;
        this.color = color;
        this.radius = 50;
        this.boucing = 0.80;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    move(deltaTime) {
        const gravity = 9.807;
        const accelerationY = gravity * this.mass;

        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -this.boucing;

            if (this.vy < 38 && this.vy > -30) {
                this.vy = 0;
            }

        } else {
            this.vy += accelerationY;
        }

        if (this.x + this.radius >= canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -this.boucing;
        }

        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.vx *= -this.boucing;
        }

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy *= -this.boucing;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        this.draw();
    }

}

let lastTime = performance.now();

const animate = (currentTime) => {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const deltaTime = (currentTime - lastTime) / 1000;

    for (i = 0; i < arrayOfBalls.length; i++) {

        lastTime = currentTime;
        arrayOfBalls[i].move(deltaTime);
        for (j = 0; j < arrayOfBalls.length; j++) {
            if (i !== j) {
                colidCell(arrayOfBalls[i], arrayOfBalls[j]);
            }
        }
    }
}

animate(lastTime);

const detectColidCell = (c1x, c2x, c1y, c2y, c1r, c2r) => {
    const distX = c1x - c2x;
    const distY = c1y - c2y;

    const distance = Math.sqrt(distX * distX + distY * distY);

    const angle = Math.atan2(c2y - c1y, c2x - c1x);

    const distanceMove = c1r + c2r - distance;


    if (distance <= c1r + c2r) {
        return [true, angle, distanceMove];
    }

    return false;
};

const colidCell = (ball, otherBall) => {
    const colid = detectColidCell(
        ball.x,
        otherBall.x,
        ball.y,
        otherBall.y,
        ball.radius,
        otherBall.radius
    );
    if (colid[0]) {
        const angle = colid[1];
        const distanceToMove = colid[2];

        const overlapDistance = distanceToMove / 2;
        ball.x -= Math.cos(angle) * overlapDistance;
        ball.y -= Math.sin(angle) * overlapDistance;
        otherBall.x += Math.cos(angle) * overlapDistance;
        otherBall.y += Math.sin(angle) * overlapDistance;

        const normalVector = {
            x: otherBall.x - ball.x,
            y: otherBall.y - ball.y
        };
        const normalLength = Math.sqrt(normalVector.x * normalVector.x + normalVector.y * normalVector.y);
        const unitNormalVector = {
            x: normalVector.x / normalLength,
            y: normalVector.y / normalLength
        };

        const relativeVelocity = {
            x: ball.vx - otherBall.vx,
            y: ball.vy - otherBall.vy
        };

        const dotProduct = relativeVelocity.x * unitNormalVector.x + relativeVelocity.y * unitNormalVector.y;

        const impulse = (2 * dotProduct) / (ball.mass + otherBall.mass);

        ball.vx -= impulse * otherBall.mass * unitNormalVector.x;
        ball.vy -= impulse * otherBall.mass * unitNormalVector.y;
        otherBall.vx += impulse * ball.mass * unitNormalVector.x;
        otherBall.vy += impulse * ball.mass * unitNormalVector.y;
    }
}

const createBall = (e) => {

    const posX = e.clientX;
    const posY = e.clientY;

    const h = Math.floor(Math.random() * 358);
    const s = 100;
    const l = 50;

    const color = `hsl(${h},${s}%, ${l}%)`;

    arrayOfBalls.push(new Balls(posX, posY, color));


}

canvas.addEventListener("click", (e) => {
    createBall(e);
});