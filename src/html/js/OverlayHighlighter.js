/* The overlay that's on top of the page when capturing mouse coordinates and after putting
the cropped image on the page. */

/* Element references */
var overlay = document.querySelector("[data-behavior~='mouse_move']"),
crosshairs = document.querySelector("[data-behavior~='position_mouse']");

var isMouseDown = false,
    windowWidth = $(window).width(),
    windowHeight = $(window).height(),
    startX,
    startY,
    endY,
    endX,
    coordinates = {},
    borderWidth;

window.rrremarkOverlayCoordinates = coordinates;

$(document).mousedown(function (e) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;

    $(document).trigger("rrremark:mouseDown");

});

$(document).mousemove(function (e) {

    crosshairs.style.left = e.clientX + "px";
    crosshairs.style.top = e.clientY + "px";

    if (isMouseDown) {

        endY = e.clientY;
        endX = e.clientX;

        overlay.setAttribute('data-state', 'highlighting');

        /* Change how the borderWidth is being calculated based on the x and y values. */
        if (endX >= startX && endY >= startY) {

            coordinates.startX = startX;
            coordinates.endX = endX;
            coordinates.startY = startY;
            coordinates.endY = endY;

            borderWidth = startY + "px " + (windowWidth - endX) + "px " + (windowHeight - endY) + "px " + startX + "px";
            overlay.style.borderWidth = borderWidth;

        } else if (endX <= startX && endY >= startY) {

            coordinates.startX = endX;
            coordinates.endX = startX;
            coordinates.startY = startY;
            coordinates.endY = endY;

            borderWidth = startY + "px " + (windowWidth - startX) + "px " + (windowHeight - endY) + "px " + endX + "px";

            overlay.style.borderWidth = borderWidth;

        } else if (endX >= startX && endY <= startY) {

            coordinates.startX = startX;
            coordinates.endX = endX;
            coordinates.startY = endY;
            coordinates.endY = startY;

            borderWidth = endY + "px " + (windowWidth - endX) + "px " + (windowHeight - startY) + "px " + startX + "px";

            overlay.style.borderWidth = borderWidth;

        } else if (endX <= startX && endY <= startY) {

            coordinates.startX = endX;
            coordinates.endX = startX;
            coordinates.startY = endY;
            coordinates.endY = startY;

            borderWidth = endY + "px " + (windowWidth - startX) + "px " + (windowHeight - startY) + "px " + endX + "px";

            overlay.style.borderWidth = borderWidth;

        }

    }
});

$(document).mouseup(function (e) {

    isMouseDown = false;

    overlay.removeAttribute('style');
    overlay.removeAttribute('data-state');

    $(document).trigger("rrremark:mouseUp", [coordinates]);

});

$(document).on("rrremark:shutdown", function () {
    console.log("Firing off the shutdown event.");
    // Hmm, if I'm going to be taking care of templates through mustache templates, how exactly am I gonna remove and re-add them? Tired. Can't think.
});