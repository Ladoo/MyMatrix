/*
	Toolbar preferences file.
	This file initialises the on change event listener for all features listed in content/plugins.js
	The determineFeatures function is fired when the user updates their preferences
	The setToolbarPreferences function displays the preferences window to the user

*/

matrixTools.preferences = {
	isEnabled: function() {
		return matrixTools.prefManager.getBoolPref("enabled");
	},
	init: function(){
		matrixTools.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("matrixTools.");
		matrixTools.prefManager.QueryInterface(Components.interfaces.nsIPrefBranch2);
		document.getElementById("matrixTools-enabled").setAttribute("checked", matrixTools.prefManager.getBoolPref("enabled"));
		matrixTools.prefManager.addObserver("", this, false);
		matrixTools.plugins.forEach(function(feature){
			try {
			 	document.getElementById("matrixTools-" + feature.id).setAttribute("checked", matrixTools.prefManager.getBoolPref(feature.id));
			} 
			catch (e) {
				matrixTools.error("Preference listener initilisation failed for: (" + feature.id + "): " + e.message);
			}
		});	
	},
	toggleButton: function(){
		if (!matrixTools.isMatrixSite() && !matrixTools.isMatrixBackend()) {
			return;
		}
		
		var label = document.getElementById("matrixTools-button"), state = false, cs;
		if (matrixTools.prefManager.getBoolPref("enabled")) {
			state = false;
			cs = "matrixTools-button-inactive";
		} else {
			state = true;
			cs = "matrixTools-button-active";
		}
		matrixTools.prefManager.setBoolPref("enabled", state);
		label.setAttribute("class", "toolbarbutton-1 " + cs);
		document.getElementById("matrixTools-enabled").setAttribute("checked", state);	
	},
	toggleOption: function(menuitem) {
		try {
			var checkS = menuitem.getAttribute("checked").length === 0 ? false : true;
			matrixTools.prefManager.setBoolPref(menuitem.getAttribute("option"), checkS);
			matrixTools.determineFeatures();
		} catch (e) {
			matrixTools.error(e.message);
		}
	},
	observe: function(){
	}
}