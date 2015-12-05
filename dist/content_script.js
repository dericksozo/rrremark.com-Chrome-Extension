'use strict';

(function () {
    var applicationId;
    var coordinates = {}; // The coordinates, width, height, etc. captured from the mouse will go in here.
    var EXTENSION_ACTIVE = false; // Determines whether the extension is on or off.
    var ESC_KEY = 27; // The keycode for the escape key.

    var overlay = undefined,
        // The overlay that's on top of the page when capturing mouse coordinates and after putting
    //  the cropped image on the page.
    croppedImage = undefined; // The cropped image element.

    function captureMouseEvents() {

        if (!EXTENSION_ACTIVE) {
            var isMouseDown;
            var startX, startY;
            var endX, endY;

            (function () {

                /* Creating the Overlay element to be placed on the screen. */

                var createOverlay = function createOverlay() {

                    var overlay = window.document.createElement('div');
                    overlay.style.position = 'fixed'; // allows it to move with scroll
                    overlay.style.zIndex = '2174859';
                    overlay.style.boxSizing = "border-box";
                    overlay.style.top = '0px';
                    overlay.style.left = '0px';
                    overlay.style.padding = '0px';
                    overlay.style.margin = '0px';
                    overlay.style.width = window.innerWidth + "px";
                    overlay.style.height = window.innerHeight + "px";
                    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

                    window.document.body.appendChild(overlay);

                    return overlay;
                };

                /* function createCrossHair() {
                    var crossHair = window.document.createElement('div');
                        crossHair.style.position = "fixed";
                        crossHair.style.width = window.innerWidth + "px";
                        crossHair.style.height = window.innerHeight + "px";
                        crossHair.style.zIndex = "2174861";
                         crossHair.classList.add("ScreenshotApp--crossHair");
                     window.document.body.appendChild(crossHair);
                     return crossHair;
                } */

                /* Events */

                var mouseDown = function mouseDown(e) {
                    isMouseDown = true;

                    startX = e.clientX;
                    startY = e.clientY;
                };

                var mouseMove = function mouseMove(e) {

                    if (isMouseDown) {

                        endY = e.clientY;
                        endX = e.clientX;

                        /* crossHair.style.left = e.clientX;
                        crossHair.style.top = e.clientY; */

                        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        overlay.style.borderColor = "rgba(0, 0, 0, 0.3)";
                        overlay.style.borderStyle = "solid";

                        /* Change how the borderWidth is being calculated based on the x and y values. */
                        if (endX >= startX && endY >= startY) {

                            // Appropriately normalize the coordinates so have an easier time cropping the image later.
                            coordinates.startX = startX;
                            coordinates.endX = endX;
                            coordinates.startY = startY;
                            coordinates.endY = endY;

                            overlay.style.borderWidth = startY + "px " + (window.innerWidth - endX) + "px " + (window.innerHeight - endY) + "px " + startX + "px";
                        } else if (endX <= startX && endY >= startY) {

                            coordinates.startX = endX;
                            coordinates.endX = startX;
                            coordinates.startY = startY;
                            coordinates.endY = endY;

                            overlay.style.borderWidth = startY + "px " + (window.innerWidth - startX) + "px " + (window.innerHeight - endY) + "px " + endX + "px";
                        } else if (endX >= startX && endY <= startY) {

                            coordinates.startX = startX;
                            coordinates.endX = endX;
                            coordinates.startY = endY;
                            coordinates.endY = startY;

                            overlay.style.borderWidth = endY + "px " + (window.innerWidth - endX) + "px " + (window.innerHeight - startY) + "px " + startX + "px";
                        } else if (endX <= startX && endY <= startY) {

                            coordinates.startX = endX;
                            coordinates.endX = startX;
                            coordinates.startY = endY;
                            coordinates.endY = startY;

                            overlay.style.borderWidth = endY + "px " + (window.innerWidth - startX) + "px " + (window.innerHeight - startY) + "px " + endX + "px";
                        }
                    }
                };

                var mouseUp = function mouseUp(e) {
                    isMouseDown = false;

                    console.log("Mouse up, now we're about to fire the chrome.runtime.sendMessage function.");
                    chrome.runtime.sendMessage(applicationId, { action: "takeScreenshot" });
                };

                /* This function takes care of removing elements and events if the user hits ESC. */

                var shutdown = function shutdown() {

                    // Remove event listeners from overlay.
                    overlay.addEventListener('mousedown', mouseDown, false);
                    overlay.addEventListener('mousemove', mouseMove, false);
                    overlay.addEventListener('mouseup', mouseUp, false);

                    // Remove overlay element from the document.
                    window.document.body.removeChild(overlay);

                    // Set the extension to false so we can open it again.
                    EXTENSION_ACTIVE = false;
                };

                /* Set up the events on overlay. */

                EXTENSION_ACTIVE = true; // It's active, so don't turn it on anymore.

                overlay = createOverlay();
                // var crossHair = createCrossHair();

                isMouseDown = false;
                overlay.addEventListener('mousedown', mouseDown, false);
                overlay.addEventListener('mousemove', mouseMove, false);
                overlay.addEventListener('mouseup', mouseUp, false);

                /* Listening for the ESC key being pressed. */
                window.document.addEventListener('keydown', function (e) {
                    var key = e.keyCode || e.which;

                    if (key === ESC_KEY) {
                        console.log("You pressed the escape key!");
                        shutdown();
                    }
                }, false);
            })();
        }
    }

    function screenShotComplete(imageData) {

        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            imageObj = new Image();

        // draw cropped image
        imageObj.onload = function () {

            var coordinatesWidth = coordinates.endX - coordinates.startX;
            var coordinatesHeight = coordinates.endY - coordinates.startY;

            var startX = coordinates.startX;
            var startY = coordinates.startY;
            var endX = coordinates.endX;
            var endY = coordinates.endY;

            canvas.width = coordinatesWidth;
            canvas.height = coordinatesHeight;

            context.drawImage(imageObj, coordinates.startX, coordinates.startY, coordinatesWidth, coordinatesHeight, 0, 0, coordinatesWidth, coordinatesHeight);

            // Pass the cropped image into the next step.
            positionCroppedImage(canvas.toDataURL("image/png"));
        };

        imageObj.src = imageData;
    }

    /* Positions the cropped image on the page and then animates it into the middle. */
    function positionCroppedImage(imageSource) {

        createImage();

        function createImage() {
            var image = new Image();

            // draw cropped image
            image.onload = function () {

                image.style.position = "fixed"; // allows it to move with scroll
                image.style.zIndex = "2174869";
                image.style.boxSizing = "border-box";
                image.style.display = "block";

                // image.style.top = coordinates.startY + "px";
                // image.style.left = coordinates.startX + "px";

                image.style.top = coordinates.startY + "px";
                image.style.left = coordinates.startX + "px";

                // Place the image into the dom.
                window.document.body.appendChild(image);

                croppedImage = image;
                positionElements();
            };

            image.src = imageSource;
        }

        /* Removes all border width from overlay and fades it to white. Positions the image in the middle of
           the screen. */
        function positionElements() {

            var transform = 'translate3d(-50%,0,0) translateZ(0)';
            var croppedImageTransform = "translateZ(0)";
            var transition = "all 500ms cubic-bezier(0.455, 0.030, 0.515, 0.955)";

            overlay.style.border = "none";
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            overlay.style.webkitTransition = transition;
            overlay.style.transition = transition;
            // This will animate to white over the period of 1 second.
            overlay.style.backgroundColor = 'rgba(255, 255, 255, 1)';

            croppedImage.style.boxShadow = "5px 5px 10px rgba(0, 0, 0, 0.5)";
            croppedImage.style.maxWidth = "90%";
            croppedImage.style.maxHeight = "50%";

            $(croppedImage).animate({
                top: 10,
                left: $(window).width() / 2 - $(croppedImage).outerWidth() / 2
            }, 250);

            createAndPositionInputs();
        }

        function createAndPositionInputs() {

            var transform = 'translate3d(-50%,0,0) translateZ(0)';
            var transition = "all 500ms cubic-bezier(0.455, 0.030, 0.515, 0.955)";

            var textArea = document.createElement('textarea');

            textArea.style.position = "fixed";
            textArea.style.top = parseInt(croppedImage.style.top.split("px")[0], 10) + croppedImage.offsetHeight + "px";
            textArea.style.left = "50%";
            textArea.style.transform = transform;
            textArea.style.webkitTransform = transform;
            textArea.style.zIndex = "2174889";
            textArea.style.boxSizing = "border-box";
            textArea.style.display = "block";

            textArea.style.transition = transition;
            textArea.style.webkitTransition = transition;

            window.document.body.appendChild(textArea);
        }
    }

    function onExtensionMessage(request, sender, sendResponse) {

        // console.log("What's the request?", request);
        // console.log("What's the sender?", sender);
        // console.log("What's sendResponse", sendResponse);

        switch (request.action) {
            case 'capture':
                captureMouseEvents();
                break;
            case 'screenShotComplete':
                console.log("We completed the screenshot!");
                screenShotComplete(request.imageData);
                break;
            default:
                return;
        }
    }

    function initialize() {
        applicationId = chrome.i18n.getMessage('@@extension_id');
        chrome.runtime.onMessage.addListener(onExtensionMessage);
    }

    initialize();
})();
//# sourceMappingURL=content_script.js.map
