var mdt = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		// general settings
		settings: {
			
		},
		
		// about the current tab the user is browsing
		// everything from the asset type
		aboutTab: {
			isMatrixBackend: false
		},
		
		init: function(){
			gBrowser.addEventListener("load", function(){
				if (mdt.isMatrixBackend()) {
					aboutTab.isMatrixBackend = true;
					mdt.determineAssetType();
				}
			}, true);
		},

		determineAssetType: function(){
			
		},
		
		enhanceAsset: function(){
			
		},
		
		replaceWYSIWYG: function(){
			
		},
		
		highlightSyntax: function(){
			
		},
		
		isMatrixBackend: function(){
			return (content.document.title.match(/(Squiz|MySource)\sMatrix.*Administration Interface/)) ? true : false;
		},
		
		isMatrixSite: function(){
			// Perform 2 checks
			// 1. Is there a MySource / Squiz Matrix comment area in the <head>?
			// 2. Do any of the web paths have /__data/ in them?
			
		}
	};
}();

window.addEventListener("load", mdt.init, false);