(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./modules/FilterSelect.js":2,"./modules/OverlayHighlighter.js":3}],2:[function(require,module,exports){
'use strict';

module.exports = function () {
    console.log("Hello world!");
};
},{}],3:[function(require,module,exports){
'use strict';

/* The overlay that's on top of the page when capturing mouse coordinates and after putting
   the cropped image on the page. */
module.exports = function () {
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
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbW9kdWxlcy9GaWx0ZXJTZWxlY3QuanMiLCJzcmMvbW9kdWxlcy9PdmVybGF5SGlnaGxpZ2h0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFwcGxpY2F0aW9uSWQsXG4gICAgICAgIGNvb3JkaW5hdGVzID0ge30sLy8gVGhlIGNvb3JkaW5hdGVzLCB3aWR0aCwgaGVpZ2h0LCBldGMuIGNhcHR1cmVkIGZyb20gdGhlIG1vdXNlIHdpbGwgZ28gaW4gaGVyZS5cbiAgICAgICAgRVhURU5TSU9OX0FDVElWRSA9IGZhbHNlLCAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGV4dGVuc2lvbiBpcyBvbiBvciBvZmYuXG4gICAgICAgIEVTQ19LRVkgPSAyNywgLy8gVGhlIGtleWNvZGUgZm9yIHRoZSBlc2NhcGUga2V5LlxuICAgICAgICBDUk9TU0hBSVJfQ0xBU1MgPSBcIlNjcmVlbnNob3QtLWNyb3NzSGFpclwiO1xuXG4gICAgdmFyIG92ZXJsYXkgPSByZXF1aXJlKFwiLi9tb2R1bGVzL092ZXJsYXlIaWdobGlnaHRlci5qc1wiKSxcbiAgICAgICAgZmlsdGVyU2VsZWN0ID0gcmVxdWlyZShcIi4vbW9kdWxlcy9GaWx0ZXJTZWxlY3QuanNcIiksXG4gICAgICAgIGNyb3BwZWRJbWFnZTsgLy8gVGhlIGNyb3BwZWQgaW1hZ2UgZWxlbWVudC5cblxuXG5cbiAgICBmdW5jdGlvbiBjYXB0dXJlTW91c2VFdmVudHMoKSB7XG5cbiAgICAgICAgaWYgKCAhIEVYVEVOU0lPTl9BQ1RJVkUpIHtcblxuICAgICAgICAgICAgb3ZlcmxheSgpO1xuXG4gICAgICAgICAgICBFWFRFTlNJT05fQUNUSVZFID0gdHJ1ZTsgLy8gSXQncyBhY3RpdmUsIHNvIGRvbid0IHR1cm4gaXQgb24gYW55bW9yZS5cblxuXG4gICAgICAgICAgICAvKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGNhcmUgb2YgcmVtb3ZpbmcgZWxlbWVudHMgYW5kIGV2ZW50cyBpZiB0aGUgdXNlciBoaXRzIEVTQy4gKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNodXRkb3duKCkge1xuXG4gICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInJycmVtYXJrOnNodXRkb3duXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBleHRlbnNpb24gdG8gZmFsc2Ugc28gd2UgY2FuIG9wZW4gaXQgYWdhaW4uXG4gICAgICAgICAgICAgICAgRVhURU5TSU9OX0FDVElWRSA9IGZhbHNlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIExpc3RlbmluZyBmb3IgdGhlIEVTQyBrZXkgYmVpbmcgcHJlc3NlZC4gKi9cbiAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG4gICAgICAgICAgICAgICAgaWYgKCBrZXkgPT09IEVTQ19LRVkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNjcmVlblNob3RDb21wbGV0ZShpbWFnZURhdGEpIHtcblxuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICAgICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICBpbWFnZU9iaiA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIC8vIGRyYXcgY3JvcHBlZCBpbWFnZVxuICAgICAgICBpbWFnZU9iai5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBjb29yZGluYXRlc1dpZHRoID0gY29vcmRpbmF0ZXMuZW5kWCAtIGNvb3JkaW5hdGVzLnN0YXJ0WCxcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlc0hlaWdodCA9IGNvb3JkaW5hdGVzLmVuZFkgLSBjb29yZGluYXRlcy5zdGFydFk7XG5cbiAgICAgICAgICAgIHZhciBzdGFydFggPSBjb29yZGluYXRlcy5zdGFydFgsXG4gICAgICAgICAgICAgICAgc3RhcnRZID0gY29vcmRpbmF0ZXMuc3RhcnRZLFxuICAgICAgICAgICAgICAgIGVuZFggPSBjb29yZGluYXRlcy5lbmRYLFxuICAgICAgICAgICAgICAgIGVuZFkgPSBjb29yZGluYXRlcy5lbmRZO1xuXG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSBjb29yZGluYXRlc1dpZHRoO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGNvb3JkaW5hdGVzSGVpZ2h0O1xuXG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZU9iaiwgY29vcmRpbmF0ZXMuc3RhcnRYLCBjb29yZGluYXRlcy5zdGFydFksIGNvb3JkaW5hdGVzV2lkdGgsIGNvb3JkaW5hdGVzSGVpZ2h0LCAwLCAwLCBjb29yZGluYXRlc1dpZHRoLCBjb29yZGluYXRlc0hlaWdodCk7XG5cbiAgICAgICAgICAgIC8vIFBhc3MgdGhlIGNyb3BwZWQgaW1hZ2UgaW50byB0aGUgbmV4dCBzdGVwLlxuICAgICAgICAgICAgcG9zaXRpb25Dcm9wcGVkSW1hZ2UoY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaW1hZ2VPYmouc3JjID0gaW1hZ2VEYXRhO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW1hZ2VEYXRhXCIsIGltYWdlRGF0YSk7XG4gICAgfVxuXG4gICAgLyogUG9zaXRpb25zIHRoZSBjcm9wcGVkIGltYWdlIG9uIHRoZSBwYWdlIGFuZCB0aGVuIGFuaW1hdGVzIGl0IGludG8gdGhlIG1pZGRsZS4gKi9cbiAgICBmdW5jdGlvbiBwb3NpdGlvbkNyb3BwZWRJbWFnZShpbWFnZVNvdXJjZSkge1xuXG4gICAgICAgIGNyZWF0ZUltYWdlKCk7XG5cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVJbWFnZSgpIHtcbiAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgICAgICAvLyBkcmF3IGNyb3BwZWQgaW1hZ2VcbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gXCJmaXhlZFwiOyAvLyBhbGxvd3MgaXQgdG8gbW92ZSB3aXRoIHNjcm9sbFxuICAgICAgICAgICAgICAgIGltYWdlLnN0eWxlLnpJbmRleCA9IFwiMjE3NDg2OVwiO1xuICAgICAgICAgICAgICAgIGltYWdlLnN0eWxlLmJveFNpemluZyA9IFwiYm9yZGVyLWJveFwiO1xuICAgICAgICAgICAgICAgIGltYWdlLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cbiAgICAgICAgICAgICAgICAvLyBpbWFnZS5zdHlsZS50b3AgPSBjb29yZGluYXRlcy5zdGFydFkgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgLy8gaW1hZ2Uuc3R5bGUubGVmdCA9IGNvb3JkaW5hdGVzLnN0YXJ0WCArIFwicHhcIjtcblxuICAgICAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGNvb3JkaW5hdGVzLnN0YXJ0WSArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gY29vcmRpbmF0ZXMuc3RhcnRYICsgXCJweFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gUGxhY2UgdGhlIGltYWdlIGludG8gdGhlIGRvbS5cbiAgICAgICAgICAgICAgICBjb250YWluZXIuY29udGVudERvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gICAgICAgICAgICAgICAgY3JvcHBlZEltYWdlID0gaW1hZ2U7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25FbGVtZW50cygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2VTb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBSZW1vdmVzIGFsbCBib3JkZXIgd2lkdGggZnJvbSBvdmVybGF5IGFuZCBmYWRlcyBpdCB0byB3aGl0ZS4gUG9zaXRpb25zIHRoZSBpbWFnZSBpbiB0aGUgbWlkZGxlIG9mXG4gICAgICAgICAgIHRoZSBzY3JlZW4uICovXG4gICAgICAgIGZ1bmN0aW9uIHBvc2l0aW9uRWxlbWVudHMoKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoLTUwJSwwLDApIHRyYW5zbGF0ZVooMCknO1xuICAgICAgICAgICAgdmFyIGNyb3BwZWRJbWFnZVRyYW5zZm9ybSA9IFwidHJhbnNsYXRlWigwKVwiO1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSBcImFsbCA1MDBtcyBjdWJpYy1iZXppZXIoMC40NTUsIDAuMDMwLCAwLjUxNSwgMC45NTUpXCI7XG5cbiAgICAgICAgICAgIG92ZXJsYXkuc3R5bGUuYm9yZGVyID0gXCJub25lXCI7XG4gICAgICAgICAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsIDAsIDAsIDAuMyknO1xuICAgICAgICAgICAgb3ZlcmxheS5zdHlsZS53ZWJraXRUcmFuc2l0aW9uID0gdHJhbnNpdGlvbjtcbiAgICAgICAgICAgIG92ZXJsYXkuc3R5bGUudHJhbnNpdGlvbiA9IHRyYW5zaXRpb247XG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgYW5pbWF0ZSB0byB3aGl0ZSBvdmVyIHRoZSBwZXJpb2Qgb2YgMSBzZWNvbmQuXG4gICAgICAgICAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJztcblxuICAgICAgICAgICAgY3JvcHBlZEltYWdlLnN0eWxlLmJveFNoYWRvdyA9IFwiNXB4IDVweCAxMHB4IHJnYmEoMCwgMCwgMCwgMC41KVwiO1xuICAgICAgICAgICAgY3JvcHBlZEltYWdlLnN0eWxlLm1heFdpZHRoID0gXCI5MCVcIjtcbiAgICAgICAgICAgIGNyb3BwZWRJbWFnZS5zdHlsZS5tYXhIZWlnaHQgPSBcIjUwJVwiO1xuXG4gICAgICAgICAgICAkKGNyb3BwZWRJbWFnZSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAoICQod2luZG93KS53aWR0aCgpIC8gMiApIC0gKCAkKGNyb3BwZWRJbWFnZSkub3V0ZXJXaWR0aCgpICAvIDIgKVxuICAgICAgICAgICAgfSwgMjUwLCBcImVhc2VPdXRRdWFkXCIpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGVBbmRQb3NpdGlvbklucHV0cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlQW5kUG9zaXRpb25JbnB1dHMoKSB7XG5cblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgtNTAlLDAsMCkgdHJhbnNsYXRlWigwKScsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbiA9IFwiYWxsIDUwMG1zIGN1YmljLWJlemllcigwLjQ1NSwgMC4wMzAsIDAuNTE1LCAwLjk1NSlcIjtcblxuICAgICAgICAgICAgdmFyIHRleHRBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcblxuICAgICAgICAgICAgdGV4dEFyZWEuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG4gICAgICAgICAgICB0ZXh0QXJlYS5zdHlsZS50b3AgPSAocGFyc2VJbnQoY3JvcHBlZEltYWdlLnN0eWxlLnRvcC5zcGxpdChcInB4XCIpWzBdLCAxMCkgKyBjcm9wcGVkSW1hZ2Uub2Zmc2V0SGVpZ2h0KSArIFwicHhcIjtcbiAgICAgICAgICAgIHRleHRBcmVhLnN0eWxlLmxlZnQgPSBcIjUwJVwiO1xuICAgICAgICAgICAgdGV4dEFyZWEuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgICAgICAgICAgdGV4dEFyZWEuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgICAgICAgICAgdGV4dEFyZWEuc3R5bGUuekluZGV4ID0gXCIyMTc0ODg5XCI7XG4gICAgICAgICAgICB0ZXh0QXJlYS5zdHlsZS5ib3hTaXppbmcgPSBcImJvcmRlci1ib3hcIjtcbiAgICAgICAgICAgIHRleHRBcmVhLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cbiAgICAgICAgICAgIHRleHRBcmVhLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uO1xuICAgICAgICAgICAgdGV4dEFyZWEuc3R5bGUud2Via2l0VHJhbnNpdGlvbiA9IHRyYW5zaXRpb247XG5cbiAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRBcmVhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uRXh0ZW5zaW9uTWVzc2FnZShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiV2hhdCdzIHRoZSByZXF1ZXN0P1wiLCByZXF1ZXN0KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJXaGF0J3MgdGhlIHNlbmRlcj9cIiwgc2VuZGVyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJXaGF0J3Mgc2VuZFJlc3BvbnNlXCIsIHNlbmRSZXNwb25zZSk7XG5cbiAgICAgICAgc3dpdGNoIChyZXF1ZXN0LmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnY2FwdHVyZSc6XG4gICAgICAgICAgICAgICAgY2FwdHVyZU1vdXNlRXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzY3JlZW5TaG90Q29tcGxldGUnOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV2UgY29tcGxldGVkIHRoZSBzY3JlZW5zaG90IVwiKTtcbiAgICAgICAgICAgICAgICBzY3JlZW5TaG90Q29tcGxldGUocmVxdWVzdC5pbWFnZURhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgICBhcHBsaWNhdGlvbklkID0gY2hyb21lLmkxOG4uZ2V0TWVzc2FnZSgnQEBleHRlbnNpb25faWQnKTtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKG9uRXh0ZW5zaW9uTWVzc2FnZSk7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZSgpO1xuXG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coXCJIZWxsbyB3b3JsZCFcIik7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuLyogVGhlIG92ZXJsYXkgdGhhdCdzIG9uIHRvcCBvZiB0aGUgcGFnZSB3aGVuIGNhcHR1cmluZyBtb3VzZSBjb29yZGluYXRlcyBhbmQgYWZ0ZXIgcHV0dGluZ1xuICAgdGhlIGNyb3BwZWQgaW1hZ2Ugb24gdGhlIHBhZ2UuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgLyogRWxlbWVudCByZWZlcmVuY2VzICovXG4gIHZhciBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLWJlaGF2aW9yfj0nbW91c2VfbW92ZSddXCIpLFxuICAgICAgY3Jvc3NoYWlycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1iZWhhdmlvcn49J3Bvc2l0aW9uX21vdXNlJ11cIik7XG5cbiAgdmFyIGlzTW91c2VEb3duID0gZmFsc2UsXG4gICAgICB3aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpLFxuICAgICAgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgc3RhcnRYLFxuICAgICAgc3RhcnRZLFxuICAgICAgZW5kWSxcbiAgICAgIGVuZFgsXG4gICAgICBjb29yZGluYXRlcyA9IHt9LFxuICAgICAgYm9yZGVyV2lkdGg7XG5cbiAgd2luZG93LnJycmVtYXJrT3ZlcmxheUNvb3JkaW5hdGVzID0gY29vcmRpbmF0ZXM7XG5cbiAgJChkb2N1bWVudCkubW91c2Vkb3duKGZ1bmN0aW9uIChlKSB7XG4gICAgaXNNb3VzZURvd24gPSB0cnVlO1xuICAgIHN0YXJ0WCA9IGUuY2xpZW50WDtcbiAgICBzdGFydFkgPSBlLmNsaWVudFk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwicnJyZW1hcms6bW91c2VEb3duXCIpO1xuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuXG4gICAgY3Jvc3NoYWlycy5zdHlsZS5sZWZ0ID0gZS5jbGllbnRYICsgXCJweFwiO1xuICAgIGNyb3NzaGFpcnMuc3R5bGUudG9wID0gZS5jbGllbnRZICsgXCJweFwiO1xuXG4gICAgaWYgKGlzTW91c2VEb3duKSB7XG5cbiAgICAgIGVuZFkgPSBlLmNsaWVudFk7XG4gICAgICBlbmRYID0gZS5jbGllbnRYO1xuXG4gICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnZGF0YS1zdGF0ZScsICdoaWdobGlnaHRpbmcnKTtcblxuICAgICAgIC8qIENoYW5nZSBob3cgdGhlIGJvcmRlcldpZHRoIGlzIGJlaW5nIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlIHggYW5kIHkgdmFsdWVzLiAqL1xuICAgICAgIGlmIChlbmRYID49IHN0YXJ0WCAmJiBlbmRZID49IHN0YXJ0WSkge1xuXG4gICAgICAgICBjb29yZGluYXRlcy5zdGFydFggPSBzdGFydFg7XG4gICAgICAgICBjb29yZGluYXRlcy5lbmRYID0gZW5kWDtcbiAgICAgICAgIGNvb3JkaW5hdGVzLnN0YXJ0WSA9IHN0YXJ0WTtcbiAgICAgICAgIGNvb3JkaW5hdGVzLmVuZFkgPSBlbmRZO1xuXG4gICAgICAgICBib3JkZXJXaWR0aCA9IHN0YXJ0WSArIFwicHggXCIgKyAod2luZG93V2lkdGggLSBlbmRYKSArIFwicHggXCIgKyAod2luZG93SGVpZ2h0IC0gZW5kWSkgKyBcInB4IFwiICsgc3RhcnRYICsgXCJweFwiO1xuICAgICAgICAgb3ZlcmxheS5zdHlsZS5ib3JkZXJXaWR0aCA9IGJvcmRlcldpZHRoO1xuXG4gICAgICAgfSBlbHNlIGlmIChlbmRYIDw9IHN0YXJ0WCAmJiBlbmRZID49IHN0YXJ0WSkge1xuXG4gICAgICAgICBjb29yZGluYXRlcy5zdGFydFggPSBlbmRYO1xuICAgICAgICAgY29vcmRpbmF0ZXMuZW5kWCA9IHN0YXJ0WDtcbiAgICAgICAgIGNvb3JkaW5hdGVzLnN0YXJ0WSA9IHN0YXJ0WTtcbiAgICAgICAgIGNvb3JkaW5hdGVzLmVuZFkgPSBlbmRZO1xuXG4gICAgICAgICBib3JkZXJXaWR0aCA9IHN0YXJ0WSArIFwicHggXCIgKyAod2luZG93V2lkdGggLSBzdGFydFgpICsgXCJweCBcIiArICh3aW5kb3dIZWlnaHQgLSBlbmRZKSArIFwicHggXCIgKyBlbmRYICsgXCJweFwiO1xuXG4gICAgICAgICBvdmVybGF5LnN0eWxlLmJvcmRlcldpZHRoID0gYm9yZGVyV2lkdGg7XG5cbiAgICAgICB9IGVsc2UgaWYgKGVuZFggPj0gc3RhcnRYICYmIGVuZFkgPD0gc3RhcnRZKSB7XG5cbiAgICAgICAgIGNvb3JkaW5hdGVzLnN0YXJ0WCA9IHN0YXJ0WDtcbiAgICAgICAgIGNvb3JkaW5hdGVzLmVuZFggPSBlbmRYO1xuICAgICAgICAgY29vcmRpbmF0ZXMuc3RhcnRZID0gZW5kWTtcbiAgICAgICAgIGNvb3JkaW5hdGVzLmVuZFkgPSBzdGFydFk7XG5cbiAgICAgICAgIGJvcmRlcldpZHRoID0gZW5kWSArIFwicHggXCIgKyAod2luZG93V2lkdGggLSBlbmRYKSArIFwicHggXCIgKyAod2luZG93SGVpZ2h0IC0gc3RhcnRZKSArIFwicHggXCIgKyBzdGFydFggKyBcInB4XCI7XG5cbiAgICAgICAgIG92ZXJsYXkuc3R5bGUuYm9yZGVyV2lkdGggPSBib3JkZXJXaWR0aDtcblxuICAgICAgIH0gZWxzZSBpZiAoZW5kWCA8PSBzdGFydFggJiYgZW5kWSA8PSBzdGFydFkpIHtcblxuICAgICAgICAgY29vcmRpbmF0ZXMuc3RhcnRYID0gZW5kWDtcbiAgICAgICAgIGNvb3JkaW5hdGVzLmVuZFggPSBzdGFydFg7XG4gICAgICAgICBjb29yZGluYXRlcy5zdGFydFkgPSBlbmRZO1xuICAgICAgICAgY29vcmRpbmF0ZXMuZW5kWSA9IHN0YXJ0WTtcblxuICAgICAgICAgYm9yZGVyV2lkdGggPSBlbmRZICsgXCJweCBcIiArICh3aW5kb3dXaWR0aCAtIHN0YXJ0WCkgKyBcInB4IFwiICsgKHdpbmRvd0hlaWdodCAtIHN0YXJ0WSkgKyBcInB4IFwiICsgZW5kWCArIFwicHhcIjtcblxuICAgICAgICAgb3ZlcmxheS5zdHlsZS5ib3JkZXJXaWR0aCA9IGJvcmRlcldpZHRoO1xuXG4gICAgIH1cblxuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbiAoZSkge1xuXG4gICAgaXNNb3VzZURvd24gPSBmYWxzZTtcblxuICAgIG92ZXJsYXkucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgIG92ZXJsYXkucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXN0YXRlJyk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwicnJyZW1hcms6bW91c2VVcFwiLCBbY29vcmRpbmF0ZXNdKTtcbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm9uKFwicnJyZW1hcms6c2h1dGRvd25cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkZpcmluZyBvZmYgdGhlIHNodXRkb3duIGV2ZW50LlwiKTtcbiAgICAgICAgLy8gSG1tLCBpZiBJJ20gZ29pbmcgdG8gYmUgdGFraW5nIGNhcmUgb2YgdGVtcGxhdGVzIHRocm91Z2ggbXVzdGFjaGUgdGVtcGxhdGVzLCBob3cgZXhhY3RseSBhbSBJIGdvbm5hIHJlbW92ZSBhbmQgcmUtYWRkIHRoZW0/IFRpcmVkLiBDYW4ndCB0aGluay5cblxuICAgIH0pO1xufTsiXX0=
