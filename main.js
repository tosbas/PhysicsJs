const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btnMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");
const radiusMenu = document.getElementById("radius");
const boucingMenu = document.getElementById("bouncing");
const btnClear = document.getElementById("btn-clear");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

const FullScreenMode = () => {

    const win = window.open("", "full", "dependent=yes, fullscreen=yes");
    win.location = window.location.href;
    window.opener = null;
}

let launchingPos = false;
let posXStart = 0;
let posYStart = 0;
let posX = 0;
let posY = 0;
let dirX = 0;
let dirY = 0;
let vx = 0;
let vy = 0;

let arrayOfBalls = [];


class Balls {
    constructor(x, y, vx, vy, radius, boucing, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.boucing = boucing;
        this.mass = this.radius / 3;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "#000";
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    move() {
        const gravity = 9.807;
        const accelerationY = gravity;

        this.vy += accelerationY * 0.1;

        this.y += this.vy * 0.1;
        this.x += this.vx * 0.1;

        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= - this.boucing;
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


        this.draw();
    }

}

const drawLine = () => {
    if (launchingPos) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(posXStart, posYStart);
        ctx.lineTo(posX, posY);
        ctx.stroke();
    }
}


const animate = () => {

    ctx.fillStyle = "rgba(0,0,0,0.5)";

    requestAnimationFrame(animate);

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLine();

    for (i = 0; i < arrayOfBalls.length; i++) {

        arrayOfBalls[i].move();

        for (j = 0; j < arrayOfBalls.length; j++) {
            if (i !== j) {
                colidCell(arrayOfBalls[i], arrayOfBalls[j]);
            }
        }
    }
}

animate();

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

        const relativeVelocity = {
            x: ball.vx - otherBall.vx,
            y: ball.vy - otherBall.vy
        };

        const dotProduct = relativeVelocity.x * Math.cos(angle) + relativeVelocity.y * Math.sin(angle);

        const impulse = (1.7 * dotProduct) / (ball.mass + otherBall.mass);

        ball.vx -= impulse * otherBall.mass * Math.cos(angle);
        ball.vy -= impulse * otherBall.mass * Math.sin(angle);
        otherBall.vx += impulse * ball.mass * Math.cos(angle);
        otherBall.vy += impulse * ball.mass * Math.sin(angle);
    }
}


const calculateLauchingVelocity = () => {

    if (launchingPos) {
        launchingPos = false;

        const velocityMagnitude = Math.sqrt(dirX * dirX + dirY * dirY);
        const maxVelocity = 10000;
        const velocityFactor = Math.min(velocityMagnitude / maxVelocity, 1);
        const initialVelocityX = dirX / velocityMagnitude * maxVelocity * velocityFactor;
        const initialVelocityY = dirY / velocityMagnitude * maxVelocity * velocityFactor;

        if (isNaN(initialVelocityX)) {
            vx = 0;
        } else {
            vx = initialVelocityX;
        }

        if (isNaN(initialVelocityY)) {
            vy = 0;
        } else {
            vy = initialVelocityY;
        }

        createBall();
    }
}

const createBall = () => {

    const h = Math.floor(Math.random() * 358);
    const s = 100;
    const l = 50;

    const color = `hsl(${h},${s}%, ${l}%)`;

    if (parseInt(radiusMenu.value) > 100) {
        radiusMenu.value = 100;
    }

    if (parseInt(radiusMenu.value) === 0 || parseInt(radiusMenu.value) === 1 || radiusMenu.value.length === 0) {
        radiusMenu.value = 2;
    }

    if (parseFloat(boucingMenu.value) > 1) {
        boucingMenu.value = 1;
    }

    if (boucingMenu.value.length === 0) {
        boucingMenu.value = 0;
    }

    const radius = parseInt(radiusMenu.value);
    const boucing = parseFloat(boucingMenu.value);

    const maxCirclesWidth = Math.floor(window.innerWidth / (2 * radius));
    const maxCirclesHeight = Math.floor(window.innerHeight / (2 * radius));
    const maxCircles = maxCirclesWidth * maxCirclesHeight;

    const existingCircles = arrayOfBalls.filter(ball => ball.radius === radius).length;

    const remainingSpace = maxCircles - existingCircles;

    if (remainingSpace > 0) {
        arrayOfBalls.push(new Balls(posX, posY, vx, vy, radius, boucing, color));
    }


}

const initPosLaunching = (eventPosX, eventPosY) => {
    launchingPos = true;

    posXStart = eventPosX;
    posYStart = eventPosY;
    dirX = 0;
    dirY = 0;
}

btnMenu.addEventListener("click", () => {
    menu.classList.toggle("menu-hidden");
    menu.classList.toggle("menu-visible");
})

canvas.addEventListener("mousedown", (e) => {

    if (e.button == 0) {
        posX = e.clientX;
        posY = e.clientY;

        eventPosX = e.clientX;
        eventPosY = e.clientY;

        initPosLaunching(eventPosX, eventPosY)
    }

});

canvas.addEventListener("touchstart", (e) => {

    posX = e.touches[0].clientX;
    posY = e.touches[0].clientY;

    eventPosX = e.touches[0].clientX;
    eventPosY = e.touches[0].clientY;

    initPosLaunching(eventPosX, eventPosY)

})

canvas.addEventListener("mousemove", (e) => {
    if (launchingPos) {
        posX = e.clientX;
        posY = e.clientY;

        dirX = posXStart - posX;
        dirY = posYStart - posY;
    }
});

canvas.addEventListener("touchmove", (e) => {
    if (launchingPos) {
        posX = e.touches[0].clientX;
        posY = e.touches[0].clientY;

        dirX = posXStart - posX;
        dirY = posYStart - posY;
    }
});


canvas.addEventListener("mouseup", () => {
    calculateLauchingVelocity()
});

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    calculateLauchingVelocity()
});


btnClear.addEventListener("click", () => {
    arrayOfBalls = [];
})


