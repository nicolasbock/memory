/* https://developer.mozilla.org/en-US/docs/Games/Anatomy
 *
 * GameData.lastRender
 *     keeps track of the last provided requestAnimationFrame
 *     timestamp.
 * GameData.lastUpdate
 *     keeps track of the last update time. Always increments by
 *     updateInterval.
 * GameData.updateInterval
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
 *     GameData.updateInterval unless a pause feature is added, etc.)
 *
 * setInitialState()
 *     Performs whatever tasks are leftover before the mainloop must
 *     run.
 */

var GameData = {};

;(function() {
    function main(tFrame) {
        GameData.stopMain = window.requestAnimationFrame(main);
        var nextUpdate = GameData.lastUpdate + GameData.updateInterval;
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
            var timeSinceUpdate = tFrame - GameData.lastUpdate;
            numUpdates = Math.floor(timeSinceUpdate / GameData.updateInterval);
        }

        queueUpdates(numUpdates);
        render(tFrame);
        GameData.lastRender = tFrame;
    }

    function queueUpdates(numUpdates) {
        for(var i = 0; i < numUpdates; i++) {
            GameData.lastUpdate = GameData.lastUpdate + GameData.updateInterval; // Now lastUpdate is this tick.
            update(GameData.lastUpdate);
        }
    }

    GameData.lastUpdate = performance.now();
    GameData.lastRender = GameData.lastUpdate; // Pretend the first draw was on first update.
    GameData.updateInterval = 50; // This sets your simulation to run at 20Hz (50ms)

    setInitialState();
    main(performance.now()); // Start the cycle
})();

function setInitialState() {
}

function update(lastUpdate) {
}

function render(tFrame) {
}
