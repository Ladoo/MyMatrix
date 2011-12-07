// Implementation of the chrome.extension.sendRequest API
// Allows for message passing between unprivileged code (the content script) and the privileged code (the extension)
// Original reference: https://developer.mozilla.org/en/Code_snippets/Interaction_between_privileged_and_non-privileged_pages
// This code has been slightly modified (there is no need for callbacks)
myMatrix.sendRequest = function(msg) {
    var request = document.getElementById("myMatrix-MessageLink");
    request.setUserData("pageData", msg, null);

    var sender = document.createEvent("HTMLEvents");
    sender.initEvent("myMatrix-PageMessage", true, false);

    request.dispatchEvent(sender);
}

myMatrix.onRequest = function(response) {
    switch (response.msg) {
        case "myMatrix-StartPlugins":
            myMatrix.objectHasLoaded("plugins", myMatrix, function(){
                myMatrix.objectHasLoaded("jQuery", window, function(){
                    if (myMatrix.aboutTab.declarablePlugins.length === 0) { // Prevents this from being initiated more than once
                        myMatrix.determineDeclarablePlugins();
                        response.data.forEach(function(pluginID) {
                            if ($.inArray(pluginID, myMatrix.aboutTab.declarablePlugins) !== -1) {
                                myMatrix.sendRequest({
                                    msg: "myMatrix-EmbedFiles",
                                    data: myMatrix.findPluginJSON(pluginID)
                                });
                            }
                        });
                    }
                });
            });
            break;

        case "myMatrix-StatusUpdate":
            myMatrix.init();
            break;
        
        default:
            break;
    }
}

myMatrix.setupMessageLink = function() {
    var response = document.createElement("div");
    response.setAttribute("id", "myMatrix-MessageLink");
    document.body.appendChild(response);
}

document.addEventListener("DOMContentLoaded", function(e) {
    myMatrix.setupMessageLink();
    myMatrix.init();
}, false);

window.addEventListener("load", function(e) {
    myMatrix.setupMessageLink();
    myMatrix.init();
}, false);

window.addEventListener("myMatrix-ExtensionMessage", function(e) {
    myMatrix.onRequest(e.target.getUserData("extensionData"));
}, false, true);