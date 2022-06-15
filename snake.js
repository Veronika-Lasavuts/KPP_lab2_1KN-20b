const blessed = require('blessed');

var screen = blessed.screen({
    smartCSR: true,
    debug: true,
});

screen.title = 'Snake Game';
gameStarted = false;

const menu = blessed.box({
    parent: screen,
    align: 'center',
    top: 'center',
    left: 'center',
    width: 100,
    height: 30,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'white',
        border: {
            fg: '#f0f0f0'
        },
    }
});


const menuList = blessed.list({
    parent: menu,
    top: 'center',
    left: 'center',
    align: 'center',
    width: '100%',
    height: '100%',
    keys: true,
    border: {
        type: 'line',
        bg: '#00cdcd'
    },
    padding: {
        top: 12
    },
    items: ['CONTINUE', 'NEW GAME', 'EXIT'],
    style: {
        bg: 'white',
        selected: {bg: '#00cdcd'},
        item: {fg: '#222222', top: 'center', bold: true}
    }
});


const difficultyLevel = blessed.list({
    parent: menu,
    hidden: true,
    top: 'center',
    left: 'center',
    align: 'center',
    width: '100%',
    height: '100%',
    keys: true,
    border: {
        type: 'line',
        bg: '#00cdcd'
    },
    padding: {
        top: 12
    },
    items: ['EASY', 'MEDIUM', 'DIFFICULT'],
    style: {
        bg: 'white',
        selected: {bg: '#00cdcd'},
        item: {fg: '#222222', top: 'center', bold: true}
    }
});


const gameBox = blessed.box({
    parent: screen,
    hidden: true,
    top: 'center',
    left: 'center',
    width: 100,
    height: 30,
    border: {
        type: 'line',
        bg: '#00cdcd'
    },
    style: {
        fg: 'white',
        bg: 'white',
    }
});

function Snake(position) {
    return blessed.box({
                parent:gameBox,
                width: 1,
                height: 1,
                style: {
                    bg: color
                },
                top: position.y,
                left: position.x
           })
}

let directions = {
    'UP': [0, -1],
    'DOWN': [0, 1],
    'LEFT': [-1, 0],
    'RIGHT': [1, 0]
}

let direction = 'RIGHT'; 
let game, snake, positions, color;
let niceApples = [];
let poisonApples = [];
let speed = [125, 80, 40];
let velocity = 125;

screen.render();

function navigateMenuList() {
    switch(menuList.selected) {
        case 2:
            screen.destroy();
            process.exit(0);
        case 1:
            if (gameStarted) {
                gameOver();
            }
            menuList.hide();
            difficultyLevel.show();
            break;
        case 0:
            if (gameStarted) {
                gameBox.show();
                menuList.hide();
                screen.render();
                game = setInterval(changeState, velocity);
            }
    }  
}

function navigateDifficultyLevel() {
    switch(difficultyLevel.selected) {
        case 0:
            velocity = speed[0];
            break;
        case 1:
            velocity = speed[1];
            break;
        case 2:
            velocity = speed[2];
            break;
    }
    difficultyLevel.hide();
    gameBox.show();
    createSnake();
    gameStarted = true;
    startGame();
}


function createSnake() {
    snake = [];
    positions = [];
    for (let i = 0; i < 4; i++) {
        positions.push({x: 10 + i, y: 10});
        snake[i] = Snake(positions[i]);
    }
}

function isPresent(x, y) {

    for (let i = 0; i < niceApples.length; i++) {
        if (x == niceApples[i].left && y == niceApples[i].top) return true
    }
    for (let i = 0; i < poisonApples.length; i++) {
        if (x == poisonApples[i].left && y == poisonApples[i].top) return true
    }
    return false;
}


function createApple(appleColor) {
    let x = Math.floor(Math.random() * (gameBox.width - 3));
    let y = Math.floor(Math.random() * (gameBox.height - 3));
    let i = 0;
    while (i < positions.length) {
        if ((x == positions[i].x && y == positions[i].y) || isPresent(x, y)) {
            x = Math.floor(Math.random() * (gameBox.width - 3));
            y = Math.floor(Math.random() * (gameBox.height - 3));
            i = 0
        } else i++;
    }
    return blessed.box({
        parent: gameBox,
        width: 1,
        height: 1,
        top: y,
        left: x,
        style: {
            'bg': appleColor
        }
    })
}

