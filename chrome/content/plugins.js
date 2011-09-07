/*
	Feature definitions file.
	These are intended to be as cross-browser compatible as possible to ensure easily portability.
	
	Specification:
	
	Every feature item is a JavaScript object stored in an Array with the following properties.
	* (string) id - a unique identifier, primarily used on the options screen.
	* (string) name - the friendly name for the feature, used on the options screen.
	* (string) description - a little description about what this feature does (optional).
	* (function - bool) init - code to call when this feature has been detected and is turned on by the user.
	* (function - bool) destroy - code to call to destroy this feature enhancement if they have disabled it (e.g. via options).
	* (function - bool) detect - code that will detect if this feature is present on the current screen.
*/

myMatrix.plugins = [
	{
		"id": "syntaxHighlighter",
		"name": "Syntax Highlighter",
		"description": "Coding in Matrix is finally beautiful.",
		"layout_type": "checkbox",
		"experimental": true,
		detect: function(){
			var textareas = myMatrix.aboutTab.mainFrame.document.getElementsByTagName("textarea"), tExists = false;
			for (var counter in textareas) {
				var t = textareas[counter];
				if (typeof(t.id) !== "undefined" && t.id.search(/wysiwyg/) === -1) {
					tExists = true;
				}
			}
			return ((myMatrix.aboutTab.screenBrowsing.search(/(edit_file|parse_file|contents)/) > -1) && tExists) ? true : false;
		},
		init: function(){
			var pathToFiles = myMatrix.settings.paths.lib + "SyntaxHighlighter/CodeMirror/";
			
			myMatrix.injectScript("codemirror-js", pathToFiles + "codemirror-compressed.js");
			myMatrix.injectScript("codemirror-js-init", pathToFiles + "codemirror-init.js");
			myMatrix.injectStyleSheet("codemirror-css", pathToFiles + "codemirror.css");
			myMatrix.injectStyleSheet("codemirror-theme-default", pathToFiles + "default.css");
			myMatrix.injectStyleSheet("codemirror-theme-elegant", pathToFiles + "elegant.css");
			myMatrix.injectStyleSheet("codemirror-theme-neat", pathToFiles + "neat.css");
			myMatrix.injectStyleSheet("codemirror-theme-night", pathToFiles + "night.css");
		},
		destroy: function(){
		}
	},
	{
		"id": "wysiwygReplace",
		"name": "WYSIWYG replacer",
		"description": "",
		"layout_type": "checkbox",
		"experimental": true,
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
			var tables = myMatrix.aboutTab.mainFrame.document.getElementsByTagName("table");
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

			return ( (myMatrix.aboutTab.assetType === "bodycopy") && wysiwygExists ) ? true : false;
		},
		init: function(){
			var pathToFiles = myMatrix.settings.paths.lib + "WYSIWYG/CKEditor/";
			myMatrix.injectScript("ckeditor-main-js", pathToFiles + "ckeditor.js");
			myMatrix.injectScript("ckeditor-init-js", pathToFiles + "ckeditor-init.js");	
		},
		destroy: function(){
		}
	},
	{
		"id": "dragDropFiles",
		"name": "Drag and Drop File Upload",
		"description": "Uploading files, made fun.",
		"layout_type": "checkbox",
		"experimental": false,
		detect: function(){
			// Works in these situations:
			// 1) There is a browse button on the page
			// 2) You're editing a page (e.g. Standard Page, News Item, etc.)
			var tab = myMatrix.aboutTab, 
				main = tab.mainFrame,
				mainForm = main.document.getElementById("main_form");
			
			// TODO: Find out why it doesn't work on Design Parse files
			if (mainForm.length > 0) {
				if (mainForm.action.search(/sq_asset_path/) !== -1) {
					 var lastLineage = mainForm.action.match(/sq_asset_path=.*/)[0].split(",");
					 lastLineage = lastLineage[lastLineage.length - 1];
				}
				var inputControls = main.document.getElementsByTagName("input"), browseButtonExists = false;
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
			var pathToFiles = myMatrix.settings.paths.lib + "DragDrop/";
			myMatrix.injectScript("dragdrop-js", pathToFiles + "dragdrop.js");
			myMatrix.injectStyleSheet("dragdrop-css", pathToFiles + "dragdrop.css");
		},
		destroy: function(){
		}
	},
	{
		"id": "smartTypeSelector",
		"name": "Intelligent asset type selector.",
		"description": "Converts all drop down asset type selectors to friendlier, more intelligent ones.",
		"layout_type": "checkbox",
		"experimental": false,
		detect: function(){
			var tab = myMatrix.aboutTab,
				main = tab.mainFrame,
				selectFields = main.document.getElementById("main_form").getElementsByTagName("select"),
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
		init: function(){
			var pathToFiles = myMatrix.settings.paths.lib + "SmartTypeSelector/";
			myMatrix.injectScript("sts-js", pathToFiles + "sts.js");
			myMatrix.injectStyleSheet("sts-css", pathToFiles + "sts.css");		
		},
		destroy: function(){
		}
	},
	{
		"id": "remapManagerUncheck",
		"name": "Remap Manager Mass Uncheck",
		"description": "Mass uncheck 'never delete' on Remap manager.",
		"layout_type": "checkbox",
		"experimental": false,
		detect: function(){
			return (myMatrix.aboutTab.assetType === 'remap_manager') ? true : false;
		},
		init: function(){
			var tab = myMatrix.aboutTab; 
			main = tab.mainFrame;
			if ( main.document.getElementById("myMatrix-remap-massuncheck-all") == null ) {
				var pathToFiles = myMatrix.settings.paths.lib + "RemapMassUncheck/";
				myMatrix.injectScript("remap-uncheck-js", pathToFiles + "remap-uncheck.js");
			}
		},
		destroy: function(){
		}
	},
	{
		"id": "seamlessSaving",
		"name": "Seamless Saving",
		"description": "AJAX saving of form data",
		"layout_type": "checkbox",
		"experimental": false,
		detect: function(){
			var allowedTypes = {
				"parse_file": [ "design", "design_css" ],
				"edit_file": [ "css_file", "js_file", "text_file", "xml_file", "xml_file", "xsl_file" ],
				"contents": [ "bodycopy" ]
			};
			return ( 
				typeof(allowedTypes[myMatrix.aboutTab.screenBrowsing]) !== "undefined" && inArray(myMatrix.aboutTab.assetType,allowedTypes[myMatrix.aboutTab.screenBrowsing]) > -1
			) ? true : false;
		},
		init: function(){
			var tab = myMatrix.aboutTab; 
			main = tab.mainFrame;
			if ( main.document.getElementById("sq_commit_button") ) {
				var pathToFiles = myMatrix.settings.paths.lib + "SeamlessSave/";
				myMatrix.injectStyleSheet("seamless-save-css", pathToFiles + "seamless-save.css");
				myMatrix.injectScript("jquery-form-js", pathToFiles + "jquery.form.js");
				myMatrix.injectScript("seamless-save-js", pathToFiles + "seamless-save.js");
			}
		},
		destroy: function(){
		}
	},
	{
		"id": "locksHelper",
		"name": "Locks Helper",
		"description": "Your personal key master.",
		"layout_type": "checkbox",
		"experimental": false,
		detect: function(){
			var tab = myMatrix.aboutTab; 
			main = tab.mainFrame;
			if ( main.document.getElementById("sq_lock_release_manual") ) {
				return true
			} else {
				return false
			}
		},
		init: function(){
			var pathToFiles = myMatrix.settings.paths.lib + "LocksHelper/";
			myMatrix.injectScript("locks-helper-js", pathToFiles + "locks-helper.js");
			myMatrix.injectScript("locks-countdown-js", pathToFiles + "jquery.countdown.js");
			myMatrix.injectStyleSheet("locks-countdown-css", pathToFiles + "jquery.countdown.css");
		},
		destroy: function(){
		}
	},
	{
		"id": "keyboardShortcuts",
		"name": "Keyboard Shortcut Guide",
		"description": "Keyboard shortcut reference guide.",
		"experimental": false,
		detect: function(){
			return myMatrix.aboutTab.isMatrixBackend;
		},
		init: function(){
			var self = this;
			myMatrix.injectStyleSheet("keyboard-shortcuts-css", myMatrix.settings.paths.lib + "KeyboardShortcuts/keyboard-shortcuts.css");
			window.addEventListener("keypress", function(e){
				var main = myMatrix.aboutTab.mainFrame.document;
				if (e.shiftKey && e.keyCode === 27) {
					if (!main.getElementById("myMatrix-help-menu")) {
						var helpMenu = main.createElement("div"), close = main.createElement("p"), shortCutKeys;
						helpMenu.setAttribute("id", "myMatrix-help-menu");
						close.textContent = "Close";
						close.addEventListener("click", function(){
							var main = myMatrix.aboutTab.mainFrame.document;
							main.body.removeChild(main.getElementById("myMatrix-help-menu"));
						}, false);
						main.body.appendChild(helpMenu)
						helpMenu.appendChild(close);
						self.keyboardShortcuts.forEach(function(v){
							if (typeof(v.section) === "undefined") {
								var shortCutKey = main.createElement("li");
								if (window.navigator.platform.search(/mac/i) > -1) {
									shortCutKey.innerHTML = "<div class='key'>" + v.mac + ":</div><div class='action'>" + v.action + "</div>";
								} else {
									shortCutKey.innerHTML = "<div class='key'>" + v.win + ":</div><div class='action'>" + v.action + "</div>";
								}
								shortCutKeys.appendChild(shortCutKey);
							} else {
								var heading = main.createElement("h1");
								shortCutKeys = main.createElement("ul");
								heading.textContent = v.section;
								helpMenu.appendChild(heading);
								helpMenu.appendChild(shortCutKeys);
							}
						});
					}
				}
				if (!e.shiftKey && e.keyCode === 27) {
					main.body.removeChild(main.getElementById("myMatrix-help-menu"));
				}					
			}, false);
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

