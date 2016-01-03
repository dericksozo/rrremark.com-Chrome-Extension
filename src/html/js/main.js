$(function () {
	alert("Working?");

	/*
	$(croppedImage).animate({
		top: 10,
		left: ( $(window).width() / 2 ) - ( $(croppedImage).outerWidth()  / 2 )
	}, 250, "easeOutQuad");
	*/
});

/* function createImage() {
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
} */

/*
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
*/