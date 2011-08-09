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
			"id": "autocollapse",
			"name": "Auto section collapsing",
			"description": "",
			"layout_type": "checkbox",
			"experimental": false,
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
			"id": "syntaxhighlighter",
			"name": "Syntax Highlighter",
			"description": "Coding in Matrix is finally beautiful.",
			"layout_type": "checkbox",
			"experimental": true,
			detect: function(){
				var textareas = mdt.aboutTab.mainFrame.document.getElementsByTagName("textarea"), tExists = false;
				for (var counter in textareas) {
					var t = textareas[counter];
					if (typeof(t.id) !== "undefined" && t.id.search(/wysiwyg/) === -1) {
						tExists = true;
					}
				}
				return ((mdt.aboutTab.screenBrowsing.search(/(edit_file|parse_file|contents)/) > -1) && tExists) ? true : false;
			},
			init: function(){
				var init = "(function(){\
					$('textarea[id*=\"bodycopy\"], textarea[id*=\"file\"],').each(function(){\
						var cm = CodeMirror.fromTextArea(this);\
						cm.setOption('theme', 'neat');\
						cm.setOption('tabMode', 'shift');\
						cm.setOption('matchBrackets', 'true');\
						cm.setOption('lineNumbers', 'true');\
					});\
				})();";
				
				var pathToFiles = mdt.settings.paths.lib + "SyntaxHighlighter/CodeMirror/";
				
				mdt.injectScript("codemirror-js", pathToFiles + "codemirror-compressed.js", init);
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
			"id": "wysiwygreplace",
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
				var tables = mdt.aboutTab.mainFrame.document.getElementsByTagName("table");
				for (var counter in tables) {
					var t = tables[counter];
					if (typeof(t.getAttribute) !== "undefined") {
						if (t.getAttribute("content_type") === "content_type_wysiwyg") {
							wysiwygExists = true;
							break;
						}
					}
				}

				return ( (mdt.aboutTab.assetType === "bodycopy") && wysiwygExists ) ? true : false;
			},
			init: function(){
				var pathToFiles = mdt.settings.paths.lib + "WYSIWYG/CKEditor/";
				var init = "(function(){\
					$(document).ready(function(){\
						$('table[content_type] textarea').each(function(){\
							if ($(this).attr('id').search(/wysiwyg/) !== -1) {\
								var $table = $(this).parents('table[content_type]');\
								$(this).appendTo($table.parent());\
								$table.children().hide();\
								CKEDITOR.replace($(this).attr('id'), { toolbar: 'Coder' });\
							}\
						});\
					});\
				})();";
				mdt.injectScript("ckeditor-main-js", pathToFiles + "ckeditor.js", init);	
			},
			destroy: function(){
			}
		},
		{
			"id": "dragdropfiles",
			"name": "Drag and Drop File Upload",
			"description": "Uploading files, made fun.",
			"layout_type": "checkbox",
			"experimental": false,
			detect: function(){
				// Works in these situations:
				// 1) There is a browse button on the page
				// 2) You're editing a page (e.g. Standard Page, News Item, etc.)
				var tab = mdt.aboutTab, 
					main = tab.mainFrame;
				
				// TODO: Find out why it doesn't work on Design Parse files
				var lastLineage = main.document.getElementById("main_form").action.match(/sq_asset_path=.*/)[0].split(","),
					browseButtonExists = false;
				lastLineage = lastLineage[lastLineage.length - 1];
				
				var browseButtons = main.document.getElementsByTagName("input");
				for (var c in browseButtons) {
					var bw = browseButtons[c];
					if (typeof(bw.type) !== "undefined" && bw.type === "file") {
						browseButtonExists = true;
						break;
					}
				}
				
				return ( 
						(tab.assetType === "news_item") || 
						(tab.screenBrowsing === "contents" && tab.assetType === "bodycopy") || (browseButtonExists)
					) ? true : false;
			},
			init: function(){
				var pathToFiles = mdt.settings.paths.lib + "DragDrop/";
				mdt.injectScript("dragdrop-js", pathToFiles + "dragdrop.js");
				mdt.injectStyleSheet("dragdrop-css", pathToFiles + "dragdrop.css");
			},
			destroy: function(){
			}
		},
		{
			"id": "remapmanageruncheck",
			"name": "Remap Manager Mass Uncheck",
			"description": "Mass uncheck 'never delete' on Remap manager.",
			"layout_type": "checkbox",
			"experimental": false,
			detect: function(){
				return (mdt.aboutTab.assetType === 'remap_manager') ? true : false;
			},
			init: function(){
				var tab = mdt.aboutTab; 
				main = tab.mainFrame;
				if ( main.document.getElementById("matrixdevelopertoolbar-remap-massuncheck-all") == null ) {
					var pathToFiles = mdt.settings.paths.lib + "RemapMassUncheck/";
					mdt.injectScript("remap-uncheck-js", pathToFiles + "remap-uncheck.js");
				}
			},
			destroy: function(){
			}
		},
		{
			"id": "seamlesssaving",
			"name": "Seamless Saving",
			"description": "AJAX saving of form data",
			"layout_type": "checkbox",
			"experimental": false,
			detect: function(){	
				return (mdt.aboutTab.assetType === 'bodycopy') ? true : false;
			},
			init: function(){
				var tab = mdt.aboutTab; 
				main = tab.mainFrame;
				if ( main.document.getElementById("sq_commit_button") ) {
					var pathToFiles = mdt.settings.paths.lib + "SeamlessSave/";
					mdt.injectScript("jquery-form-js", pathToFiles + "jquery.form.js");
					mdt.injectScript("seamless-save-js", pathToFiles + "seamless-save.js");
				}
			},
			destroy: function(){
			}
		}
	]
}

