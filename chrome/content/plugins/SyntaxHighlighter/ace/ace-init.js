if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {

//    myMatrix.codeMirror = {
//        editors: []
//    };

    $(document).ready(function(){
        $('textarea[id*=\"file\"], textarea[id*=\"content_type_raw_html\"]').each(function(){
            var textarea = $(this);
            textarea.after("<div id='" + this.id + "_ace" + "'></div>");
            textarea.hide();
            $("#" + this.id + "_ace").css("width", "99%").css("height", "400px").css("position", "relative");

            var editor = ace.edit(this.id + "_ace"), mode;
            if (this.id.search(/js/) > -1) {
               mode = require("ace/mode/javascript");
            } else if (this.id.search(/css/) > -1) {
                mode = require("ace/mode/css");
            } else {
                mode = require("ace/mode/html");
            }

            //editor.getSession().setValue(textarea.val());
//            editor.getSession().on("change", function(){
//                textarea.val(editor.getSession().getValue());
//            });
            editor.getSession().setMode(new mode());
            editor.setTheme("ace/theme/textmate");
        });
    });
}