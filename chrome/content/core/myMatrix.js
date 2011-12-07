var myMatrix = {
    // general settings
    settings: {
        debug: true,
        prefix: "myMatrix",
        paths: {
            content: "",
            plugins: "",
            helpers: ""
        }
    },

    // about the current tab the user is browsing
    aboutTab: {
        isMatrixBackend: false,
        isMatrixSite: false,
        assetType: "",
        assetScreen: "",
        enabledPlugins: []
    },

    // interfaces
    error: function(message) {},
    log: function(message) {},
    dump: function(obj) {},

    // common methods
    enabledPlugins: function() {
        myMatrix.aboutTab.enabledPlugins = [];
        myMatrix.plugins.forEach(function(plugin){
            try {
                if (myMatrix.preferences.getPreference(plugin.id)) {
                    myMatrix.aboutTab.enabledPlugins.push(plugin.id);
                }
            } catch (e) {
                myMatrix.error("Feature detection failed (" + plugin.id + "): " + e.message);
            }
        });

        return myMatrix.aboutTab.enabledPlugins;
    }
};