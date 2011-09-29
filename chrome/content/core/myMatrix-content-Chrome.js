// The content script will load in every single frame
// We only want it to trigger when it has loaded in the main frame
if (window.location.href.search(/sq_backend_page=main/i) > -1) {
    myMatrix.sendRequest = function(msg) {
        chrome.extension.sendRequest(msg);
    }

    myMatrix.updateImageReference = function($el, plugin) {
       if ($el.css("background-image") != "") {
            $el.css("background-image", "");
            // TODO: This hardcoded variable is... bad
            var newBg = $el.css("background-image").replace(window.location.origin + window.location.pathname, chrome.extension.getURL("chrome/content/plugins/" + plugin.path));
            $el.css("background-image", newBg);
        }
    }

    myMatrix.watchElement = function($el, prop, plugin, callback) {
        var attr = typeof($el.attr(prop)) === "undefined" ? "-" : $el.attr(prop);
        $.data($el[0], "prop-" + prop, attr);

        setInterval(function(){
            var currentProp = typeof($el.attr(prop)) === "undefined" || $el.attr(prop).length === 0 ? "-" : $el.attr(prop),
                oldProp = $el.data("prop-" + prop);
            
            if (currentProp !== oldProp) {
                $el.data("prop-" + prop, currentProp);
                callback($el, plugin);
            }
        }, 100);
    }

    chrome.extension.onRequest.addListener(function(response, sender) {
        switch (response.msg) {
            case "myMatrix-StartPlugins":
                myMatrix.objectHasLoaded("plugins", myMatrix, function() {
                    if (!myMatrix.aboutTab.declarablePlugins.length) { // Prevents this from being initiated more than once
                        myMatrix.determineDeclarablePlugins();
                        response.data.forEach(function(pluginID) {
                            if ($.inArray(pluginID, myMatrix.aboutTab.declarablePlugins) !== -1) {
                                var plugin = myMatrix.findPluginJSON(pluginID);
                                myMatrix.sendRequest({
                                    msg: "myMatrix-EmbedFiles",
                                    data: plugin
                                });
                                if (typeof(plugin.img_elements) !== "undefined" && plugin.img_elements.length > 0) {
                                    myMatrix.elementsHaveLoaded(plugin.img_elements, function(elID) {
                                        var $el = $("#" + elID);
                                        myMatrix.updateImageReference($el, plugin);
                                        myMatrix.watchElement($el, "class", plugin, function($e, p){
                                            myMatrix.updateImageReference($e, p);
                                        });
                                    });
                                }
                            }
                        });

                        myMatrix.sendRequest({
                            msg: "myMatrix-CleanTopFrame"
                        });
                    }
                });

                break;

            case "myMatrix-StatusUpdate":
                myMatrix.init();
                break;

            default:
                break;
        }
    });

    myMatrix.init();
}