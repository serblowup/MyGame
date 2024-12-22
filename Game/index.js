kaboom();

const WIDTH = width();
const HEIGHT = height();
const FLOOR_HEIGHT = HEIGHT / 2;
const JUMP_FORCE = 900;
const SPEED = 500;
const BACKGROUND_COLOR = Color.fromHex("#8D87FF");
const GRASS_COLOR = Color.fromHex("#163301");
const FLOOR_COLOR = Color.fromHex("#009A17");

setBackground(BACKGROUND_COLOR);
loadSprite("IGROK", "car.png");
loadSprite("PREPYATSTVIE", "block.png");

const playerSprites = ["P1", "P2", "P3", "P4", "P5","P6", "P7", "P8", "P9", "P10", "P11"];
playerSprites.forEach(spriteName => loadSprite(spriteName, `pl${spriteName.slice(1)}.png`));

const deathSprites = ["D1", "D2", "D3", "D4", "D5"];
deathSprites.forEach(spriteName => loadSprite(spriteName, `d${spriteName.slice(1)}.png`));

scene("MainMenu", function () {
    loadSprite("BackgroundMainMenu", "Background1.jpg");

    const scaleX = WIDTH / 873;
    const scaleY = HEIGHT / 528;

    const scaleFactor = Math.max(scaleX, scaleY);

    add([
        sprite("BackgroundMainMenu"),
        scale(scaleFactor),
        pos(WIDTH / 2, HEIGHT / 2),
        anchor("center")
    ]);

    const Menu = add([text("Главное меню."), pos(700, 50), scale(2), anchor("center")]);
    const Start = add([text("Начать игру."), pos(700, 300), scale(2), anchor("center"), area()]);
    Start.onClick(function () {
        go("game", 0);
    });
});

scene("game", function (InitialScore, playerState, blocksState) {
    setGravity(2000);

    const createPlayer = function (state) {
        const player = add([sprite(playerSprites[0]), scale(1), pos(80, 40), area(), body(), { currentFrame: 0, isPaused: false }]);
        if (state) {
            player.pos = state.pos;
            player.vel = state.vel;
        }
        return player;
    }

    const player = createPlayer(playerState);

    const createFloor = function () {
        add([rect(WIDTH, FLOOR_HEIGHT), outline(4, GRASS_COLOR), color(FLOOR_COLOR), pos(0, HEIGHT), anchor("botleft"), area(), body({ isStatic: true })]);
    }

    createFloor();

    let score = InitialScore || 0;
    let blocks = [];
    let shouldSpawnBlocks = true;

    const spawnBlock = function () {
        if (!shouldSpawnBlocks) return;
        const block = add([sprite("PREPYATSTVIE"), scale(0.6), area(), pos(WIDTH, FLOOR_HEIGHT), anchor("botleft"), move(LEFT, SPEED), offscreen({ destroy: true }), "block"]);
        blocks.push(block);
        wait(rand(1, 3), spawnBlock);
    }

    if (blocksState) {
        blocksState.forEach(blockState => {
            const block = add([sprite("PREPYATSTVIE"), scale(0.6), area(), pos(blockState.pos), anchor("botleft"), move(LEFT, SPEED), offscreen({ destroy: true }), "block"]);
            blocks.push(block);
        });
        wait(rand(1, 3), spawnBlock);
    } else {
        spawnBlock();
    }

    player.onCollide("block", function (block) {
        if (!player.isPaused) {
            player.isPaused = true;
            shouldSpawnBlocks = false;
            player.playDeathAnimation();
            blocks.forEach(block => block.unuse("move"));
        }
    });

    player.playDeathAnimation = function () {
        let deathFrame = 0;
        const deathInterval = setInterval(() => {
            player.use(sprite(deathSprites[deathFrame]));
            deathFrame++;
            if (deathFrame >= deathSprites.length) {
                clearInterval(deathInterval);
                go("lose", score);
            }
        }, 100);
    }

    const jump = function () {
        if (player.isGrounded() && !player.isPaused) {
            player.jump(JUMP_FORCE);
        }
    }

    onClick(jump);

    const createScoreLabel = function () {
        const scoreLabel = add([text(score), scale(1), pos(25, 25)]);
        return scoreLabel;
    }

    const scoreLabel = createScoreLabel();

    loop(0.2, function () {
        if (!player.isPaused) {
            player.currentFrame = (player.currentFrame + 1) % playerSprites.length;
            player.use(sprite(playerSprites[player.currentFrame]));
        }
    });

    onUpdate(function () {
        if (!player.isPaused) {
            score++;
            scoreLabel.text = score;
        }
    });

    onKeyPress("enter", function () {
        const playerState = {
            pos: player.pos,
            vel: player.vel,
        }
        const blocksState = blocks.map(block => ({
            pos: block.pos,
        }));
        go("Pause", score, playerState, blocksState);
    });
});

scene("Pause", (score, playerState, blocksState) => {
    const PauseText = add([text("Пауза."), pos(700, 50), scale(2), anchor("center")]);
    const Resume = add([text("Продолжить."), pos(700, 200), scale(2), anchor("center"), area()]);
    const Back = add([text("Выйти."), pos(700, 400), scale(2), anchor("center"), area()]);

    Resume.onClick(function () {
        go("game", score, playerState, blocksState);
    });

    Back.onClick(function () {
        go("MainMenu");
    });
});

scene("lose", (score) => {
    add([text("Игра закончена."), pos(center()), scale(2), anchor("center")]);
    add([text("Счёт: " + score), pos(WIDTH / 2, HEIGHT / 2 + 64), scale(2), anchor("center")]);
    onClick(function () {
        go("game", 0);
    });
});

go("MainMenu");











































