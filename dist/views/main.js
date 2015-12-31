(function () {
	console.log("chrome", chrome);
	var applicationId = chrome.i18n.getMessage('@@extension_id');
	chrome.runtime.sendMessage(applicationId, {action: "takeScreenshot"});
})();