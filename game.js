class SnakeGame {
    constructor(canvasId, speed) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.gridSize = 20;
        this.snake = [{ x: 200, y: 200 }, { x: 180, y: 200 }, { x: 160, y: 200 }];
        this.food = this.getRandomPosition();
        this.direction = "RIGHT";
        this.score = 0;
        this.speed = speed;
        this.scoreDisplay = document.getElementById("currentScore");

        // Load images
        this.headImages = this.loadHeadImages();
        this.bodyImages = this.loadBodyImages();
        this.tailImages = this.loadTailImages();
        this.foodImage = this.loadImage("assets/apple.png");

        // Load sounds
        this.eatSound = new Audio("assets/food.mp3");
        this.gameOverSound = new Audio("assets/gameover.mp3");

        document.addEventListener("keydown", this.changeDirection.bind(this));
        this.gameLoop();
    }

    loadImage(src) {
        let img = new Image();
        img.src = src;
        return img;
    }

    loadHeadImages() {
        return {
            UP: this.loadImage("assets/head_up.png"),
            DOWN: this.loadImage("assets/head_down.png"),
            LEFT: this.loadImage("assets/head_left.png"),
            RIGHT: this.loadImage("assets/head_right.png")
        };
    }

    loadBodyImages() {
        return {
            horizontal: this.loadImage("assets/body_horizontal.png"),
            vertical: this.loadImage("assets/body_vertical.png"),
            topleft: this.loadImage("assets/body_topleft.png"),
            topright: this.loadImage("assets/body_topright.png"),
            bottomleft: this.loadImage("assets/body_bottomleft.png"),
            bottomright: this.loadImage("assets/body_bottomright.png")
        };
    }

    loadTailImages() {
        return {
            UP: this.loadImage("assets/tail_up.png"),
            DOWN: this.loadImage("assets/tail_down.png"),
            LEFT: this.loadImage("assets/tail_left.png"),
            RIGHT: this.loadImage("assets/tail_right.png")
        };
    }

    getRandomPosition() {
        return {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize - 2) + 1) * this.gridSize,
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize - 2) + 1) * this.gridSize
        };
    }

    changeDirection(event) {
        const keyMap = { 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN" };
        if (keyMap[event.keyCode]) {
            this.direction = keyMap[event.keyCode];
        }
    }

    update() {
        let head = { ...this.snake[0] };
        if (this.direction === "LEFT") head.x -= this.gridSize;
        if (this.direction === "RIGHT") head.x += this.gridSize;
        if (this.direction === "UP") head.y -= this.gridSize;
        if (this.direction === "DOWN") head.y += this.gridSize;

        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= this.canvas.width ||
            head.y >= this.canvas.height ||
            this.isCollision(head)
        ) {
            this.gameOverSound.play().then(() => {
                setTimeout(() => {
                    localStorage.setItem("lastScore", this.score);
                    window.location.href = "highscore.html";
                }, 500);
            }).catch(() => {
                // Fallback jika audio gagal diputar (misalnya autoplay diblok)
                localStorage.setItem("lastScore", this.score);
                window.location.href = "highscore.html";
            });
            return;
        }

        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.getRandomPosition();
            this.eatSound.play();
        } else {
            this.snake.pop();
        }

        this.updateScore();
    }

    isCollision(head) {
        return this.snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y);
    }

    updateScore() {
        this.scoreDisplay.innerText = "Score: " + this.score;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.foodImage, this.food.x, this.food.y, this.gridSize, this.gridSize);

        this.snake.forEach((segment, index) => {
            let img;
            if (index === 0) {
                img = this.headImages[this.direction];
            } else if (index === this.snake.length - 1) {
                let tailDirection = this.getTailDirection();
                img = this.tailImages[tailDirection];
            } else {
                img = this.getBodyImage(index);
            }
            this.ctx.drawImage(img, segment.x, segment.y, this.gridSize, this.gridSize);
        });
    }

    getTailDirection() {
        let tail = this.snake[this.snake.length - 1];
        let prev = this.snake[this.snake.length - 2];

        if (prev.x < tail.x) return "RIGHT";
        if (prev.x > tail.x) return "LEFT";
        if (prev.y < tail.y) return "DOWN";
        return "UP";
    }

    getBodyImage(index) {
        let prev = this.snake[index - 1];
        let segment = this.snake[index];
        let next = this.snake[index + 1];

        if (prev.x === next.x) return this.bodyImages.vertical;
        if (prev.y === next.y) return this.bodyImages.horizontal;
        if ((prev.x < segment.x && next.y > segment.y) || (next.x < segment.x && prev.y > segment.y)) return this.bodyImages.bottomleft;
        if ((prev.x > segment.x && next.y > segment.y) || (next.x > segment.x && prev.y > segment.y)) return this.bodyImages.bottomright;
        if ((prev.x < segment.x && next.y < segment.y) || (next.x < segment.x && prev.y < segment.y)) return this.bodyImages.topleft;
        return this.bodyImages.topright;
    }

    gameLoop() {
        this.update();
        this.draw();
        setTimeout(() => this.gameLoop(), this.speed);
    }
}

const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");
const speed = level === "low" ? 250 : level === "medium" ? 200 : 150;

new SnakeGame("gameCanvas", speed);
