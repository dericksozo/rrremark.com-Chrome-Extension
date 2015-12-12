(function () {
    var applicationId;
    var coordinates = {}; // The coordinates, width, height, etc. captured from the mouse will go in here.
    let EXTENSION_ACTIVE = false; // Determines whether the extension is on or off.
    let ESC_KEY = 27; // The keycode for the escape key.

    const CROSSHAIR_CLASS = "Screenshot--crossHair";

    let overlay, // The overlay that's on top of the page when capturing mouse coordinates and after putting
                //  the cropped image on the page.
        croppedImage, // The cropped image element.
        container;

    function captureMouseEvents() {

        if ( ! EXTENSION_ACTIVE) {

            EXTENSION_ACTIVE = true; // It's active, so don't turn it on anymore.

            container = cre('iframe', {
                style: {
                    // This is really just paranoia, but we want to be above
                    //          *** ABSOLUTELY EVERYTHING. ***
                    // If the content document has fixed elements with high z-indexes, well,
                    // we just have to use z-indexes that are higher!
                    // http://stackoverflow.com/questions/491052/mininum-and-maximum-value-of-z-index
                    zIndex: 0x7FFFFFFF,
                    boxSizing: 'border-box',
                    position: 'fixed',
                    width: '100%',
                    height: '100%',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    margin: '0',
                    padding: '0',
                    border: 'none',
                    background: 'transparent'
                }
            });

            document.body.appendChild(container);

            overlay = createOverlay();

            // var $crossHair = createCrossHair();

            var isMouseDown = false;

            var startX, startY;
            var endX, endY;

            /* Creating the Overlay element to be placed on the screen. */
            function createOverlay() {
                var overlay = container.contentDocument.createElement('div');
                    overlay.style.position = 'fixed'; // allows it to move with scroll
                    overlay.style.boxSizing = "border-box";
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.right = '0';
                    overlay.style.bottom = '0';
                    overlay.style.padding = '0';
                    overlay.style.margin = '0';
                    /* overlay.style.width = window.innerWidth + "px";
                    overlay.style.height = window.innerHeight + "px"; */
                    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

                container.contentDocument.body.appendChild(overlay);
                return overlay;
            }

            /* function createCrossHair() {

                var $crossHair = $("<div/>");

                $crossHair.addClass("ScreenshotApp--crossHair");

                $("body").append($crossHair);

                return $crossHair;
            } */

            /* Events */
            function mouseDown(e) {
                isMouseDown = true;

                startX = e.clientX;
                startY = e.clientY;
            }

            function mouseMove(e) {

                if (isMouseDown) {

                    endY = e.clientY;
                    endX = e.clientX;

                    /* crossHair.style.left = e.clientX;
                    crossHair.style.top = e.clientY; */

                    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    overlay.style.borderColor = "rgba(0, 0, 0, 0.3)";
                    overlay.style.borderStyle = "solid";

                    /* Change how the borderWidth is being calculated based on the x and y values. */
                    if ( endX >= startX && endY >= startY) {

                        // Appropriately normalize the coordinates so have an easier time cropping the image later.
                        coordinates.startX = startX;
                        coordinates.endX = endX;
                        coordinates.startY = startY;
                        coordinates.endY = endY;

                        overlay.style.borderWidth = startY + "px " + (window.innerWidth - endX) + "px " + (window.innerHeight - endY) + "px " + startX + "px";

                    } else if (endX <= startX && endY >= startY ){

                        coordinates.startX = endX;
                        coordinates.endX = startX;
                        coordinates.startY = startY;
                        coordinates.endY = endY;

                        overlay.style.borderWidth = startY + "px " + (window.innerWidth - startX) + "px " + (window.innerHeight - endY) + "px " + endX + "px";
                    } else if (endX >= startX && endY <= startY ) {

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
            }

            function mouseUp(e) {
                isMouseDown = false;

                console.log("Mouse up, now we're about to fire the chrome.runtime.sendMessage function.");
                chrome.runtime.sendMessage(applicationId, {action: "takeScreenshot"});
            }

            /* This function takes care of removing elements and events if the user hits ESC. */
            function shutdown() {

                // Remove the iframe from the document
                window.document.body.removeChild(container);

                // Set the extension to false so we can open it again.
                EXTENSION_ACTIVE = false;

            }

            /* Set up the events on overlay. */
            overlay.addEventListener('mousedown', mouseDown, false);
        	overlay.addEventListener('mousemove', mouseMove, false);
        	overlay.addEventListener('mouseup', mouseUp, false);

            /* Listening for the ESC key being pressed. */
            window.document.addEventListener('keydown', (e) => {
                let key = e.keyCode || e.which;

                if ( key === ESC_KEY) {
                    console.log("You pressed the escape key!");
                    shutdown();
                }

            }, false);
        }

    }

    function screenShotComplete(imageData) {

        const canvas = document.createElement('canvas'),
              context = canvas.getContext('2d'),
              imageObj = new Image();

        // draw cropped image
        imageObj.onload = () => {

            let coordinatesWidth = coordinates.endX - coordinates.startX;
            let coordinatesHeight = coordinates.endY - coordinates.startY;

            let {startX, startY, endX, endY} = coordinates;

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
            image.onload = () => {

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

            let transform = 'translate3d(-50%,0,0) translateZ(0)';
            let croppedImageTransform = "translateZ(0)";
            let transition = "all 500ms cubic-bezier(0.455, 0.030, 0.515, 0.955)";

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


            let transform = 'translate3d(-50%,0,0) translateZ(0)';
            let transition = "all 500ms cubic-bezier(0.455, 0.030, 0.515, 0.955)";

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