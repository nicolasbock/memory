/* https://developer.mozilla.org/en-US/docs/Games/Anatomy
 *
 * gameData.lastRender
 *     keeps track of the last provided requestAnimationFrame
 *     timestamp.
 * gameData.lastUpdate
 *     keeps track of the last update time. Always increments by
 *     updateInterval.
 * gameData.updateInterval
 *     is how frequently the game state updates.
 *
 * timeSinceUpdate
 *     is the time between requestAnimationFrame callback and last
 *     update.
 * numUpdates
 *     is how many updates should have happened between these two
 *     rendered frames.
 *
 * render()
 *     is passed tFrame because it is assumed that the render method
 *     will calculate how long it has been since the most recently
 *     passed update for extrapolation (purely cosmetic for fast
 *     devices). It draws the scene.
 *
 * update()
 *     calculates the game state as of a given point in time. It
 *     should always increment by updateInterval. It is the authority for
 *     game state. It is passed the DOMHighResTimeStamp for the time
 *     it represents (which, again, is always last update +
 *     gameData.updateInterval unless a pause feature is added, etc.)
 *
 * setInitialState()
 *     Performs whatever tasks are leftover before the mainloop must
 *     run.
 */

/* Get cavas context. */
let cUI = document.getElementById("ui-layer")
let contextUI = cUI.getContext("2d");
let contextGame = document.getElementById("game-layer").getContext("2d");

let mouse_position = { x: 0, y: 0 }

var gameData = {
    /* The image files. */
    image_files: [
        /* The first image is used as the backside of a tile. */
        "images/back.png",

        /* Each tile needs three images. */
        "images/Skull.png",
        "images/Skull.png",
        "images/Skull.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/House 1.png",
        "images/House 2.png",
        "images/House 3.png"
    ],

    /* The number of cards to use. */
    numberCards: 3,

    /* The number of images per card. */
    numberImagesPerCard: 2,

    /* The number of rows. */
    numberRows: 2,

    /* Set the update interval in ms. */
    updateInterval: 200,

    /* The lifetime of a message. */
    messageTimeout: 2000
};

/* Start loading the images. */
preloadImages(gameData.image_files).done(function(images) {
    /* Organize the images. */
    gameData.back = images.shift();
    gameData.cards = [];
    while (images.length > 0) {
        gameData.cards.push([
            images.shift(),
            images.shift(),
            images.shift()
        ]);
    }

    gameData.lastUpdate = performance.now();
    gameData.lastRender = gameData.lastUpdate;

    /* Initialize the tiles. */
    setInitialState();

    /* Start the main loop. */
    mainLoop(performance.now());
});

function setInitialState() {
    initializeGame();
    pickTiles();
    placeTiles();
}

function initializeGame() {
    gameData.currentPlayer = 1;
    gameData.chosenTiles = [];
    gameData.capturedTiles = {1: [], 2: []};
    gameData.messages = [];
}

function pickTiles() {
    /* First pick the tiles. */
    gameData.tiles = [];
    let temp = [...Array(gameData.cards.length).keys()];
    for (let i = 0; i < gameData.numberCards; i++) {
        /* Pick a card at random. */
        let cardIndex = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];

        /* Now pick the images for that card. */
        let temp_images = [...Array(gameData.cards[cardIndex].length).keys()];
        for (let j = 0; j < gameData.numberImagesPerCard; j++) {
            gameData.tiles.push({card: cardIndex,
                                 image: temp_images.splice(
                                     Math.floor(Math.random()
                                                * temp_images.length), 1)[0]});
        }
    }
    /* Shuffle the tiles. */
    shuffleArray(gameData.tiles);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function placeTiles() {
    /* The number of columns. */
    gameData.numberColumns = Math.floor(gameData.numberCards
                                        * gameData.numberImagesPerCard
                                        / gameData.numberRows);

    /* Width and height of a tile. */
    gameData.x_width = (1000 - 2 * 5
                        - (gameData.numberColumns - 1) * 5)
        / gameData.numberColumns;
    gameData.y_width = (1000 - 2 * 5
                        - (gameData.numberRows - 1) * 5)
        / gameData.numberRows;

    /* Since the tiles are in random order, we can loop over them
     * sequentially and place them on a grid. */
    for (let i = 0; i < gameData.numberRows; i++) {
        for (let j = 0; j < gameData.numberColumns; j++) {
            let temp = gameData.tiles[i * gameData.numberColumns + j];
            temp.x = 5 + j * gameData.x_width + j * 5;
            temp.y = 5 + i * gameData.y_width + i * 5;
            temp.hidden = true;
            temp.rendered = false;
        }
    }
}

function mainLoop(tFrame) {
    gameData.stopMain = window.requestAnimationFrame(mainLoop);
    var nextUpdate = gameData.lastUpdate + gameData.updateInterval;
    var numUpdates = 0;

    /* If tFrame < nextUpdate then 0 ticks need to be updated (0
     * is default for numUpdates).
     *
     * If tFrame = nextUpdate then 1 tick needs to be updated (and
     * so forth).
     *
     * Note: As we mention in summary, you should keep track of
     * how large numUpdates is.  If it is large, then either your
     * game was asleep, or the machine cannot keep up.
     */
    if (tFrame > nextUpdate) {
        var timeSinceUpdate = tFrame - gameData.lastUpdate;
        numUpdates = Math.floor(timeSinceUpdate / gameData.updateInterval);
    }

    queueUpdates(numUpdates);
    render(tFrame);
    gameData.lastRender = tFrame;
}

