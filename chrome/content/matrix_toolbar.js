var mdt = function(){
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
		label.style.color = "#990000";mdt.aboutTab.mainFrame
		label.className = "";
	}
	
	return {
		// general settings
		settings: {
		},
		
		// about the current tab the user is browsing
		// not really necessary at this stage of the extensions..but maybe one day?
		aboutTab: {
			isMatrixBackend: false,
			isMatrixSite: false,
			assetType: null,
			screenBrowsing: null,
			featuresAvailable: [],
			mainFrame: null
		},
		
		init: function(){
			gBrowser.addEventListener("load", function(){
				content.addEventListener("load", mdt.bootstrap, false);
			}, true);
			gBrowser.tabContainer.addEventListener("TabSelect", mdt.bootstrap, false);
		},
		
		bootstrap: function(){
			if (mdt.isMatrixBackend()) {
				mdt.aboutTab.mainFrame = content.frames[3];
				mdt.aboutTab.mainFrame.addEventListener("DOMActivate", mdt.bootstrap, false);
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
		
		injectScript: function(id, src, callback){
			var main = mdt.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "matrixdevelopertoolbar-" + id;
			if (!main.getElementById(id)) {
				var script = main.createElement("script");
				script.type = "text/javascript";
				script.setAttribute("id", id);
				script.setAttribute("src", src);
				script.setAttribute("onload", callback);
				head.appendChild(script);		
				
				return script;		
			} else {
				return null;
			}
		},
		
		insertPageHelpers: function(){
			var main = mdt.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			
			if (!main.getElementById("matrixtoolbar-jquery") && typeof(head) === "object") {
				var jq = main.createElement("script");
				jq.id = "matrixtoolbar-jquery";
				jq.src = "chrome://matrixdevelopertoolbar/content/lib/jquery-1.6.2.min.js";
				head.appendChild(jq);
			} else {
			}
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
		
		featureIsEnabled: function(){
			return true;
		},
		
		/*enhanceAsset: function(){
			if (mdt.aboutTab.assetType) {
				for (var c in mdt.assetEnhancers.assets) {
					var asset = mdt.assetEnhancers.assets[c];
					if (asset.typeCode === mdt.aboutTab.assetType) {
						try {
							if (typeof(asset.uiEnhancements) !== "undefined" && asset.autoEnhance) {
								asset.uiEnhancements();
							}
						} catch (e) {
						}
					} 
				}
			} else {
			}
		},*/
		
		collapseSections: function(){
			var sections = mdt.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-section-heading");
			for (var counter in sections) {
				var section = sections[counter];
				
			}
		},
		
		replaceWYSIWYG: function(){
			
		},
		
		onObjectAvailable: function(obj, where, callback){
			//alert (mdt.aboutTab.mainFrame.CodeMirror);
			if (typeof(where[obj]) !== "undefined") {
				callback();
			} else {
				setTimeout(function(){
					mdt.onObjectAvailable(obj, where, callback);
				}, 5000);
			}
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