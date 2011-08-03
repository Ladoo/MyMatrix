/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function(config){
	config.toolbar = "Coder";
	config.toolbar_Coder = [
		{
			name: "document",
			items: [ "Save", "-", "Templates" ]
		},
		{
			name: "clipboard",
			items: [ "Cut", "Copy", "PasteText", "PasteFromWord", "-", "Undo", "Redo" ]
		},
		{
			name: "styles",
			items: [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ]
		},
		{
			name: "paragraph",
			items: [ 'NumberedList','BulletedList','-','Outdent','Indent','-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
		},
		{
			name: "links",
			items: [ "Link", "Unlink", "Anchor" ]
		},
		{
			name: "insert",
			items: [ "Image", "Table", "CreateDiv", "HorizontalRule" ]
		},
		{
			name: "tools",
			items: [ "Source", "-", "ShowBlocks", "Maximize" ]
		}
	];
};