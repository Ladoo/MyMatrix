myMatrix.settings.paths = {
    content: "chrome://mymatrix/content/",
    core: "chrome://mymatrix/content/core/",
    plugins: "chrome://mymatrix/content/plugins/",
    helpers: "chrome://mymatrix/content/helpers/"
}

myMatrix.init = function() {
    if (myMatrix.preferences.getPreference("initialLoad")) {
        myMatrix.gui.installButton("nav-bar", "myMatrix-button");
        myMatrix.preferences.setPreference("initialLoad", false);
    }

    myMatrix.gui.updatePreferences();
    myMatrix.console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

    if (gBrowser) {
            myMatrix.gBrowserLoadEventFired = false;
            gBrowser.addEventListener("load", function(){
                if (!myMatrix.gBrowserLoadEventFired) {
                    myMatrix.gBrowserLoadEventFired = true;
                    gBrowser.addEventListener("DOMContentLoaded", myMatrix.bootstrap, false);
                    gBrowser.tabContainer.addEventListener("TabSelect", function(){
                        myMatrix.gui.dimButton();
                        myMatrix.sendRequest({
                            msg: "myMatrix-StatusUpdate"
                        });
                    }, false);
                }
            }, true);
    } else {
        myMatrix.error("Could not find the global browser object. Important event binding failed.");
    }
}

myMatrix.error = function(message){
    if (myMatrix.settings.debug) Components.utils.reportError(message);
}

myMatrix.log = function(message) {
    if (myMatrix.settings.debug) myMatrix.console.logStringMessage(message);
}

myMatrix.dump = function(obj){
    if (myMatrix.settings.debug) {
        var out = '';
        for (var i in obj) {
            out += i + ": " + obj[i] + "\n";
        }
        myMatrix.console.logStringMessage(out);
    }
}

myMatrix.bootstrap = function() {
    if (myMatrix.preferences.isEnabled()) {
        // This event handling is similar to chrome.extension.onRequest
        // Original reference: https://developer.mozilla.org/en/Code_snippets/Interaction_between_privileged_and_non-privileged_pages
        myMatrix.executeScript("backgroundPage", myMatrix.settings.paths.core + "myMatrix-content.js"); // TODO: common behaviour across both Firefox and Chrome so it should be moved into a central spot
        myMatrix.executeScript("bootstrap", myMatrix.settings.paths.core + "myMatrix-content-Firefox.js");

        document.addEventListener("myMatrix-PageMessage", function(e) {
            myMatrix.onRequest(e.target.getUserData("pageData"));
        }, false, true);
    } else {
        myMatrix.gui.dimButton();
    }
}

myMatrix.executeScript = function(id, src) {
    try {
        var main = (typeof(content.frames[3]) !== "undefined") ? content.frames[3].document : document;
        var head = main.getElementsByTagName("head")[0];
        id = myMatrix.settings.prefix + "-" + id;
        if (!main.getElementById(id)) {
            var script = main.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("id", id);
            script.setAttribute("src", src);
            head.appendChild(script);

            return script;
        } else {
            return null;
        }
    } catch (e) {
       myMatrix.error("Failed inserting script " + id + " reason: " + e.message);
    }
}

myMatrix.insertCSS = function(id, href) {
    try {
        var main = (typeof(content.frames[3]) !== "undefined") ? content.frames[3].document : document;
        var head = main.getElementsByTagName("head")[0];
        id = myMatrix.settings.prefix + "-" + id;
        if (!main.getElementById(id)) {
            var css = main.createElement("link");
            css.setAttribute("type", "text/css");
            css.setAttribute("id", id);
            css.setAttribute("href", href);
            css.setAttribute("rel", "stylesheet");
            head.appendChild(css);

            return css;
        } else {
            return null;
        }
    } catch (e) {
        myMatrix.error("Failed inserting css " + id + " reason: " + e.message);
    }
}

// Similar to the implementation as found in myMatrix-content-Firefox.js
// Sends messages to the content script (privileged to non privileged)
myMatrix.sendRequest = function(msg) {
    var elm = content.frames[3].document.getElementById("myMatrix-MessageLink");
    elm.setUserData("extensionData", msg, null);

    var evt = content.frames[3].document.createEvent("HTMLEvents");
    evt.initEvent("myMatrix-ExtensionMessage", true, false);
    elm.dispatchEvent(evt);
}

myMatrix.onRequest = function(response) {
    switch (response.msg) {
        case "myMatrix-MatrixBackendDetected":
            myMatrix.gui.highlightButton();
            myMatrix.executeScript("jquery", myMatrix.settings.paths.helpers + "jquery-1.6.2.min.js");
            myMatrix.executeScript("plugins", myMatrix.settings.paths.plugins + "plugins.js");
            myMatrix.sendRequest({
                msg: "myMatrix-StartPlugins",
                data: myMatrix.enabledPlugins()
            });
            break;

        case "myMatrix-MatrixSiteDetected":
            myMatrix.gui.highlightButton();
            break;

        case "myMatrix-EmbedFiles":
            var plugin = response.data;
            if (typeof(plugin.js) !== "undefined") {
                plugin.js.forEach(function(file) {
                    myMatrix.executeScript(file.replace(/\.js/, "-js"), myMatrix.settings.paths.plugins + plugin.path + file);
                });
            }
            if (typeof(plugin.css) !== "undefined") {
                plugin.css.forEach(function(file) {
                    myMatrix.insertCSS(file.replace(/\.css/, "-css"), myMatrix.settings.paths.plugins + plugin.path + file);
                });
            }
            break;

        case "myMatrix-NotMatrix":
            myMatrix.gui.dimButton();
            break;

        case "myMatrix-HighlightButton":
            myMatrix.gui.highlightButton();
            break;

        default:
            break;
    }
}

window.addEventListener("load", function() {
    myMatrix.preferences.init();
    myMatrix.init();
}, false);