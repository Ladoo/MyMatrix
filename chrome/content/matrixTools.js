var matrixTools = function(){
	// privates (stop looking)
	var ffConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		
	function isMatrix(){
		var button = document.getElementById("matrixTools-button");
		button.className = "toolbarbutton-1 matrixTools-button-active";
		button.setAttribute("disabled", false);
	}
	
	function isNotMatrix(){
		var button = document.getElementById("matrixTools-button");
		button.className = "toolbarbutton-1 matrixTools-button-inactive";
		button.setAttribute("disabled", true);
	}
	
	function toolbarDisabled() {
		var label = document.getElementById("matrixTools-button");
		label.setAttribute("class", "toolbarbutton-1 matrixTools-button-inactive");
	}
	
	//https://developer.mozilla.org/En/Code_snippets:Toolbar#Adding_button_by_default
	//https://developer.mozilla.org/en/XUL_School/Appendix_B%3a_Install_and_Uninstall_Scripts#Install_Scripts
	/**
	 * Installs the toolbar button with the given ID into the given
	 * toolbar, if it is not already present in the document.
	 *
	 * @param {string} toolbarId The ID of the toolbar to install to.
	 * @param {string} id The ID of the button to install.
	 * @param {string} afterId The ID of the element to insert after. @optional
	 */	
	function installButton(toolbarId, id, afterId) {
	    if (!document.getElementById(id)) {
	        var toolbar = document.getElementById(toolbarId);

	        var before = toolbar.lastChild;
	        if (afterId) {
	            let elem = before = document.getElementById(afterId);
	            if (elem && elem.parentNode == toolbar)
	                before = elem.nextElementSibling;
	        }

	        toolbar.insertItem(id, before);
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
	    }
	}
		
	return {
		// general settings
		settings: {
			debug: true,
			paths: {
				content: "chrome://matrixTools/content/",
				lib: "chrome://matrixTools/content/lib/"
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
			matrixTools.preferences.init();
			if (matrixTools.prefManager.getBoolPref("initialLoad")) {
			    installButton("nav-bar", "matrixTools-button");
				matrixTools.prefManager.setBoolPref("initialLoad", false);
			}
			matrixTools.preferences.setDefaults();
			if (matrixTools.preferences.isEnabled()) {
				gBrowser.addEventListener("load", function(){
					gBrowser.addEventListener("DOMContentLoaded", matrixTools.bootstrap, false);
					gBrowser.tabContainer.addEventListener("TabSelect", matrixTools.bootstrap, false);
				}, true);
			}
			else {
				toolbarDisabled();
			}
		},
		
		bootstrap: function(){
			if (matrixTools.isMatrixBackend()) {
				matrixTools.aboutTab.mainFrame = content.frames[3];
				matrixTools.insertPageHelpers();
				matrixTools.determineAssetType();
				matrixTools.determineAssetScreen();
				isMatrix();
				matrixTools.determineFeatures();
				matrixTools.dump(matrixTools.aboutTab);
			}
			else if (matrixTools.isMatrixSite()) {
				isMatrix();
			}
			else {
				isNotMatrix();
			}			
		},
				
		// main public methods
		error: function(message) {
			if (matrixTools.settings.debug) Components.utils.reportError(message);
		},
		
		dump: function(obj) {
			if (matrixTools.settings.debug) {
				var out = '';
				for (var i in obj) {
					out += i + ": " + obj[i] + "\n";
				}
				ffConsole.logStringMessage(out);
			}
		},
		
		injectScript: function(id, src, callback){
			var main = matrixTools.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "matrixTools-" + id;
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
			var main = matrixTools.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "matrixTools-" + id;
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
			matrixTools.injectScript("jquery", "chrome://matrixTools/content/lib/jquery-1.6.2.min.js");
			matrixTools.injectScript("matrixTools", "chrome://matrixTools/content/lib/matrixTools.js");
		},

		determineAssetType: function(){
			// wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
			try {
				var assetType = matrixTools.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
				if (typeof(assetType) !== "undefined") {
					matrixTools.aboutTab.assetType = assetType;
				}
			} catch (e) {
				matrixTools.error("Cannot determine asset type: " + e.message);
			}
		},
		
		determineAssetScreen: function(){
			try {
				var screenMenu = matrixTools.aboutTab.mainFrame.document.getElementById("screen_menu");
				if (screenMenu) {
					matrixTools.aboutTab.screenBrowsing = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
				} else {
					matrixTools.aboutTab.screenBrowsing = matrixTools.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-main-heading")[0].textContent.replace(/\t/g, '').replace(/\s/, '');
				} 
			} catch (e) {
				matrixTools.error("Cannot determine asset screen: " + e.message);
			}
		},
		
		determineFeatures: function(){
			try {
				matrixTools.aboutTab.featuresAvailable = [];
				matrixTools.plugins.forEach(function(feature){
					try {
						if (feature.detect()){
							matrixTools.aboutTab.featuresAvailable.push(feature.id);
							if (matrixTools.prefManager.getBoolPref(feature.id)) {
								feature.init();
							} else {
								feature.destroy();
							}
						}
					} catch (e) {
						matrixTools.error("Feature detection failed (" + feature.id + "): " + e.message);
					}
				});	
			} catch (e) {
				matrixTools.error("Cannot detect features: " + e.message);		
			}
		},
		

		// TODO: Find a way to determine when a script has loaded on a page and let the extension sandbox know about it
		
		objectHasLoaded: function(obj, where, callback){
			if (typeof(where[obj]) !== "undefined") {
				callback();
			} else {
				setTimeout(function(){
					matrixTools.objectHasLoaded(obj, where, callback);
				}, 30);
			}
		},
		
		isMatrixBackend: function(){
			matrixTools.aboutTab.isMatrixBackend = content.document.title.match(/(Squiz|MySource).*Administration Interface/) ? true : false;
			return matrixTools.aboutTab.isMatrixBackend;
		},
		
		isMatrixSite: function(){
			// Perform 2 checks
			// 1. Is there a MySource / Squiz Matrix comment area in the <head>? (newer versions don't print this)
			// 2. Do any of the web paths have /__data/ in them?
			var headComments = content.document.head.innerHTML.search(/Running MySource Matrix/);
			var webPaths = content.document.body.innerHTML.search(/__data/);
			if (headComments > 0 || webPaths > 0) {
				matrixTools.aboutTab.isMatrixSite = true;
				return true;
			} else {
				return false;
			}
		}		
	};
}();

window.addEventListener("load", matrixTools.init, false);