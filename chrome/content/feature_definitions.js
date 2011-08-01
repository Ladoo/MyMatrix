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
					"layout_type": "grouped_checkbox",
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
					$('textarea[id*=\"bodycopy\"], textarea[id*=\"file\"],').each(function(){\
						var cm = CodeMirror.fromTextArea(this);\
						cm.setOption('theme', 'neat');\
						cm.setOption('tabMode', 'shift');\
						cm.setOption('matchBrackets', 'true');\
						cm.setOption('lineNumbers', 'true');\
					});\
				})();";
				
				var pathToFiles = mdt.settings.paths.lib + "SyntaxHighlighter/CodeMirror/";
				
				mdt.injectScript("codemirror-js", pathToFiles + "codemirror-compressed.js", cmInit);
				mdt.injectStyleSheet("codemirror-css", pathToFiles + "codemirror.css");
				mdt.injectStyleSheet("codemirror-theme-default", pathToFiles + "default.css");
				mdt.injectStyleSheet("codemirror-theme-elegant", pathToFiles + "elegant.css");
				mdt.injectStyleSheet("codemirror-theme-neat", pathToFiles + "neat.css");
				mdt.injectStyleSheet("codemirror-theme-night", pathToFiles + "night.css");
			},
			destroy: function(){
			}
		},
		{
			"id": "wysiwyg_replace",
			"name": "WYSIWYG replacer",
			"description": "",
			"layout_type": "checkbox",
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
				var tables = mdt.aboutTab.mainFrame.document.getElementsByTagName("table");
				for (var counter in tables) {
					var t = tables[counter];
					if (t.getAttribute("content_type") === "content_type") {
						wysiwygExists = true;
						break;
					}
				}
				return ( (mdt.aboutTab.screenBrowsing === "bodycopy") && (wysiwygExists) ) ? true : false;
			},
			init: function(){
			},
			destroy: function(){
			}
		}
	]
}

