myMatrix.gui.highlightButton = function(){
    document.getElementById("myMatrix-button").className = "toolbarbutton-1 myMatrix-button-active";
}

myMatrix.gui.dimButton = function(){
    document.getElementById("myMatrix-button").className = "toolbarbutton-1 myMatrix-button-inactive";
}

myMatrix.gui.updatePreferences = function(){
    var matrixEnabledOption = document.getElementById("myMatrix-enabled");
    if (matrixEnabledOption) {
        matrixEnabledOption.setAttribute("checked", myMatrix.preferences.getPreference("enabled"));
        myMatrix.plugins.forEach(function(plugin){
            try {
                document.getElementById("myMatrix-" + plugin.id).setAttribute("checked", myMatrix.preferences.getPreference(plugin.id));
            }
            catch (e) {
                myMatrix.error("Preference listener init failed for: (" + plugin.id + "): " + e.message);
            }
        });
    }
}

//https://developer.mozilla.org/En/Code_snippets:Toolbar#Adding_button_by_default
//https://developer.mozilla.org/en/XUL_School/Appendix_B%3a_Install_and_Uninstall_Scripts#Install_Scripts
/**
 * Installs the toolbar button with the given ID into the given
 * toolbar, if it is not already present in the document.
 *
 * @param {string} toolbarId The ID of the toolbar to install to.
 * @param {string} id The ID of the button to install.
 * @param {string} afterId The ID of the element to insert after. @optional
 */
myMatrix.gui.installButton = function(toolbarId, id, afterId){
    if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);

        var before = toolbar.lastChild;
        if (afterId) {
            let elem = before = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
    }
}
