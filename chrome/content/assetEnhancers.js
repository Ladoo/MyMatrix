mdt.assetEnhancers = {
	version: "1.0",
	browserSupport: {
		firefox: "4.*"
	},
	assets: [
		{
			typeCode: "remap_manager",
			autoEnhance: true,
			autoCollapse: true,
			autoCollapseSections: [ "Locking / Editing", "Status", "Future Status", "Thumbnail" ],
			uiEnhancements: null
		},
		{
			typeCode: "js_file",
			autoEnhance: true,
			autoCollapse: true,
			autoCollapseSections: [],
			uiEnhancements: function(){
				if (mdt.aboutTab.screenBrowsing === "edit_file") {
					mdt.enableSyntaxHighlighter();
				}
			}
		},
		{
			typeCode: "css_file",
			autoEnhance: true,
			autoCollapse: true,
			autoCollapseSections: [],
			uiEnhancements: function(){
				if (mdt.aboutTab.screenBrowsing === "edit_file") {
					mdt.enableSyntaxHighlighter();
				}
			}
		},
		{
			typeCode: "design_css",
			autoEnhance: true,
			autoCollapse: true,
			autoCollapseSections: [],
			uiEnhancements: function(){
				if (mdt.aboutTab.screenBrowsing === "parse_file") {
					mdt.enableSyntaxHighlighter();
				}
			}
		}								
	]
};