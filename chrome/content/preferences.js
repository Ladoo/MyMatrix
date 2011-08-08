/*
	Toolbar preferences file.
	This file initialises the on change event listener for all features listed in content/feature_definitions.js
	The determineFeatures function is fired when the user updates their preferences
	The setToolbarPreferences function displays the preferences window to the user

*/

mdt.preferences = {
	isEnabled: function() {
		return mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").value;
	},
	init: function(){
		//add listener change event to toolbar enaabled switch
		mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").events.addListener("change", function(aEvent){ mdt.preferences.toggleEnableToolbar(); });
		//add listener change event for all features defined in feature_definitions.js
		mdt.featureDefinitions.features.forEach(function(feature){
			try {
					mdt.prefManager.prefs.get("extensions.matrixtoolbar."+feature.id).events.addListener("change", function(aEvent){ mdt.determineFeatures(); });
			} 
			catch (e) {
				mdt.error("Preference listener initilisation failed for: (" + feature.id + "): " + e.message);
			}
		});	
	},
	setToolbarPreferences: function() {
		window.openDialog(
			"chrome://matrixdevelopertoolbar/content/options.xul",
			"matrix-toolbox-prefs",
			"chrome,centerscreen");
	},
	toggleEnableToolbar: function() {
		if(mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").value){
			//window.alert("Toolbar enabled");
		}
		else {
			//window.alert("Toolbar disabled");
		}
	}
}