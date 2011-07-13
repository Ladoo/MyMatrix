var mdt = function(){
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	function isMatrix(){
		var label = document.getElementById("matrixdeveloper-running-matrix");
		label.setAttribute("value", "Running MySource / Squiz Matrix");
		label.style.color = "#007b0e";
		showToolbar();
	}
	
	function isNotMatrix(){
		var label = document.getElementById("matrixdeveloper-running-matrix");
		label.setAttribute("value", "Not running MySource / Squiz Matrix");
		label.style.color = "#990000";
		hideToolbar();
	}
	
	function showToolbar(){
		document.getElementById("matrixdevelopertoolbar").style.display = "";
	}
	
	function hideToolbar(){
		document.getElementById("matrixdevelopertoolbar").style.display = "none";
	}
	
	function getMainFrame(){
		return content.frames[3];
	}
	
	function embedCodeMirror(){
		var main = getMainFrame().document;
		var head = main.getElementsByTagName("head")[0];
		
		if (!main.getElementById("matrixdevelopertoolbar-codemirror-js")) {
			var codeMirrorScript = main.createElement("script");
			codeMirrorScript.id = "matrixdevelopertoolbar-codemirror-js";
			codeMirrorScript.src = "chrome://matrixdevelopertoolbar/content/codemirror-compressed.js";
			head.appendChild(codeMirrorScript);
		}
		
		if (!main.getElementById("matrixdevelopertoolbar-codemirror-styles")) {
			var codeMirrorStyles = main.createElement("link");
			codeMirrorStyles.id = "matrixdevelopertoolbar-codemirror-styles";
			codeMirrorStyles.type = "text/css";
			codeMirrorStyles.rel = "stylesheet";
			codeMirrorStyles.href = "chrome://matrixdevelopertoolbar/content/lib/codemirror.css";
			head.appendChild(codeMirrorStyles);
		
			codeMirrorStyles = main.createElement("link");
			codeMirrorStyles.type = "text/css";
			codeMirrorStyles.rel = "stylesheet";
			codeMirrorStyles.href = "chrome://matrixdevelopertoolbar/content/theme/default.css";	
			head.appendChild(codeMirrorStyles);
		}
	}
	
	return {
		// general settings
		settings: {
			
		},
		
		// about the current tab the user is browsing
		// everything from the asset type
		// not really necessary at this stage of the extensions..but maybe one day?
		aboutTab: {
			isMatrixBackend: false,
			isMatrixSite: false,
			assetType: null,
			screenBrowsing: null
		},
		
		init: function(){
			gBrowser.addEventListener("load", mdt.bootstrap, true);
			gBrowser.tabContainer.addEventListener("TabSelect", mdt.bootstrap, false);
		},
		
		bootstrap: function(){
			if (mdt.isMatrixBackend()) {
				mdt.injectPageModifiers();
				mdt.determineAssetType();
				mdt.determineAssetScreen();
				isMatrix();
				mdt.enhanceAsset();
			}
			else if (mdt.isMatrixSite()) {
				isMatrix();
			}
			else {
				isNotMatrix();
			}			
		},

		determineAssetType: function(){
			// wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
			try {
				var assetType = getMainFrame().document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
				if (typeof(assetType) !== "undefined") {
					mdt.aboutTab.assetType = assetType;
				}
			} catch (e) {
				// no debugging yet
				//alert (e.message);
			}
		},
		
		determineAssetScreen: function(){
			var screenMenu = getMainFrame().document.getElementById("screen_menu");
			if (screenMenu) {
				mdt.aboutTab.screenBrowsing = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
			}
		},
		
		enhanceAsset: function(){
			if (mdt.aboutTab.assetType) {
				
				switch (mdt.aboutTab.assetType) {
					case "js_file":
						if (mdt.aboutTab.screenBrowsing === "edit_file") {
							embedCodeMirror();
						}
						break;
					default:
						break;
				}
			}
		},
		
		injectPageModifiers: function(){
			var main = getMainFrame().document;
			var head = main.getElementsByTagName("head")[0];

			if (!main.getElementById("matrixdevelopertoolbar-main-js")) {
				var mainScript = main.createElement("script");
				mainScript.id = "matrixdevelopertoolbar-main-js";
				mainScript.src = "chrome://matrixdevelopertoolbar/content/matrixdevelopertoolbar-page-embed.js";
				head.appendChild(mainScript);
			}			
		},
		
		replaceWYSIWYG: function(){
			
		},
		
		highlightSyntax: function(){
			
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