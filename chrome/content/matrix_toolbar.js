var mdt = function(){
	// privates (stop looking)
	var ffConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	
	function isMatrix(){
		var button = document.getElementById("matrixtools-button");
		button.className = "toolbarbutton-1 matrixtools-button-active";
		button.setAttribute("disabled", false);
	}
	
	function isNotMatrix(){
		var button = document.getElementById("matrixtools-button");
		button.className = "toolbarbutton-1 matrixtools-button-inactive";
		button.setAttribute("disabled", true);
	}
	
	function toolbarDisabled() {
		var label = document.getElementById("matrixdeveloper-running-matrix");
		label.setAttribute("value", "Toolbar Disabled");
		label.style.color = "#990000";
		label.className = "";
	}
	
	return {
		// general settings
		settings: {
			debug: true,
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
			//check if toolbar is enabled
			mdt.prefManager = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);
			mdt.preferences.init();
			if( mdt.preferences.isEnabled() ) {
				gBrowser.addEventListener("load", function(){
					gBrowser.addEventListener("DOMContentLoaded", mdt.bootstrap, false);
					gBrowser.tabContainer.addEventListener("TabSelect", mdt.bootstrap, false);
				}, true);
			} 
			else {
				toolbarDisabled();
				//TODO code here to destroy all activated toolbar features
			}	
		},
		
		bootstrap: function(){
			if (mdt.isMatrixBackend()) {
				mdt.aboutTab.mainFrame = content.frames[3];
				mdt.insertPageHelpers();
				mdt.determineAssetType();
				mdt.determineAssetScreen();
				isMatrix();
				mdt.determineFeatures();
				mdt.dump(mdt.aboutTab);
			}
			else if (mdt.isMatrixSite()) {
				isMatrix();
			}
			else {
				isNotMatrix();
			}			
		},
				
		// main public methods
		error: function(message) {
			if (mdt.settings.debug) Components.utils.reportError(message);
		},
		
		dump: function(obj) {
			if (mdt.settings.debug) {
				var out = '';
				for (var i in obj) {
					out += i + ": " + obj[i] + "\n";
				}
				ffConsole.logStringMessage(out);
			}
		},
		
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
			mdt.injectScript("concierge", "chrome://matrixdevelopertoolbar/content/lib/concierge.js");
		},

		determineAssetType: function(){
			// wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
			try {
				var assetType = mdt.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
				if (typeof(assetType) !== "undefined") {
					mdt.aboutTab.assetType = assetType;
				}
			} catch (e) {
				mdt.error("Cannot determine asset type: " + e.message);
			}
		},
		
		determineAssetScreen: function(){
			try {
				var screenMenu = mdt.aboutTab.mainFrame.document.getElementById("screen_menu");
				if (screenMenu) {
					mdt.aboutTab.screenBrowsing = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
				} else {
					mdt.aboutTab.screenBrowsing = mdt.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-main-heading")[0].textContent.replace(/\t/g, '').replace(/\s/, '');
				} 
			} catch (e) {
				mdt.error("Cannot determine asset screen: " + e.message);
			}
		},
		
		determineFeatures: function(){
			try {
				mdt.aboutTab.featuresAvailable = [];
				mdt.featureDefinitions.features.forEach(function(feature){
					try {
						if (feature.detect()){
							mdt.aboutTab.featuresAvailable.push(feature.id);
							if (mdt.featureIsEnabled(feature.id)) {
								feature.init();
							} else {
								feature.destroy();
							}
						}
					} catch (e) {
						error("Feature detection failed (" + feature.id + "): " + e.message);
					}
				});	
			} catch (e) {
				mdt.error("Cannot detect features: " + e.message);		
			}
		},
		

		// TODO: Find a way to determine when a script has loaded on a page and let the extension sandbox know about it
		
		objectHasLoaded: function(obj, where, callback){
			if (typeof(where[obj]) !== "undefined") {
				callback();
			} else {
				setTimeout(function(){
					mdt.objectHasLoaded(obj, where, callback);
				}, 30);
			}
		},
		
		featureIsEnabled: function(feature_id){
			thePref = mdt.prefManager.prefs.get("extensions.matrixtoolbar." + feature_id);
			return thePref.value;
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