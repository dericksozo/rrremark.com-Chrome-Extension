(function () {

    var applicationId,
        coordinates = {},// The coordinates, width, height, etc. captured from the mouse will go in here.
        EXTENSION_ACTIVE = false, // Determines whether the extension is on or off.
        ESC_KEY = 27, // The keycode for the escape key.
        CROSSHAIR_CLASS = "Screenshot--crossHair";

    var overlay = require("./modules/OverlayHighlighter.js"),
        filterSelect = require("./modules/FilterSelect.js"),
        croppedImage; // The cropped image element.



    function captureMouseEvents() {

        if ( ! EXTENSION_ACTIVE) {

            overlay();

            EXTENSION_ACTIVE = true; // It's active, so don't turn it on anymore.


            /* This function takes care of removing elements and events if the user hits ESC. */
            function shutdown() {

                $(document).trigger("rrremark:shutdown");

                // Set the extension to false so we can open it again.
                EXTENSION_ACTIVE = false;

            }

            /* Listening for the ESC key being pressed. */
            window.document.addEventListener('keydown', function (e) {
                var key = e.keyCode || e.which;
                if ( key === ESC_KEY) {
                    shutdown();
                }
            }, false);
        }

    }

    function screenShotComplete(imageData) {

        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            imageObj = new Image();

        // draw cropped image
        imageObj.onload = function () {

            var coordinatesWidth = coordinates.endX - coordinates.startX,
                coordinatesHeight = coordinates.endY - coordinates.startY;

            var startX = coordinates.startX,
                startY = coordinates.startY,
                endX = coordinates.endX,
                endY = coordinates.endY;

            canvas.width = coordinatesWidth;
            canvas.height = coordinatesHeight;

            context.drawImage(imageObj, coordinates.startX, coordinates.startY, coordinatesWidth, coordinatesHeight, 0, 0, coordinatesWidth, coordinatesHeight);

            // Pass the cropped image into the next step.
            positionCroppedImage(canvas.toDataURL("image/png"));
        };

        imageObj.src = imageData;

        console.log("imageData", imageData);
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
                container.contentDocument.body.appendChild(image);

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
                left: ( $(window).width() / 2 ) - ( $(croppedImage).outerWidth()  / 2 )
            }, 250, "easeOutQuad");

            // createAndPositionInputs();
        }

        function createAndPositionInputs() {


            var transform = 'translate3d(-50%,0,0) translateZ(0)',
                transition = "all 500ms cubic-bezier(0.455, 0.030, 0.515, 0.955)";

            var textArea = document.createElement('textarea');

            textArea.style.position = "fixed";
            textArea.style.top = (parseInt(croppedImage.style.top.split("px")[0], 10) + croppedImage.offsetHeight) + "px";
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