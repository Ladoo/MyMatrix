concierge.codeMirror = {
	editors: []
};

$(document).ready(function(){
	$('textarea[id*=\"bodycopy\"], textarea[id*=\"file\"], textarea[id*=\"content_type_raw_html\"],').each(function(){
		var cm = CodeMirror.fromTextArea(this);
		var mode = "";
		if (this.id.search(/js/) > -1) {
			mode = "javascript";
		} else if (this.id.search(/css/) > -1) {
			mode = "css";
		} else {
			mode = "htmlmixed";
		}
		cm.setOption('theme', 'neat');
		cm.setOption('tabMode', 'shift');
		cm.setOption('matchBrackets', 'true');
		cm.setOption('lineNumbers', 'true');
		cm.setOption('mode', mode);
		editors.push(cm);
	});
});