var myMatrix = function(){
	// privates (stop looking)
	var ffConsole = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		
	function isMatrix(){
		var button = document.getElementById("myMatrix-button");
		button.className = "toolbarbutton-1 myMatrix-button-active";
		button.setAttribute("disabled", false);
	}
	
	function isNotMatrix(){
		var button = document.getElementById("myMatrix-button");
		button.className = "toolbarbutton-1 myMatrix-button-inactive";
		button.setAttribute("disabled", true);
	}
	
	function toolbarDisabled() {
		var label = document.getElementById("myMatrix-button");
		label.setAttribute("class", "toolbarbutton-1 myMatrix-button-inactive");
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
				content: "chrome://MyMatrix/content/",
				lib: "chrome://MyMatrix/content/lib/"
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
			myMatrix.preferences.init();
			if (myMatrix.prefManager.getBoolPref("initialLoad")) {
			    installButton("nav-bar", "myMatrix-button");
				myMatrix.prefManager.setBoolPref("initialLoad", false);
			}
			myMatrix.preferences.setDefaults();
			if (myMatrix.preferences.isEnabled()) {
				gBrowser.addEventListener("load", function(){
					gBrowser.addEventListener("DOMContentLoaded", myMatrix.bootstrap, false);
					gBrowser.tabContainer.addEventListener("TabSelect", myMatrix.bootstrap, false);
				}, true);
			}
			else {
				toolbarDisabled();
			}
		},
		
		bootstrap: function(){
			if (myMatrix.isMatrixBackend()) {
				myMatrix.aboutTab.mainFrame = content.frames[3];
				myMatrix.insertPageHelpers();
				myMatrix.determineAssetType();
				myMatrix.determineAssetScreen();
				isMatrix();
				myMatrix.determineFeatures();
				myMatrix.dump(myMatrix.aboutTab);
			}
			else if (myMatrix.isMatrixSite()) {
				isMatrix();
			}
			else {
				isNotMatrix();
			}			
		},
				
		// main public methods
		error: function(message) {
			if (myMatrix.settings.debug) Components.utils.reportError(message);
		},
		
		dump: function(obj) {
			if (myMatrix.settings.debug) {
				var out = '';
				for (var i in obj) {
					out += i + ": " + obj[i] + "\n";
				}
				ffConsole.logStringMessage(out);
			}
		},
		
		injectScript: function(id, src, callback){
			var main = myMatrix.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "myMatrix-" + id;
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
			var main = myMatrix.aboutTab.mainFrame.document;
			var head = main.getElementsByTagName("head")[0];
			id = "myMatrix-" + id;
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
			myMatrix.injectScript("jquery", this.settings.paths.lib + "jquery-1.6.2.min.js");
			myMatrix.injectScript("myMatrix", this.settings.paths.lib + "myMatrix.js");
		},

		determineAssetType: function(){
			// wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
			try {
				var assetType = myMatrix.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
				if (typeof(assetType) !== "undefined") {
					myMatrix.aboutTab.assetType = assetType;
				}
			} catch (e) {
				myMatrix.error("Cannot determine asset type: " + e.message);
			}
		},
		
		determineAssetScreen: function(){
			try {
				var screenMenu = myMatrix.aboutTab.mainFrame.document.getElementById("screen_menu");
				if (screenMenu) {
					myMatrix.aboutTab.screenBrowsing = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
				} else {
					myMatrix.aboutTab.screenBrowsing = myMatrix.aboutTab.mainFrame.document.getElementsByClassName("sq-backend-main-heading")[0].textContent.replace(/\t/g, '').replace(/\s/, '');
				} 
			} catch (e) {
				myMatrix.error("Cannot determine asset screen: " + e.message);
			}
		},
		
		determineFeatures: function(){
			try {
				myMatrix.aboutTab.featuresAvailable = [];
				myMatrix.plugins.forEach(function(feature){
					try {
						if (feature.detect()){
							myMatrix.aboutTab.featuresAvailable.push(feature.id);
							if (myMatrix.prefManager.getBoolPref(feature.id)) {
								feature.init();
							} else {
								feature.destroy();
							}
						}
					} catch (e) {
						myMatrix.error("Feature detection failed (" + feature.id + "): " + e.message);
					}
				});	
			} catch (e) {
				myMatrix.error("Cannot detect features: " + e.message);		
			}
		},
		

		// TODO: Find a way to determine when a script has loaded on a page and let the extension sandbox know about it
		
		objectHasLoaded: function(obj, where, callback){
			if (typeof(where[obj]) !== "undefined") {
				callback();
			} else {
				setTimeout(function(){
					myMatrix.objectHasLoaded(obj, where, callback);
				}, 30);
			}
		},
		
		isMatrixBackend: function(){
			myMatrix.aboutTab.isMatrixBackend = content.document.title.match(/(Squiz|MySource).*Administration Interface/) ? true : false;
			return myMatrix.aboutTab.isMatrixBackend;
		},
		
		isMatrixSite: function(){
			// Perform 2 checks
			// 1. Is there a MySource / Squiz Matrix comment area in the <head>? (newer versions don't print this)
			// 2. Do any of the web paths have /__data/ in them?
			var headComments = content.document.head.innerHTML.search(/Running MySource Matrix/);
			var webPaths = content.document.body.innerHTML.search(/__data/);
			if (headComments > 0 || webPaths > 0) {
				myMatrix.aboutTab.isMatrixSite = true;
				return true;
			} else {
				return false;
			}
		}		
	};
}();

window.addEventListener("load", myMatrix.init, false);