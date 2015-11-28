(function () {

    var tabId;

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        switch (request.action) {
            case "takeScreenshot":
                // Don't return anything here, instead just send back a message to the content_script from
                // this function.
                takeScreenshot();
                break;
            default:
                return;
        }
    });

    function takeScreenshot() {
    	chrome.tabs.captureVisibleTab(null, {format:'png'}, function(imgData) {
            /* Going to send a message back to the content_script with the image data. */
            // Will this work? I'm not sure because I'm sending sending the image data as a data parameter.
            chrome.tabs.sendMessage(tabId, {action: "screenShotComplete", imageData: imgData});
    	});
    }

    chrome.tabs.onActiveChanged.addListener(function(tabId,selectInfo){
        tabId = tabId;
    });

    /*
    TODO: 1. (COMPLETE) Figure out how to make it so you can press the ESC key and get out of "screenshot mode"
          2. (COMPLETE) Figure out how to make it so clicking the extension any amount of times will only ever make the
             the overlay appear once.
          3. Make it so the image moves to the middle of the page
    */

    chrome.browserAction.onClicked.addListener(function (tab) { // Click the extension icon.
        tabId = tab.id;
        chrome.tabs.sendMessage(tab.id, {source_url:tab.url, action: "capture"});
    });

})();