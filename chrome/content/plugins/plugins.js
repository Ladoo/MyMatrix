/*
	Plugin definitions file.
	These are intended to be as cross-browser compatible as possible to ensure easily portability.
	
	Specification:
	
	Every feature item is a JavaScript object stored in an Array with the following properties.
	* (string) id - a unique identifier, primarily used on the options screen.
	* (string) name - the friendly name for the feature, used on the options screen.
	* (string) description - a little description about what this plugin does (optional).
	* (function - bool) init - code to call when this feature has been detected and is turned on by the user.
	* (function - bool) destroy - code to call to destroy this feature enhancement if they have disabled it (e.g. via options).
	* (function - bool) detect - code that will detect if this feature is present on the current screen.
*/

if (typeof(content) == "undefined" || !content) {
    var mwscope = window;
} else {
    var mwscope = content.frames[3];
}

if ( mwscope.location.href.search(/(sq_backend_page=main|chrome-extension|browser.xul)/i) > -1 ) {
    if (!myMatrix) {
        var myMatrix = {};
    }

    myMatrix.plugins = [
        {
            "id": "syntaxHighlighter",
            "name": "Syntax Highlighter",
            "description": "Coding in Matrix is finally beautiful.",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "SyntaxHighlighter/CodeMirror/",
            "css": [ "codemirror.css", "default.css", "elegant.css", "neat.css", "night.css" ],
            "js": [ "codemirror-compressed.js", "codemirror-init.js" ],
            //"path": "SyntaxHighlighter/ace/",
            //"js": [ "ace.js", "mode-css.js", "mode-javascript.js", "mode-json.js", "mode-xml.js", "mode-html.js", "theme-textmate.js", "ace-init.js" ],

            detect: function(){
                var textareas = document.getElementsByTagName("textarea"), tExists = false;
                for (var counter in textareas) {
                    var t = textareas[counter];
                    if (typeof(t.id) !== "undefined" && t.id.search(/wysiwyg/) === -1) {
                        tExists = true;
                        break;
                    }
                }
                return ((myMatrix.aboutTab.assetScreen.search(/(edit_file|parse_file|contents)/) > -1) && tExists) ? true : false;
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "wysiwygReplace",
            "name": "WYSIWYG replacer",
            "description": "",
            "layout_type": "checkbox",
            "experimental": true,
            "platforms": [ "firefox "],
            "path": "WYSIWYG/CKEditor/",
            "js": [ "ckeditor.js", "config.js", "ckeditor-init.js" ],
            "css": [ "contents.css" ],
            "advanced_options": [
                {
                    "id": "types",
                    "name": "WYSIWYG types",
                    "layout_type": "grouped_radio",
                    "values": [ "CKEditor", "WYMEditor" ]
                }
            ],
            detect: function(){
                var wysiwygExists = false;
                var tables = document.getElementsByTagName("table");
                for (var counter in tables) {
                    var t = tables[counter];
                    if (typeof(t.getAttribute) !== "undefined") {
                        var content_type = t.getAttribute("content_type"), layout_type = t.getAttribute("layout_type");
                        if (content_type === "content_type_wysiwyg" || ( (layout_type === "div" || layout_type === "span") && t.innerHTML.search(/content_type_wysiwyg/) > -1 ) ) {
                            wysiwygExists = true;
                            break;
                        }
                    }
                }

                return ((myMatrix.aboutTab.assetType === "bodycopy") && wysiwygExists );
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "dragDropFiles",
            "name": "Drag and Drop File Upload",
            "description": "Uploading files, made fun.",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "DragDrop/",
            "css": [ "dragdrop.css" ],
            "js": [ "local_file_table.js", "dragdrop.js" ],
            "img_elements": [ "dropBox" ],
            detect: function(){
                // Works in these situations:
                // 1) There is a browse button on the page
                // 2) You're editing a page (e.g. Standard Page, News Item, etc.)
                var tab = myMatrix.aboutTab,
                    mainForm = document.getElementById("main_form");

                // TODO: Find out why it doesn't work on Design Parse files
                if (mainForm.length > 0) {
                    if (mainForm.action.search(/sq_asset_path/) !== -1) {
                         var lastLineage = mainForm.action.match(/sq_asset_path=.*/)[0].split(",");
                         lastLineage = lastLineage[lastLineage.length - 1];
                    }
                    var inputControls = document.getElementsByTagName("input"), browseButtonExists = false;
                    for (var c in inputControls) {
                        var ic = inputControls[c];
                        if (typeof(ic.type) !== "undefined" && ic.type === "file") {
                            browseButtonExists = true;
                            break;
                        }
                    }
                }
                return (
                        (tab.assetType === "news_item") ||
                        (tab.screenBrowsing === "contents" && tab.assetType === "bodycopy") || (browseButtonExists) &&
                        (tab.assetType !== "design_customisation" && tab.assetType !== "design")
                    ) ? true : false;
            },
            init: function(){
            },
            destroy: function(){
            }
        },
        {
            "id": "smartTypeSelector",
            "name": "Smart Type Selector",
            "description": "Converts all drop down asset type selectors to friendlier, more intelligent ones.",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "SmartTypeSelector/",
            "css": [ "sts.css" ],
            "js": [ "sts.js" ],
            detect: function(){
                var selectFields = document.getElementById("main_form").getElementsByTagName("select"),
                    regex = /(types\[type_code\]\[\]|create_types\[\]|add_layouts\[\]|new_type)/,
                    exists = false;


                for (var c in selectFields) {
                    var field = selectFields[c];
                    if ( (typeof(field.id) !== "undefined") && (field.id.search(regex) > -1) ) {
                        exists = true;
                        break;
                    }
                }

                return exists;
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "remapManagerUncheck",
            "name": "Remap Manager Mass Uncheck",
            "description": "Mass uncheck 'never delete' on Remap manager.",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "RemapMassUncheck/",
            "js": [ "remap-uncheck.js" ],
            detect: function(){
                return (myMatrix.aboutTab.assetType === 'remap_manager') && !document.getElementById("myMatrix-remap-massuncheck-all") ? true : false;
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "seamlessSaving",
            "name": "Seamless Saving",
            "description": "AJAX saving of form data",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "SeamlessSave/",
            "css": [ "seamless-save.css" ],
            "js": [ "jquery.form.js", "seamless-save.js" ],
            "img_elements": [ "seamlessSave" ],
            detect: function(){
                var allowedTypes = {
                    "parse_file": [ "design", "design_css" ],
                    "edit_file": [ "css_file", "js_file", "text_file", "xml_file", "xml_file", "xsl_file" ],
                    "contents": [ "bodycopy", "paint_layout_bodycopy", "layout" ]
                };
                return (
                    typeof(allowedTypes[myMatrix.aboutTab.assetScreen]) !== "undefined" &&
                        $.inArray(myMatrix.aboutTab.assetType,allowedTypes[myMatrix.aboutTab.assetScreen]) > -1 &&
                        document.getElementById("sq_commit_button")
                ) ? true : false;
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "locksHelper",
            "name": "Locks Helper",
            "description": "Your personal key master.",
            "layout_type": "checkbox",
            "experimental": false,
            "path": "LocksHelper/",
            "css": [ "jquery.countdown.css", "locks-helper.css" ],
            "js": [ "jquery.countdown.js", "locks-helper.js" ],
            "img_elements": [ "myMatrix-lockstatus" ],
            detect: function(){
                return document.getElementById("sq_lock_release_manual") ? true : false
            },
            init: function(){},
            destroy: function(){}
        },
        {
            "id": "keyboardShortcuts",
            "name": "Keyboard Shortcut Guide",
            "description": "Keyboard shortcut reference guide.",
            "experimental": false,
            "path": "",
            "css": [],
            "js": [],
            detect: function(){
                return myMatrix.aboutTab.isMatrixBackend;
            },
            init: function(){
                // TODO: Move this into a separate plugin file
    //			var self = this;
    //			myMatrix.injectStyleSheet("keyboard-shortcuts-css", myMatrix.settings.paths.plugins + "KeyboardShortcuts/keyboard-shortcuts.css");
    //			window.addEventListener("keypress", function(e){
    //				var main = document;
    //				if (e.shiftKey && e.keyCode === 27) {
    //					if (!main.getElementById("myMatrix-help-menu")) {
    //						var helpMenu = main.createElement("div"), close = main.createElement("p"), shortCutKeys;
    //						helpMenu.setAttribute("id", "myMatrix-help-menu");
    //						close.textContent = "Close";
    //						close.addEventListener("click", function(){
    //							var main = document;
    //							main.body.removeChild(main.getElementById("myMatrix-help-menu"));
    //						}, false);
    //						main.body.appendChild(helpMenu)
    //						helpMenu.appendChild(close);
    //						self.keyboardShortcuts.forEach(function(v){
    //							if (typeof(v.section) === "undefined") {
    //								var shortCutKey = main.createElement("li");
    //								if (window.navigator.platform.search(/mac/i) > -1) {
    //									shortCutKey.innerHTML = "<div class='key'>" + v.mac + ":</div><div class='action'>" + v.action + "</div>";
    //								} else {
    //									shortCutKey.innerHTML = "<div class='key'>" + v.win + ":</div><div class='action'>" + v.action + "</div>";
    //								}
    //								shortCutKeys.appendChild(shortCutKey);
    //							} else {
    //								var heading = main.createElement("h1");
    //								shortCutKeys = main.createElement("ul");
    //								heading.textContent = v.section;
    //								helpMenu.appendChild(heading);
    //								helpMenu.appendChild(shortCutKeys);
    //							}
    //						});
    //					}
    //				}
    //				if (!e.shiftKey && e.keyCode === 27) {
    //					main.body.removeChild(main.getElementById("myMatrix-help-menu"));
    //				}
    //			}, false);
            },
            destroy: function(){},
            keyboardShortcuts: [
                { "section": "Squiz Matrix Interface" },
                { "action": "Acquire Lock", "win": "Alt + A", "mac": "Ctrl + A" },
                { "action": "Release Lock", "win": "Alt + R", "mac": "Ctrl + R" },
                { "action": "Save", "win": "Alt + Shift + S", "mac": "Ctrl + S"  },
                { "action": "HIPO - Next", "win": "Alt + N", "mac": "Ctrl + N" }
            ]
        }
    ]

}