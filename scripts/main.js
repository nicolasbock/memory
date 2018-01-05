function preload_images() {
    let images = [];
    let loaded_images = 0;

    let image_files = [
        "images/Skull.png",
        "images/House 1.png",
        "images/House 2.png",
        "images/House 3.png"
    ];

    function image_loaded() {
        loaded_images++;
        if (loaded_images == image_files.length) {
            post_loaded(images);
        }
    }

    for (i = 0; i < image_files.length; i++) {
        images.push(new Image())
        images[i].src = image_files[i];
        images[i].onload = function() {
            image_loaded();
        }
    }

    return {
        done:function(f) {
            post_loaded = f || post_loaded;
        }
    }
}

/* Get cavas context. */
let c = document.getElementById("canvas").getContext("2d");

/* Preload all images. */
preload_images().done(function(images) {

    c.drawImage(images[0], 5, 5, 40, 40);
    c.drawImage(images[1], 55, 5, 40, 40);

})
