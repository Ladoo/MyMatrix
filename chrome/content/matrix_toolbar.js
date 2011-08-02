var mdt = function(){
	// privates (stop looking)
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	function isMatrix(){
		var label = document.getElementById("matrixdeveloper-running-matrix");
		label.setAttribute("value", "Matrix detected");
		label.style.color = "#007b0e";
		label.className = "active";
	}
	
	function isNotMatrix(){
		var label = document.getElementById("matrixdeveloper-running-matrix");
		label.setAttribute("value", "Matrix not detected");
		label.style.color = "#990000";
		label.className = "";
	}
	
	return {
		// general settings
		settings: {
			paths: {
				content: "chrome://matrixdevelopertoolbar/content/",
				lib: "chrome://matrixdevelopertoolbar/content/lib/"
			}
		},
		
		// about the current tab the user is browsing
		aboutTab: {
			isMatrixBackend: false,
			isMatrixSite: false,
			assetType: "",
			screenBrowsing: "",
			featuresAvailable: [],
			mainFrame: null
		},
		
		init: function(){
			gBrowser.addEventListener("load", function(){
				content.addEventListener("load", mdt.bootstrap, false);
			}, true);
			gBrowser.tabContainer.addEventListener("TabSelect", mdt.bootstrap, false);
			gBrowser.addEventListener("DOMContentLoaded", mdt.bootstrap, false);
		},
		
		bootstrap: function(){
			if (mdt.isMatrixBackend()) {
				mdt.aboutTab.mainFrame = content.frames[3];
				mdt.insertPageHelpers();
				mdt.determineAssetType();
				mdt.determineAssetScreen();
				isMatrix();
				mdt.determineFeatures();
			}
			else if (mdt.isMatrixSite()) {
				isMatrix();
			}
			else {
				isNotMatrix();
			}			
		},
		
		// main public methods
		injectScript: function(id, src, callback){
			var main = mdt.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "matrixdevelopertoolbar-" + id;
			if (!main.getElementById(id)) {
				var script = main.createElement("script");
				script.setAttribute("type", "text/javascript");
				script.setAttribute("id", id);
				script.setAttribute("src", src);
				if (typeof(callback) !== "undefined") {
					script.setAttribute("onload", callback);
				}
				head.appendChild(script);		
				
				return script;		
			} else {
				return null;
			}
		},
		
		injectStyleSheet: function(id, href){
			var main = mdt.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "matrixdevelopertoolbar-" + id;
			if (!main.getElementById(id)) {
				var css = main.createElement("link");
				css.setAttribute("type", "text/css");
				css.setAttribute("id", id);
				css.setAttribute("href", href);
				css.setAttribute("rel", "stylesheet");
				head.appendChild(css);		
				
				return css;		
			} else {
				return null;
			}		
		},
		
		insertPageHelpers: function(){
			mdt.injectScript("jquery", "chrome://matrixdevelopertoolbar/content/lib/jquery-1.6.2.min.js");
		},

		determineAssetType: function(){
			// wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
			try {
				var assetType = mdt.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
				if (typeof(assetType) !== "undefined") {
					mdt.aboutTab.assetType = assetType;
				}
			} catch (e) {
			}
		},
		
		determineAssetScreen: function(){
			var screenMenu = mdt.aboutTab.mainFrame.document.getElementById("screen_menu");
			if (screenMenu) {
				mdt.aboutTab.screenBrowsing = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
			}
		},
		
		determineFeatures: function(){
			mdt.featureDefinitions.features.forEach(function(feature){
				if (feature.detect()){
					if (mdt.featureIsEnabled(feature.id)) {
						feature.init();
					} else {
						feature.destroy();
					}
				}
			});	
		},
		

		// TODO: Find a way to determine when a script has loaded on a page and let the extension sandbox know about it
		
		objectHasLoaded: function(obj, where, callback){
			if (typeof(where[obj]) !== "undefined") {
				callback();
			} else {
				setTimeout(function(){
					mdt.objectHasLoaded(obj, where, callback);
				}, 5000);
			}
		},
		
		featureIsEnabled: function(){
			return true;
		},
		
		isMatrixBackend: function(){
			mdt.aboutTab.isMatrixBackend = content.document.title.match(/(Squiz|MySource)\sMatrix.*Administration Interface/) ? true : false;
			return mdt.aboutTab.isMatrixBackend;
		},
		
		isMatrixSite: function(){
			// Perform 2 checks
			// 1. Is there a MySource / Squiz Matrix comment area in the <head>? (newer versions don't print this)
			// 2. Do any of the web paths have /__data/ in them?
			var headComments = content.document.head.innerHTML.search(/Running MySource Matrix/);
			var webPaths = content.document.body.innerHTML.search(/__data/);
			if (headComments > 0 || webPaths > 0) {
				mdt.aboutTab.isMatrixSite = true;
				return true;
			} else {
				return false;
			}
		}
	};
}();

window.addEventListener("load", mdt.init, false);