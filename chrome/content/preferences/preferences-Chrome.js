myMatrix.preferences.init = function() {
    if (myMatrix.preferences.isEnabled() === null) {
        myMatrix.preferences.setPreference("enabled", true);
    }

    myMatrix.plugins.forEach(function(plugin){
        if (typeof(localStorage[plugin.id]) === "undefined") {
            myMatrix.preferences.setPreference(plugin.id, !plugin.experimental);
        }
    });
}

myMatrix.preferences.getPreference = function(pref) {
    return (localStorage[pref] === "true") ? true : false;
}

myMatrix.preferences.setPreference = function(pref, val) {
    localStorage[pref] = val;
}

myMatrix.preferences.isEnabled = function() {
    return localStorage["enabled"] || null;
}