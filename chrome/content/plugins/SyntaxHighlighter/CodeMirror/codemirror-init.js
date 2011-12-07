if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {

    myMatrix.codeMirror = {
        editors: []
    };

    $(document).ready(function(){
        $('textarea[id*=\"file\"], textarea[id*=\"content_type_raw_html\"],').each(function(){
            $(this).css("position", "relative");
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
            myMatrix.codeMirror.editors.push(cm);

            // fix selector dropdown
            var $selector = $(this).prevAll("select");
            $selector.attr("onchange", "").bind("change", function(){
                myMatrix.codeMirror.editors[parseInt($selector.attr("id").match(/\d.?/)[0]) - 1].replaceSelection($(this).val());
                $selector.find("option:first").attr("selected", true);
            });
        });
    });
}