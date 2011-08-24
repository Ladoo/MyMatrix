/*
	Toolbar preferences file.
	This file initialises the on change event listener for all features listed in content/feature_definitions.js
	The determineFeatures function is fired when the user updates their preferences
	The setToolbarPreferences function displays the preferences window to the user

*/

mdt.preferences = {
	isEnabled: function() {
		return mdt.prefManager.getBoolPref("enabled");
	},
	init: function(){
		mdt.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("matrixtoolbar.");
		mdt.prefManager.QueryInterface(Components.interfaces.nsIPrefBranch2);
		document.getElementById("matrixTools-enabled").setAttribute("checked", mdt.prefManager.getBoolPref("enabled"));
		mdt.prefManager.addObserver("", this, false);
		mdt.featureDefinitions.features.forEach(function(feature){
			try {
			 	document.getElementById("matrixTools-" + feature.id).setAttribute("checked", mdt.prefManager.getBoolPref(feature.id));
			} 
			catch (e) {
				mdt.error("Preference listener initilisation failed for: (" + feature.id + "): " + e.message);
			}
		});	
	},
	toggleButton: function(){
		if (!mdt.isMatrixSite() && !mdt.isMatrixBackend()) {
			return;
		}
		
		var label = document.getElementById("matrixTools-button"), state = false, cs;
		if (mdt.prefManager.getBoolPref("enabled")) {
			state = false;
			cs = "matrixTools-button-inactive";
		} else {
			state = true;
			cs = "matrixTools-button-active";
		}
		mdt.prefManager.setBoolPref("enabled", state);
		label.setAttribute("class", "toolbarbutton-1 " + cs);
		document.getElementById("matrixTools-enabled").setAttribute("checked", state);	
	},
	toggleOption: function(menuitem) {
		try {
			var checkS = menuitem.getAttribute("checked").length === 0 ? false : true;
			mdt.prefManager.setBoolPref(menuitem.getAttribute("option"), checkS);
			mdt.determineFeatures();
		} catch (e) {
			mdt.error(e.message);
		}
	},
	observe: function(){
	}
}