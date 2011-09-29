if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {
    $(document).ready(function(){
        myMatrix.dragDrop = {
            files: [], // array of hashes that represent filenames + filedata
            oldSubmit: "" // string that represents the original (as inserted by Matrix) commit action of the page
        };

        // Drag Enter (File Upload)
        function dragActive(){
            var $dropBox = $("#dropBox");
            $dropBox.addClass("active").removeClass("inactive");
            if (myMatrix.dragDrop.isBulkFileTool()) {
                $dropBox.text("Drop files to import here.");
            } else {
                $dropBox.text("Drop file to upload here.");
            }
        }

        function dragNotActive(){
            var $dropBox = $("#dropBox");
            $dropBox.removeClass("active").addClass("inactive");
            if (myMatrix.dragDrop.isBulkFileTool()) {
                $dropBox.text("Drag files to import here.");
            } else {
                $dropBox.text("Drag file to upload here.");
            }
        }

        function changeCommitAction(){
            var $commitButton = $("#sq_commit_button");
            myMatrix.dragDrop.oldSubmit = $commitButton.attr("onclick");
            $commitButton.attr("onclick", "").unbind("click").bind("click", function(){
                var $rootNodeSelector = $("#sq_asset_finder_bulk_file_import_local_upload_root_asset_assetid");
                $(this).attr("disabled", true);
                if ($rootNodeSelector.length > 0 && $rootNodeSelector.val().length === 0) {
                    alert ("You need specify a Root Node before the upload can proceed.");
                    $(this).attr("disabled", false);
                } else {
                    updateFilesList();
                    myMatrix.dragDrop.beginUpload();
                    $(this).attr("disabled", true);
                }
                return false;
            });
        }

        // Checks if a person has removed any files from the upload list (e.g. in the Bulk File Upload Tool)
        // Updates the file object list
        function updateFilesList(){
            var files = [];
            if (myMatrix.dragDrop.isBulkFileTool()) {
                for (var counter = 0; counter < myMatrix.dragDrop.files.length; counter++) {
                    var file = myMatrix.dragDrop.files[counter];
                    if ($("#bulk_file_import_table_container span[id*=bulk_file_upload_file_chooser_]:contains('" + file.data.name + "')").length !== 0) {
                        files.push(file);
                    }
                }
                myMatrix.dragDrop.files = files;
            }
        }

        // Not sure why I need to implement this
        // Is there something wrong with the way I'm capturing dragenter and dragleave or just a general problem with this API?
        function notInDropZone($dropZone, e){
            var height = $dropZone.position().top + ($dropZone.height() + parseInt($dropZone.css("padding-top").replace("px", "")));
            var width = $dropZone.position().left + ($dropZone.width() + parseInt($dropZone.css("padding-left").replace("px", "")));

            return (
                (e.clientX < $dropZone.position().left) || (e.clientX > width) ||
                (e.clientY < $dropZone.position().top) || (e.clientY > height)
            ) ? true : false;
        }

        myMatrix.dragDrop.init = function(){
            var $inputRow,
                dropContainer = document.getElementById("sq-content"),
                dropBoxHTML = "<div id='dropBox' class='inactive'></div>",
                $dropZone;

            if (dropContainer) {

                if (!myMatrix.dragDrop.isParseFile()) {
                    $inputRow = $("input[type=file]").parents("tr:first");
                } else {
                    $inputRow = $("input[type=file][name*='assoc_file_']:first").parents("tr:first");
                }

                $dropZone = $inputRow.find("td.sq-backend-data");

                if (myMatrix.dragDrop.isBulkFileTool()) {
                    $("#bulk_file_import_table_container").before(dropBoxHTML);
                } else {
                    $dropZone.parents("table:first").find("td.sq-backend-data:first").append("<div id='dropPreview'></div>");
                    $dropZone.append(dropBoxHTML);
                }

                dragNotActive();

                $(dropContainer).bind({
                    dragenter: function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        dragActive();
                    },
                    dragleave: function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        if (notInDropZone($("#dropBox").parents("table:first"), e)) {
                            dragNotActive(e);
                        }
                    },
                    dragover: function(e){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                dropContainer.addEventListener("drop", function(e){
                    myMatrix.dragDrop.handleDrop(e);
                    dragNotActive();
                    e.preventDefault();
                }, false);
            }
        };

        myMatrix.dragDrop.prepareUpload = function(file, index, bin){
            changeCommitAction();
            if (!myMatrix.dragDrop.isBulkFileTool() && !myMatrix.dragDrop.isParseFile()) {
                var $file = $("#main_form input[type=file]").hide();
                $file.prevAll("input").remove();
                $file.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");
                $("#main_form input[name*=_filename]").parents("tr:first").hide();
            }

            if (myMatrix.dragDrop.isBulkFileTool()) {
                local_file_table.addRow();
                var $file = $(local_file_table.tbody).find("tr:last input"), $newInput;
                $file.after("<input type='text' name='" + $file.attr("name") + "' id='" + $file.attr("id") + "' value='" + file.name + "' />");
                $newInput = $file.next();
                $file.remove();

                local_file_table.fileSelected($newInput[0], $newInput.attr("name").match(/\d.?/)[0]);
            }

            if (myMatrix.dragDrop.isParseFile()) {
                // var $input = $("input[type=file][name*='assoc_file_']").hide();
                // $input.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");

                // var name = $input.find(":last").attr("name");
                // name = name.substr(0, name.length - 1) + (parseInt(name.substr(name.length - 1)) + 1);
                // if (myMatrix.dragDrop.formData) {
                    // myMatrix.dragDrop.formData.append(name, file);
                // } else {
                    // var data = new FormData();
                    // data.append($, file);
                    // myMatrix.dragDrop.formData = data;
                // }
            }

            myMatrix.dragDrop.files.push({
                name: $file.attr("name"),
                data: file
            });

            $("#drag-temp-browse").bind("click", function(){
                // delete any dragged data
                $(".drag-temp").remove();
                myMatrix.dragDrop.formData = null;
                $("#dropPreview").empty();

                // completely restore previous state
                $("#sq_commit_button").unbind("click").attr("onclick", myMatrix.dragDrop.oldSubmit);
                $("#main_form input[type=file]").show().trigger("click");
                $("#main_form input[name*=_filename]").parents("tr:first").show();

                return false;
            });
        };

        myMatrix.dragDrop.beginUpload = function(){
            var d = new FormData();
            for (var counter = 0; counter < myMatrix.dragDrop.files.length; counter++) {
                var file = myMatrix.dragDrop.files[counter];
                d.append(file.name, file.data);
            }

            $("#main_form").find("input,select,textarea").each(function(){
                var $this = $(this);
                if (typeof($this.attr("name")) !== "undefined" && $this.attr("type") !== "file") {
                    d.append($this.attr("name"), $this.val());
                }
            });

            $.ajax({
                url: $("#main_form").attr("action"),
                type: "POST",
                data: d,
                processData: false,
                contentType: false,
                success: function(data){
                    document.forms[0]['changes'].value = 0;
                    if (typeof(local_file_table) === "undefined") {
                        var location = data.match(/action="(?:[^\\"]+|\\.)*"/)[0];
                        window.location.href = location;
                    } else {
                        window.location.reload();
                    }
                }
            });
        };

        myMatrix.dragDrop.handleDrop = function(event){
            var dt = event.dataTransfer,
                files = dt.files,
                count = files.length;

            event.stopPropagation();
            event.preventDefault();

            for (var i = 0; i < count; i++) {
                var file = files[i],
                    droppedFileName = file.name,

                reader = new FileReader();
                reader.index = i;
                reader.file = file;
                // file previews are only available in single drag/drop operations
                if (!myMatrix.dragDrop.isBulkFileTool()) {
                    reader.onloadend = function(e) {
                        if (e.target.file.type.search(/image/) > -1) {
                            myMatrix.dragDrop.showPreview(e);
                        } else {
                            myMatrix.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
                        }
                        e.preventDefault();
                    };
                    reader.readAsDataURL(file);
                    break;
                } else {
                    reader.onloadend = function(e) {
                        myMatrix.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
                        e.preventDefault();
                    };
                    reader.readAsBinaryString(file);
                }
            }
        };

        myMatrix.dragDrop.showPreview = function(event){
            var data = event.target.result,
                index = event.target.index,
                file = event.target.file,
                getBinaryDataReader = new FileReader();

            $("#dropPreview").html("<img id='item " + index + "' src='" + data + "' />");
            getBinaryDataReader.onloadend = function(evt) {
                myMatrix.dragDrop.prepareUpload(file, index, evt.target.result, false);
            };
            getBinaryDataReader.readAsBinaryString(file);
        };

        myMatrix.dragDrop.isBulkFileTool = function(){
            return (typeof(local_file_table) === "undefined" ? false : true);
        };

        myMatrix.dragDrop.isParseFile = function(){
            return $("input[type=file][name*='assoc_file_']").length === 0 ? false : true;
        };

        myMatrix.dragDrop.init();
    });
}