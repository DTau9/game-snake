
const body = document.querySelector('body');

// Настройка «холста»
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// Получаем ширину и высоту элемента canvas
const width = canvas.width;
const height = canvas.height;
// Вычисляем ширину и высоту в ячейках
const blockSize = 10;
const widthInBlocks = width / blockSize;
const heightInBlocks = height / blockSize;
// Устанавливаем начальный счет
let score = 0;
// устанавливаем время обновления анимации
const timeoutHolder = {
	animationTime: 100
}

// Рисуем рамку
function drawBorder() {
	ctx.fillStyle = 'Gray';
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
}

// Выводим счет игры в левом верхнем углу
function drawScore() {
	ctx.font = '20px Courier';
	ctx.fillStyle = "Green";
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillText('Счет: ' + score, blockSize, blockSize);
}

// Отменяем действие setTimeout и печатаем сообщение «Game Over»
function gameOver() {
	clearTimeout(timeoutHolder.id);
	let newSize = 0;
	let intervalId;
	function gameOverAnimation() {
		ctx.clearRect(0 + blockSize, 0 + blockSize, width - blockSize * 2, height - blockSize * 2)
		ctx.font = newSize + 'px' + ' ' + 'Courier';
		ctx.fillStyle = 'darkRed';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle'
		ctx.fillText('Game Over', width / 2, height / 2);
		drawScore();
	}

	intervalId = setInterval(function () {
		if (newSize !== 60) {
			gameOverAnimation()
			newSize++;
		} else {
			clearInterval(intervalId)
		}
	}, 10)
}

// Рисуем окружность
function circle(x, y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	if (fillCircle) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
};

// Задаем конструктор Block (ячейка)
function Block(col, row) {
	this.col = col;
	this.row = row;
}

// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color) {
	const x = this.col * blockSize;
	const y = this.row * blockSize;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize)
}

// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
	const centerX = this.col * blockSize + blockSize / 2;
	const centerY = this.row * blockSize + blockSize / 2;
	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true)
}

// Проверяем, находится ли эта ячейка в той же позиции, что и ячейка otherBlock
Block.prototype.equal = function (otherBlock) {
	return this.col === otherBlock.col && this.row === otherBlock.row;
}

// Задаем конструктор Snake 
function Snake() {
	this.segments = [
		new Block(7, 5),
		new Block(6, 5),
		new Block(5, 5)
	]
	this.direction = 'right';
	this.nextDirection = 'right';
}

// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function () {
	this.segments[0].drawSquare('Red')
	for (let i = 1; i < this.segments.length; i += 2) {
		this.segments[i].drawSquare('Blue');
	}
	for (let j = 2; j < this.segments.length; j += 2) {
		this.segments[j].drawSquare('Orange')
	}
}

// Создаем новую голову и добавляем ее к началу змейки,
// чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function () {
	const head = this.segments[0];
	let newHead;

	this.direction = this.nextDirection;

	if (this.direction === 'right') {
		newHead = new Block(head.col + 1, head.row)
	} else if (this.direction === 'down') {
		newHead = new Block(head.col, head.row + 1)
	} else if (this.direction === 'left') {
		newHead = new Block(head.col - 1, head.row)
	} else if (this.direction === 'up') {
		newHead = new Block(head.col, head.row - 1)
	}

	if (this.checkCollision(newHead)) {
		gameOver();
		return;
	}

	this.segments.unshift(newHead);

	if (newHead.equal(apple.position)) {
		score++;
		timeoutHolder.animationTime -= 10;
		do {
			apple.move();
		} while (this.checkCollision(apple.position))

	} else {
		this.segments.pop();
	}
}

// Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollision = function (head) {
	const leftCollision = (head.col === 0);
	const topCollision = (head.row === 0);
	const rightCollision = (head.col === widthInBlocks - 1);
	const bottomCollision = (head.row === heightInBlocks - 1);

	const wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

	const selfCollision = false;
	for (let i = 0; i < this.segments.length; i++) {
		if (head.equal(this.segments[i])) {
			selfCollision = true;
		}
	}
	return wallCollision || selfCollision;
}

// Задаем следующее направление движения змейки на основе нажатой клавиши
Snake.prototype.setDirection = function (newDirection) {
	if (this.direction === 'up' && newDirection === 'down') {
		return;
	} else if (this.direction === 'right' && newDirection === 'left') {
		return
	} else if (this.direction === 'down' && newDirection === 'up') {
		return
	} else if (this.direction === 'left' && newDirection === 'right') {
		return
	}
	this.nextDirection = newDirection;
}

// Задаем конструктор Apple
function Apple() {
	this.position = new Block(10, 10);
}

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function () {
	this.position.drawCircle('LimeGreen');
}

// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function () {
	const randomCol = Math.floor(Math.random() * (widthInBlocks - 2) + 1);
	const randomRow = Math.floor(Math.random() * (heightInBlocks - 2) + 1);

	this.position = new Block(randomCol, randomRow);
}

// Создаем объект-змейку и объект-яблоко
let snake = new Snake();
let apple = new Apple();

// Запускаем функцию анимации через setTimeout
function gameLoop() {
	timeoutHolder.id = setTimeout(gameLoop, timeoutHolder.animationTime);
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
}

gameLoop();

// Преобразуем коды клавиш в направления
const directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down"
}

// Задаем обработчик события keydown (клавиши-стрелки)
body.addEventListener('keydown', function (e) {
	let newDirection = directions[e.keyCode];
	if (newDirection !== undefined) {
		snake.setDirection(newDirection);
	}
	if (e.keyCode === 13) {
		snake = new Snake();
		apple = new Apple();
		score = 0
		timeoutHolder.animationTime = 100;
		gameLoop();
	}
})