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
		//add listener (on change) event to toolbar enabled switch
		mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").events.addListener("change", function(aEvent){ mdt.preferences.toggleEnableToolbar(); });
		var enabledMenuItem = document.getElementById("matrixdevelopertoolbar-enabled");
		enabledMenuItem.setAttribute("checked",mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").value);
		mdt.featureDefinitions.features.forEach(function(feature){
			try {
				//add listener (on change) event for all features defined in feature_definitions.js
				mdt.prefManager.prefs.get("extensions.matrixtoolbar."+feature.id).events.addListener("change", function(aEvent){ mdt.determineFeatures(); });
				//set up the button checkboxes
				var preferenceMenuItem = document.getElementById("matrixdevelopertoolbar-"+feature.id);
				preferenceMenuItem.setAttribute("checked",mdt.prefManager.prefs.get("extensions.matrixtoolbar."+feature.id).value);
			} 
			catch (e) {
				mdt.error("Preference listener initilisation failed for: (" + feature.id + "): " + e.message);
			}
		});	
	},
	toggleEnableToolbar: function() {
		if(mdt.prefManager.prefs.get("extensions.matrixtoolbar.enabled").value){
			//switch on toolbar
		}
		else {
			//switch off toolbar
		}
	},
	onToggleOption: function(menuitem)
    {
        var option = menuitem.getAttribute("option");
        var checked = menuitem.getAttribute("checked") == "true";
		mdt.prefManager.prefs.setValue("extensions.matrixtoolbar."+ option,checked);
    }
}