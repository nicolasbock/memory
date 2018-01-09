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
let c = document.getElementById("canvas")
let ctx = document.getElementById("canvas").getContext("2d");

let canvas_rect = canvas.getBoundingClientRect();
let mouse_position = { x: 0, y: 0 }

var gameData = {
    /* The image files. */
    image_files: [
        "images/back.png",
        "images/Skull.png",
        "images/Skull.png",
        "images/Skull.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/Truck.png",
        "images/House 1.png",
        "images/House 2.png",
        "images/House 3.png"
    ]
};

(function() {
    function main(tFrame) {
        gameData.stopMain = window.requestAnimationFrame(main);
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

    gameData.lastUpdate = performance.now();
    gameData.lastRender = gameData.lastUpdate; // Pretend the first
                                               // draw was on first
                                               // update.
    gameData.updateInterval = 50; // This sets your simulation to run
                                  // at 20Hz (50ms)

    setInitialState();
    main(performance.now()); // Start the cycle
})();

function setInitialState() {
    debugger;

    /* Start loading the images. */
    preloadImages(gameData.image_files).done(function() {
        gameData.imagesLoaded = true;
    });
}

function update(lastUpdate) {
}

function render(tFrame) {
}

/* From http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml */
function preloadImages(image_files) {
    let images = [];
    let loaded_images = 0;
    let failed_images = 0;

    function image_loaded(image_succeeded) {
        if (image_succeeded) {
            loaded_images++;
        } else {
            failed_images++;
        }

        if (loaded_images + failed_images == image_files.length) {
            post_loaded(images);
        }
    }

    /* Loop over image files and load them. For each specify the
     * `image_loaded` function for the `onload` event to keep track of
     * how many images are already loaded. */
    for (i = 0; i < image_files.length; i++) {
        images.push(new Image())
        images[i].src = image_files[i];
        images[i].onload = image_loaded(true);
        images[i].onerror = image_loaded(false);
    }

    /* Add a `done` method and return the empty function or the
     * function passed into `preloadImages()` function as argument. */
    return {
        done: function(f) {
            post_loaded = f || function() {};
        }
    }
}

function get_mouse_position(canvas, event) {
    return {
        x: (event.clientX - canvas_rect.left) / (canvas_rect.right - canvas_rect.left) * 1000,
        y: (event.clientY - canvas_rect.top) / (canvas_rect.bottom - canvas_rect.top) * 1000
    }
}
