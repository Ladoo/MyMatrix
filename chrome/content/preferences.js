/*
	Toolbar preferences file.
	This file initialises the on change event listener for all features listed in content/plugins.js
	The determineFeatures function is fired when the user updates their preferences
	The setToolbarPreferences function displays the preferences window to the user

*/

myMatrix.preferences = {
	isEnabled: function() {
		return myMatrix.prefManager.getBoolPref("enabled");
	},
	init: function(){
		myMatrix.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("myMatrix.");
		myMatrix.prefManager.QueryInterface(Components.interfaces.nsIPrefBranch2);
		myMatrix.prefManager.addObserver("", this, false);
	},
	setDefaults: function(){
		document.getElementById("myMatrix-enabled").setAttribute("checked", myMatrix.prefManager.getBoolPref("enabled"));
		myMatrix.plugins.forEach(function(feature){
			try {
			 	document.getElementById("myMatrix-" + feature.id).setAttribute("checked", myMatrix.prefManager.getBoolPref(feature.id));
			} 
			catch (e) {
				myMatrix.error("Preference listener initilisation failed for: (" + feature.id + "): " + e.message);
			}
		});		
	},
	toggleButton: function(){
		if (!myMatrix.isMatrixSite() && !myMatrix.isMatrixBackend()) {
			return;
		}
		
		var label = document.getElementById("myMatrix-button"), state = false, cs;
		if (myMatrix.prefManager.getBoolPref("enabled")) {
			state = false;
			cs = "myMatrix-button-inactive";
		} else {
			state = true;
			cs = "myMatrix-button-active";
		}
		myMatrix.prefManager.setBoolPref("enabled", state);
		label.setAttribute("class", "toolbarbutton-1 " + cs);
		document.getElementById("myMatrix-enabled").setAttribute("checked", state);	
	},
	toggleOption: function(menuitem) {
		try {
			var checkS = menuitem.getAttribute("checked").length === 0 ? false : true;
			myMatrix.prefManager.setBoolPref(menuitem.getAttribute("option"), checkS);
			myMatrix.determineFeatures();
		} catch (e) {
			myMatrix.error(e.message);
		}
	},
	observe: function(){
	}
}