myMatrix.preferences.init = function() {
    this.manager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.myMatrix.");
    this.manager.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this.manager.addObserver("", this, false);
}

myMatrix.preferences.getPreference = function(pref) {
    return this.manager.getBoolPref(pref);
}

myMatrix.preferences.setPreference = function(pref, val) {
    this.manager.setBoolPref(pref, val);
}

myMatrix.preferences.isEnabled = function(){
    return this.getPreference("enabled");
}

myMatrix.preferences.toggleOption = function(option) {
    try {
        // TODO: Move the attribute checking to the GUI layer. This method should only handle booleans.
        var checkS = option.getAttribute("checked").length === 0 ? false : true;
        this.setPreference(option.getAttribute("option"), checkS);

        if (!this.isEnabled()) {
            myMatrix.gui.dimButton();
        } else {
            myMatrix.gui.highlightButton();
        }

    } catch (e) {
        myMatrix.error(e.message);
    }
}
    
myMatrix.preferences.observe = function(){}