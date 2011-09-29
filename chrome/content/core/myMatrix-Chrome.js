myMatrix.settings.paths = {
    content: "chrome/content/",
    core: "chrome/content/core/",
    plugins: "chrome/content/plugins/",
    helpers: "chrome/content/helpers/"
}

myMatrix.init = function() {
    chrome.extension.onRequest.addListener(function(request, sender) {
        // TODO: Merge with myMatrix-Firefox.js (it's pretty much the same implementation)
        switch (request.msg) {
            case "myMatrix-MatrixBackendDetected":
                if (myMatrix.preferences.isEnabled() === "true") {
                    myMatrix.gui.highlightButton();
                    myMatrix.executeScript(sender.tab.id, myMatrix.settings.paths.helpers + "jquery-1.6.2.min.js");
                    myMatrix.executeScript(sender.tab.id, myMatrix.settings.paths.plugins + "plugins.js");
                    chrome.tabs.sendRequest(sender.tab.id, {
                        msg: "myMatrix-StartPlugins",
                        data: myMatrix.enabledPlugins()
                    });
                } else {
                    myMatrix.gui.dimButton();
                }
                break;

            case "myMatrix-MatrixSiteDetected":
                if (myMatrix.preferences.isEnabled() === "true") {
                    myMatrix.gui.highlightButton();
                } else {
                    myMatrix.gui.dimButton();
                }
                break;

            case "myMatrix-EmbedFiles":
                var plugin = request.data;
                try {
                    if (typeof(plugin) !== "undefined") {
                        if (typeof(plugin.js) !== "undefined" && plugin.js) {
                            plugin.js.forEach(function(file) {
                                myMatrix.executeScript(sender.tab.id, myMatrix.settings.paths.plugins + plugin.path + file);
                            });
                        }
                        if (typeof(plugin.css) !== "undefined" && plugin.css) {
                            plugin.css.forEach(function(file) {
                                myMatrix.insertCSS(sender.tab.id, myMatrix.settings.paths.plugins + plugin.path + file);
                            });
                        }
                    }
                } catch (e) {
                    myMatrix.error("Could not embed content script files: " + e.message);
                    myMatrix.error(request.data);
                }
                break;

            case "myMatrix-NotMatrix":
                myMatrix.gui.dimButton();
                break;

            case "myMatrix-CleanTopFrame":
                chrome.tabs.executeScript(sender.tab.id, {
                    code: "if (window.location.search.length === 0) { $('script').remove(); $('style').remove() }",
                    allFrames: true
                });
                break;

            default:
                break;
        }
    });
}

myMatrix.error = function(message){
    if (myMatrix.settings.debug) console.log(message);
}

myMatrix.dump = function(obj){
    if (myMatrix.settings.debug) console.log(obj);
}

myMatrix.executeScript = function(tabID, src) {
    chrome.tabs.executeScript(tabID, {
        file: src,
        allFrames: true
    });
}

myMatrix.insertCSS = function(tabID, href) {
    chrome.tabs.insertCSS(tabID, {
        file: href,
        allFrames: true
    });
}

window.addEventListener("DOMContentLoaded", function(){
    myMatrix.preferences.init();
    myMatrix.init();
});

chrome.tabs.onSelectionChanged.addListener(function(tabID){
    myMatrix.gui.dimButton();
    chrome.tabs.sendRequest(tabID, {
        msg: "myMatrix-StatusUpdate"
    })
});

