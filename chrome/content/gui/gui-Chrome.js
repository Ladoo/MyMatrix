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

    var plugins = document.getElementById("plugins"), experimental = document.getElementById("experimental");
    myMatrix.plugins.forEach(function(plugin){
        var state = (myMatrix.preferences.getPreference(plugin.id)) ? "checked" : "",
            html = "<div><input id='"+ plugin.id + "' type='checkbox' value='" + plugin.id + "' " + state + " /> <label for='" + plugin.id + "'>" + plugin.name + "</label></div>";
        if (typeof(plugin.platforms) === "undefined" || !plugin.platforms || inArray(plugin.platforms, "chrome") !== -1) {
            if (plugin.experimental) {
                experimental.innerHTML += html;
                experimental.style.display = "block";
            } else {
                plugins.innerHTML += html;
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
