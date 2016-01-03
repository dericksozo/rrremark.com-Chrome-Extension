var applicationId = applicationId = chrome.i18n.getMessage('@@extension_id'),
    coordinates = {},// The coordinates, width, height, etc. captured from the mouse will go in here.
    EXTENSION_ACTIVE = false, // Determines whether the extension is on or off.
    ESC_KEY = 27, // The keycode for the escape key.
    CROSSHAIR_CLASS = "Screenshot--crossHair";

var croppedImage; // The cropped image element.

function captureMouseEvents() {

    $.get(chrome.extension.getURL('/html/main.html'), function(data) {
        console.log("Inside the get request from the script");
        console.log("What's data?", data);
    });

    if ( ! EXTENSION_ACTIVE) {

        EXTENSION_ACTIVE = true; // It's active, so don't turn it on anymore.

        /* Listening for the ESC key being pressed. */
        $(document).keydown(function (e) {
            var key = e.keyCode || e.which;
            if ( key === ESC_KEY) {

                $(document).trigger("rrremark:shutdown");

                // Set the extension to false so we can open it again.
                EXTENSION_ACTIVE = false;

            }
        });
    }

}

function onExtensionMessage(request, sender, sendResponse) {
    
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

chrome.runtime.onMessage.addListener(onExtensionMessage);