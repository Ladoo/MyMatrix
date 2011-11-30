myMatrix.gui.highlightButton = function() {
    chrome.browserAction.setIcon({ path: "/skin/button-active.png" });
}

myMatrix.gui.dimButton = function() {
    chrome.browserAction.setIcon({ path: "/skin/button-inactive.png" });
}

myMatrix.gui.drawOptions = function() {
    if (myMatrix.preferences.getPreference("enabled")) {
        document.getElementById("enabled").checked = true;
    }

    var plugins = document.getElementById("plugins"), experimental = document.getElementById("experimental"), actions = document.getElementById("actions");
    myMatrix.plugins.forEach(function(plugin){
        var state = (myMatrix.preferences.getPreference(plugin.id)) ? "checked" : "",
            checkbox_html = "<div id='" + plugin.id + "Wrapper'><input id='"+ plugin.id + "' type='checkbox' value='" + plugin.id + "' " + state + " /> <label for='" + plugin.id + "'>" + plugin.name + "</label></div>",
            button_html = "<div id='" + plugin.id + "Wrapper'><input type='button' id='" + plugin.id + "' value='" + plugin.name + "' /></div>"
        if (typeof(plugin.platforms) === "undefined" || !plugin.platforms || inArray(plugin.platforms, "chrome") !== -1) {
            if (plugin.layout_type == "checkbox") {
                if (plugin.experimental) {
                    experimental.innerHTML += checkbox_html;
                    experimental.style.display = "block";
                } else {
                    plugins.innerHTML += checkbox_html;
                }
            } else if (plugin.layout_type == "action_button") {
                actions.innerHTML += button_html;
                myMatrix.gui.insertDependants(plugin);
            } else {
                // TODO: Throw an error for not supported layout types (debug mode only, fail silently otherwise)
            }
        }
    });

    var inputs = document.getElementsByTagName("input");
    for (var counter = 0; counter < inputs.length; counter++) {
        inputs[counter].addEventListener("change", function(e){
            myMatrix.preferences.setPreference(e.target.id, e.target.checked);
            if (e.target.id === "enabled") {
                if (e.target.checked) myMatrix.gui.highlightButton();
                else myMatrix.gui.dimButton();
            }
        }, false);
    }
}

myMatrix.gui.insertDependants = function(plugin) {
    if (typeof(plugin.js) !== "undefined" && plugin.js && plugin.layout_type === "action_button") {
        plugin.js.forEach(function(file) {
            var script = document.createElement("script");
            script.src = "/" + myMatrix.settings.paths.plugins + plugin.path + file;
            document.getElementsByTagName("head")[0].appendChild(script);
        });
    }
    if (typeof(plugin.css) !== "undefined" && plugin.css && plugin.layout_type === "action_button") {
        plugin.css.forEach(function(file) {
            var link = document.createElement("link");
            link.href = "/" + myMatrix.settings.paths.plugins + plugin.path + file;
            link.type = "text/css";
            link.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(link);
        });
    }
}
