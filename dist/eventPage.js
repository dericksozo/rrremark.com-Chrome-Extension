(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZXZlbnRQYWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdGFiSWQ7XG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcblxuICAgICAgICBzd2l0Y2ggKHJlcXVlc3QuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFwidGFrZVNjcmVlbnNob3RcIjpcbiAgICAgICAgICAgICAgICAvLyBEb24ndCByZXR1cm4gYW55dGhpbmcgaGVyZSwgaW5zdGVhZCBqdXN0IHNlbmQgYmFjayBhIG1lc3NhZ2UgdG8gdGhlIGNvbnRlbnRfc2NyaXB0IGZyb21cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgICAgICAgIHRha2VTY3JlZW5zaG90KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gdGFrZVNjcmVlbnNob3QoKSB7XG4gICAgXHRjaHJvbWUudGFicy5jYXB0dXJlVmlzaWJsZVRhYihudWxsLCB7Zm9ybWF0OidwbmcnfSwgZnVuY3Rpb24oaW1nRGF0YSkge1xuICAgICAgICAgICAgLyogR29pbmcgdG8gc2VuZCBhIG1lc3NhZ2UgYmFjayB0byB0aGUgY29udGVudF9zY3JpcHQgd2l0aCB0aGUgaW1hZ2UgZGF0YS4gKi9cbiAgICAgICAgICAgIC8vIFdpbGwgdGhpcyB3b3JrPyBJJ20gbm90IHN1cmUgYmVjYXVzZSBJJ20gc2VuZGluZyBzZW5kaW5nIHRoZSBpbWFnZSBkYXRhIGFzIGEgZGF0YSBwYXJhbWV0ZXIuXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge2FjdGlvbjogXCJzY3JlZW5TaG90Q29tcGxldGVcIiwgaW1hZ2VEYXRhOiBpbWdEYXRhfSk7XG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICBjaHJvbWUudGFicy5vbkFjdGl2ZUNoYW5nZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiSWQsc2VsZWN0SW5mbyl7XG4gICAgICAgIHRhYklkID0gdGFiSWQ7XG4gICAgfSk7XG5cbiAgICAvKlxuICAgIFRPRE86IDEuIChDT01QTEVURSkgRmlndXJlIG91dCBob3cgdG8gbWFrZSBpdCBzbyB5b3UgY2FuIHByZXNzIHRoZSBFU0Mga2V5IGFuZCBnZXQgb3V0IG9mIFwic2NyZWVuc2hvdCBtb2RlXCJcbiAgICAgICAgICAyLiAoQ09NUExFVEUpIEZpZ3VyZSBvdXQgaG93IHRvIG1ha2UgaXQgc28gY2xpY2tpbmcgdGhlIGV4dGVuc2lvbiBhbnkgYW1vdW50IG9mIHRpbWVzIHdpbGwgb25seSBldmVyIG1ha2UgdGhlXG4gICAgICAgICAgICAgdGhlIG92ZXJsYXkgYXBwZWFyIG9uY2UuXG4gICAgICAgICAgMy4gTWFrZSBpdCBzbyB0aGUgaW1hZ2UgbW92ZXMgdG8gdGhlIG1pZGRsZSBvZiB0aGUgcGFnZVxuICAgICovXG5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYikgeyAvLyBDbGljayB0aGUgZXh0ZW5zaW9uIGljb24uXG4gICAgICAgIHRhYklkID0gdGFiLmlkO1xuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtzb3VyY2VfdXJsOnRhYi51cmwsIGFjdGlvbjogXCJjYXB0dXJlXCJ9KTtcbiAgICB9KTtcblxufSkoKTsiXX0=
