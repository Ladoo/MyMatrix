var mdt = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init: function() {
			gBrowser.addEventListener("load", function () {
				//var autoRun = prefManager.getBoolPref("extensions.matrixdevelopertoolbar.autorun");
			}, true);
		},

		bindButtons: function() {
		},
		
		open: function(){
		}
	};
}();

window.addEventListener("load", mdt.init, false);