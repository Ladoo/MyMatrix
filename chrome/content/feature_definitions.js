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

mdt.featureDefinitions = {
	features: [
		{
			"id": "seamless_saving",
			"name": "Seamless Saving",
			"description": "",
			"layout_type": "checkbox",
			detect: function(){	
			},
			init: function(){
			},
			destroy: function(){
			}
		},
		{
			"id": "auto_collapse",
			"name": "Auto section collapsing",
			"description": "",
			"layout_type": "checkbox",
			"advanced_options": [
				{					
					"id": "remap_manager",
					"name": "Remap Manager",
					"layout_type": "grouped_checkboxes",
					"values": [ "Thumbnail", "Status" ]
				}
			],
			detect: function(){
			},
			init: function(){
			},
			destroy: function(){
			}
		},
		{
			"id": "syntax_highlighter",
			"name": "Syntax Highlighter",
			"description": "Coding in Matrix is finally beautiful.",
			"layout_type": "checkbox",
			detect: function(){
				return ((mdt.aboutTab.screenBrowsing.search(/(edit_file|parse_file|contents)/) > -1) && (mdt.aboutTab.mainFrame.document.getElementsByTagName("textarea").length > 0)) ? true : false;
			},
			init: function(){
				var cmInit = "(function(){\
					$('textarea[id*=\"bodycopy\"], textarea[id*=\"parse_file\"]').each(function(){\
						CodeMirror.fromTextArea(this);\
					});\
				})();";
				
				mdt.injectScript("codemirror-js", "chrome://matrixdevelopertoolbar/content/codemirror-compressed.js", cmInit);
			
				var main = mdt.aboutTab.mainFrame.document;
				var head = main.getElementsByTagName("head")[0];
						

/*
					mdt.onObjectAvailable("CodeMirror", mdt.aboutTab.mainFrame, function(){
						main.$('textarea[id*="bodycopy"]').each(function(){
							main.CodeMirror.fromTextArea(this);
						});
					});
*/
	
				if (!main.getElementById("matrixdevelopertoolbar-codemirror-styles")) {
					var codeMirrorStyles = main.createElement("link");
					codeMirrorStyles.id = "matrixdevelopertoolbar-codemirror-styles";
					codeMirrorStyles.type = "text/css";
					codeMirrorStyles.rel = "stylesheet";
					codeMirrorStyles.href = "chrome://matrixdevelopertoolbar/content/lib/codemirror.css";
					head.appendChild(codeMirrorStyles);
	
					codeMirrorStyles = main.createElement("link");
					codeMirrorStyles.type = "text/css";
					codeMirrorStyles.rel = "stylesheet";
					codeMirrorStyles.href = "chrome://matrixdevelopertoolbar/content/theme/default.css";	
					head.appendChild(codeMirrorStyles);
				}				
			},
			destroy: function(){
			}
		}
	]
}