function queueUpdates(numUpdates) {
    for(var i = 0; i < numUpdates; i++) {
        gameData.lastUpdate = gameData.lastUpdate
            + gameData.updateInterval; // Now lastUpdate is this tick.
        update(gameData.lastUpdate);
    }
}

function update(lastUpdate) {
    //flipTiles();
    //updateGameStats();
}

function render(tFrame) {
    renderMessages(tFrame);
    renderTiles(tFrame);
    renderGameStats(tFrame);
}

function renderGameStats(tFrame) {
    contextUI.fillStyle = "black";
    contextUI.globalAlpha = 1;
    contextUI.font = "64px serif";
    contextUI.textAlign = "right";
    contextUI.textBaseline = "top";
    contextUI.fillText("Player " + gameData.currentPlayer, 800, 900, 900);
}

function renderMessages(tFrame) {
    for (let i = 0; i < gameData.messages.length; i++) {
        msg = gameData.messages[i];
        if (! msg.rendered) {
            contextUI.fillStyle = "red";
            contextUI.globalAlpha = 0.6;
            contextUI.fillRect(25, 100, 950, 100);

            contextUI.fillStyle = "black";
            contextUI.globalAlpha = 1;
            contextUI.font = "84px serif";
            contextUI.textAlign = "center";
            contextUI.textBaseline = "top";
            contextUI.fillText(msg.message, 500, 100, 900);
            msg.rendered = true;
        }
        if (tFrame - msg.timestamp > gameData.messageTimeout) {
            contextUI.clearRect(25, 100, 950, 100);
            gameData.messages.splice(i, 1);
        }
    }
}

function renderTiles(tFrame) {
    for (let n = 0; n < gameData.tiles.length; n++) {
        let tile = gameData.tiles[n];
        let image = gameData.cards[tile.card][tile.image];
        if (! tile.rendered) {
            if (tile.hidden) {
                contextGame.drawImage(gameData.back,
                                      tile.x, tile.y,
                                      gameData.x_width, gameData.y_width);
            } else {
                contextGame.drawImage(image,
                                      tile.x, tile.y,
                                      gameData.x_width, gameData.y_width);
            }
        }
    }
}

/* From http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml */
function preloadImages(image_files) {
    let loaded_images = 0;
    let failed_images = 0;
    let post_loaded = function() {}

    let images = [];

    function image_loaded(i, image_succeeded) {
        if (image_succeeded) {
            loaded_images++;
        } else {
            failed_images++;
        }

        if (loaded_images + failed_images == image_files.length) {
            if (failed_images > 0) {
                alert("Some images failed to load");
            }
            post_loaded(images);
        }
    }

    /* Loop over image files and load them. For each specify the
     * `image_loaded` function for the `onload` event to keep track of
     * how many images are already loaded. */
    for (let i = 0; i < image_files.length; i++) {
        images.push(new Image())
        images[i].src = image_files[i];
        images[i].onload = function(i) { image_loaded(i, true); }
        images[i].onerror = function(i) { image_loaded(i, false); }
    }

    /* Add a `done` method and return the empty function or the
     * function passed into `preloadImages()` function as argument. */
    return {
        done: function(f) {
            post_loaded = f || post_loaded;
        }
    }
}

function get_mouse_position(canvas, event) {
    let canvas_rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - canvas_rect.left)
            / (canvas_rect.right - canvas_rect.left) * 1000,
        y: (event.clientY - canvas_rect.top)
            / (canvas_rect.bottom - canvas_rect.top) * 1000
    }
}

function message(msg) {
    gameData.messages.push({
        message: msg,
        timestamp: performance.now(),
        rendered: false
    });
}

function flipTile(n) {
    gameData.chosenTiles.push(n);
    gameData.tiles[n].hidden = !gameData.tiles[n].hidden;
    gameData.tiles[n].rendered = false;

    if (gameData.chosenTiles.length == gameData.numberImagesPerCard) {
        let foundMatch = true;
        for (let i = 0; i < gameData.numberImagesPerCard - 1; i++) {
            if (gameData.tiles[gameData.chosenTiles[i]].card
                != gameData.tiles[gameData.chosenTiles[i + 1]].card) {
                foundMatch = false;
                break;
            }
        }

        if (foundMatch) {
            message("Found match!");
        } else {
            message("The two tiles did not match!");
        }
    }
}

cUI.onclick = function(e) {
    mouse_position = get_mouse_position(cUI, e);
    for (let n = 0; n < gameData.tiles.length; n++) {
        if (mouse_position.x >= gameData.tiles[n].x &&
            mouse_position.x <= gameData.tiles[n].x + gameData.x_width &&
            mouse_position.y >= gameData.tiles[n].y &&
            mouse_position.y <= gameData.tiles[n].y + gameData.y_width)
        {
            if (gameData.messages.length == 0) {
                flipTile(n);
            }
            break;
        }
    }
}
