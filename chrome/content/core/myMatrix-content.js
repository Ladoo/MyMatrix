var myMatrix = {
    aboutTab: {
      isMatrixBackend: false,
      isMatrixSite: false,
      assetType: "",
      assetScreen: "",
      declarablePlugins: []
    },
    settings: {
        maxElementHasLoadedIterations: 5
    },

    init: function() {
        myMatrix.determineMatrixBackend();
        myMatrix.determineMatrixSite();

        if (myMatrix.aboutTab.isMatrixBackend) {
            myMatrix.determineAssetType();
            myMatrix.determineAssetScreen();
            if (typeof(jQuery) === "undefined") {
                myMatrix.sendRequest({ msg: "myMatrix-MatrixBackendDetected" });
            } else {
                myMatrix.sendRequest({ msg: "myMatrix-HighlightButton" });
            }
        } else if (myMatrix.aboutTab.isMatrixSite) {
            myMatrix.sendRequest({ msg: "myMatrix-MatrixSiteDetected" });
        } else {
            myMatrix.sendRequest({ msg: "myMatrix-NotMatrix" });
        }
    },

    determineAssetType: function(){
        // wrap it in a try catch clause so that the toolbar still functions even if we can't detect the asset type
        try {
            var assetType = document.getElementsByClassName("sq-backend-heading-icon")[0].getElementsByTagName("img")[0].getAttribute("src").match(/asset_types\/.*\//)[0].replace(/asset_types/, "").replace(/\//g, "");
            if (typeof(assetType) !== "undefined") {
                myMatrix.aboutTab.assetType = assetType;
            }
        } catch (e) {
            //myMatrix.error("Cannot determine asset type: " + e.message);
        }
    },

    determineAssetScreen: function() {
        try {
            var screenMenu = document.getElementById("screen_menu");
            if (screenMenu) {
                myMatrix.aboutTab.assetScreen = screenMenu.options[screenMenu.selectedIndex].value.match(/asset_ei_screen=.*?&/)[0].replace(/asset_ei_screen=/, "").replace(/&/, "");
            } else {
                myMatrix.aboutTab.assetScreen = document.getElementsByClassName("sq-backend-main-heading")[0].textContent.replace(/\t/g, '').replace(/\s/, '');
            }
        } catch (e) {
            //myMatrix.error("Cannot determine asset screen: " + e.message);
        }
    },

    determineDeclarablePlugins: function() {
        if (typeof(myMatrix.plugins) === "undefined") return;
        
        myMatrix.plugins.forEach(function(plugin){
            try {
                if (plugin.detect()){
                    myMatrix.aboutTab.declarablePlugins.push(plugin.id);
                }
            } catch (e) {
                if (console) console.error("Feature detection failed (" + plugin.id + "): " + e.message);
            }
        });
    },

    determineMatrixBackend: function() {
        myMatrix.aboutTab.isMatrixBackend = document.location.href.search(/SQ_BACKEND_PAGE/) > -1;
        return myMatrix.aboutTab.isMatrixBackend;
    },

    determineMatrixSite: function() {
        // Perform 2 checks
        // 1. Is there a MySource / Squiz Matrix comment area in the <head>? (newer versions don't print myMatrix.
        // 2. Do any of the web paths have /__data/ in them?
        try {
            var headComments = document.head.innerHTML.search(/Running MySource Matrix/);
            var webPaths = document.body.innerHTML.search(/__data/);
            if (headComments > 0 || webPaths > 0) {
                myMatrix.aboutTab.isMatrixSite = true;
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.message);
        }
    },

    objectHasLoaded: function(obj, where, callback){
        if (typeof(where[obj]) !== "undefined") {
            callback();
        } else {
            setTimeout(function(){
                myMatrix.objectHasLoaded(obj, where, callback);
            }, 30);
        }
    },

    elementsHaveLoaded: function(elIDs, callback) {
        for (var counter = 0; counter < elIDs.length; counter++) {
            myMatrix.elementHasLoaded(elIDs[counter], callback, 0);
        }
    },

    elementHasLoaded: function(elID, callback, counter) {
        counter++;
        if (document.getElementById(elID)) {
            callback(elID);
        } else {
            if (counter < myMatrix.settings.maxElementHasLoadedIterations) {
                setTimeout(function(){
                    myMatrix.elementHasLoaded(elID, callback, counter);
                }, 30);
            }
        }
    },

    findPluginJSON: function(pluginID) {
        var p = null;
        myMatrix.plugins.forEach(function(plugin){
            if (plugin.id === pluginID) {
                p = plugin;
            }
        });
        
        return p;
    },

    isCorrectFrame: function() {
        return window.location.href.search(/(sq_backend_page=main)/i) > -1;
    }
}