function hasEatenNice(x, y) {
    let i = 0;
    while (i < niceApples.length) {
        if (x == niceApples[i].left - 1 && y == niceApples[i].top - 1) {
            niceApples[i].detach();
            niceApples.splice(i, 1);
            if (niceApples.length < 7) niceApples.push(createApple('red'));
            if (poisonApples.length < 7) poisonApples.push(createApple('black'))
            return true;
        } else i++;
    }
    return false;
}

function hasEatenPoison(x, y) {
    let i = 0;
    while (i < poisonApples.length) {
        if (x == poisonApples[i].left - 1 && y == poisonApples[i].top - 1) {
            poisonApples[i].detach();
            poisonApples.splice(i, 1);
            if (niceApples.length < 7) niceApples.push(createApple('red'));
            if (poisonApples.length < 7) poisonApples.push(createApple('black'))
            return true;
        } else i++;
    }
    return false;
}

function changeState() {
    let lastNode = positions[positions.length - 1];
    let newX = lastNode.x + directions[direction][0];
    let newY = lastNode.y + directions[direction][1];
    for (let i of snake) {
        i.detach();
    }

    positions.push({x: newX, y: newY});

    if (!hasEatenNice(newX, newY)) positions.shift();
    if (hasEatenPoison(newX, newY)) positions.pop();

    for (let i = 0; i < positions.length; i++) {
        color = (i % 4 < 2) ? "blue" : "green";
        snake[i] = Snake(positions[i]);
    }

    checkForBite();
    checkForGameOver();
    screen.render();
}

function checkForBite() {
    let head = positions[positions.length - 1];
    for (let i = 0; i < positions.length - 1; i++) {
        if (positions[i].x == head.x && positions[i].y == head.y) {
            gameOver();
        }
    }
}

function checkForGameOver() {
    if (positions.length == 0) gameOver();
    else {
        let head = positions[positions.length - 1];
        if (head.x >= gameBox.width - 2 || head.x < 0) {
            gameOver()
        } else if (head.y >= gameBox.height - 2 || head.y < 0) {
            gameOver()
        }
    }
}

function gameOver() {
    gameStarted = false;
    clearInterval(game);
    for (let block of snake) block.detach();
    for (let niceApple of niceApples) niceApple.detach();
    for (let poisonApple of poisonApples) poisonApple.detach();
    direction = 'RIGHT';
    gameBox.hide();
    menuList.show();
    screen.render();
}

function startGame() {
    niceApples = [];
    poisonApples = [];
    niceApples.push(createApple('red'));
    poisonApples.push(createApple('black'));
    screen.render();
    game = setInterval(changeState, velocity);
}

screen.key('down', function(ch, key) {
    let properList = menuList.hidden ? difficultyLevel : menuList;
    if (gameBox.hidden === true) {
        if (properList.selected !== 2) properList.down(1)
        else properList.selected = 0;
    } else {
        if (gameStarted && game && direction != 'UP') {
            direction = 'DOWN';
        }
    }
});

screen.key('up', function(ch, key) {
    let properList = menuList.hidden ? difficultyLevel : menuList;
    if (gameBox.hidden === true) {
        if (properList.selected !== 0) properList.up(1)
        else properList.selected = 2;
    } else if (!gameBox.hidden) {
        if (gameStarted && game && direction != 'DOWN') {
            direction = 'UP';
        }
    }
});

screen.key('left', function(ch, key) {
    if (gameStarted && game && direction != 'RIGHT') {
        direction = 'LEFT';
    }
})

screen.key('right', function(ch, key) {
    if (gameStarted && game && direction != 'LEFT') {
        direction = 'RIGHT';
    }
})

screen.key('enter', function(ch, key) {
    if (gameBox.hidden) {
        if (!menuList.hidden) {
            navigateMenuList();
        } else {
            navigateDifficultyLevel();
        }
    }
    screen.render();
})


screen.key(['escape', 'q'], function(ch, key) {
    this.destroy();
    process.exit(0);
})

screen.key('backspace', function(ch, key) {
    if (gameStarted && game) {
        clearInterval(game);
        gameBox.hide();
        menuList.show();
        screen.render();
    } else if (!difficultyLevel.hidden) {
        difficultyLevel.hide();
        menuList.show();
        screen.render();
    }
})