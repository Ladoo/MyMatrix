$(document).ready(function(){
	matrixTools.dragDrop = {};
	
	// Drag Enter (File Upload)
	function dragActive(){
		var $dropBox = $("#dropBox");
		$dropBox.addClass("active").removeClass("inactive");
		if (matrixTools.dragDrop.isBulkFileTool()) { 
			$dropBox.text("Drop files to import here.");
		} else {
			$dropBox.text("Drop file to upload here.");
		}
	}
	
	function dragNotActive(e){
		var $dropBox = $("#dropBox");
		$dropBox.removeClass("active").addClass("inactive");
		if (matrixTools.dragDrop.isBulkFileTool()) { 
			$dropBox.text("Drag files to import here.");
		} else {
			$dropBox.text("Drag file to upload here.");
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
	
	matrixTools.dragDrop.init = function(){
		$("#sq-content").append("<div id='dropPreview'></div>");
		var $inputRow;
		if (!matrixTools.dragDrop.isParseFile()) {
			$inputRow = $("input[type=file]").parents("tr:first");
		} else {
			$inputRow = $("input[type=file][name*='assoc_file_']:first").parents("tr:first");
		}
		var dropBoxHTML = "<div id='dropBox' class='inactive'></div>";
		var $dropZone = $inputRow.find("td.sq-backend-data");
		if (matrixTools.dragDrop.isBulkFileTool()) {
			$("#bulk_file_import_table_container").before(dropBoxHTML);
		} else {
			$dropZone.append(dropBoxHTML);
		}
		dragNotActive(); 
		
		$dropContainer = $("#main_form");
		$dropContainer.bind({
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
		
		$dropContainer[0].addEventListener("drop", function(e){
			matrixTools.dragDrop.handleDrop(e);
			dragNotActive(e);
			e.preventDefault();
		}, false);
	};
	
	matrixTools.dragDrop.prepareUpload = function(file, index, bin){
		if (!matrixTools.dragDrop.isBulkFileTool() && !matrixTools.dragDrop.isParseFile()) {
			var $input = $("#main_form input[type=file]").hide();
			$input.prevAll("input").remove();
			$input.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");
			
			var data = new FormData();
			data.append($input.attr("name"), file);
			matrixTools.dragDrop.formData = data;			
		} 
		
		if (matrixTools.dragDrop.isBulkFileTool()) {
			local_file_table.addRow();
			var $file = $(local_file_table.tbody).find("tr:last input"), $newInput;
			$file.after("<input type='text' name='" + $file.attr("name") + "' id='" + $file.attr("id") + "' value='" + file.name + "' />");
			$newInput = $file.next();
			$file.remove();
			
			local_file_table.fileSelected($newInput[0], $newInput.attr("name").match(/\d.?/)[0]);
			
			if (matrixTools.dragDrop.formData) {
				matrixTools.dragDrop.formData.append($file.attr("name"), file);
			} else {
				var data = new FormData();
				data.append($file.attr("name"), file);
				matrixTools.dragDrop.formData = data;	
			}
		}
		
		if (matrixTools.dragDrop.isParseFile()) {
			// var $input = $("input[type=file][name*='assoc_file_']").hide();
			// $input.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");			
			
			// var name = $input.find(":last").attr("name");
			// name = name.substr(0, name.length - 1) + (parseInt(name.substr(name.length - 1)) + 1);
			// if (matrixTools.dragDrop.formData) {
				// matrixTools.dragDrop.formData.append(name, file);
			// } else {
				// var data = new FormData();
				// data.append($, file);
				// matrixTools.dragDrop.formData = data;	
			// }
		}
		
		$("#drag-temp-browse").bind("click", function(){
			// delete any dragged data
			$(".drag-temp").remove();
			matrixTools.dragDrop.formData = null;
			$("#dropPreview").empty();
			
			// completely restore previous state
			$("#sq_commit_button").unbind("click").attr("onclick", matrixTools.dragDrop.oldSubmit);
			$("#main_form input[type=file]").show().trigger("click");
			return false;
		});
	};
	
	matrixTools.dragDrop.beginUpload = function(){
		var d = matrixTools.dragDrop.formData;
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
				if (typeof(local_file_table) === "undefined") {
					var location = data.match(/action="(?:[^\\"]+|\\.)*"/)[0];
					window.location.href = location;
				} else {
					document.forms[0]['changes'].value = '0';
					window.location.reload();
				}
			}
		});
	};

	matrixTools.dragDrop.handleDrop = function(event){
		var dt = event.dataTransfer,
			files = dt.files,
			count = files.length;
		
		event.stopPropagation();
		event.preventDefault();
		
		var $commitButton = $("#sq_commit_button");
		matrixTools.dragDrop.oldSubmit = $commitButton.attr("onclick");
		$commitButton.attr("onclick", "").unbind("click").bind("click", function(){
			var $rootNodeSelector = $("#sq_asset_finder_bulk_file_import_local_upload_root_asset_assetid");
			$(this).attr("disabled", true);
			if ($rootNodeSelector.length > 0 && $rootNodeSelector.val().length === 0) {
				alert ("You need specify a Root Node before the upload can proceed.");
				$(this).attr("disabled", false);
			} else {		
				matrixTools.dragDrop.beginUpload();
				$(this).attr("disabled", true);
			}
			return false;
		});		
	
		for (var i = 0; i < count; i++) {
			var file = files[i],
				droppedFileName = file.name,
		
			reader = new FileReader();
			reader.index = i;
			reader.file = file;
			// file previews are only available in single drag/drop operations
			if (!matrixTools.dragDrop.isBulkFileTool()) {
				reader.addEventListener("loadend", function(e){
					if (e.target.file.type.search(/image/) > -1) {
						matrixTools.dragDrop.showPreview(e);
					} else {
						matrixTools.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
					}
					e.preventDefault();
				}, false);
				reader.readAsDataURL(file);
				
				break;
			} else {
				reader.addEventListener("loadend", function(e){
					matrixTools.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
					e.preventDefault();
				}, false);
				reader.readAsBinaryString(file);			
			}
		}
	};
	
	matrixTools.dragDrop.showPreview = function(event){
		var data = event.target.result,
			index = event.target.index,
			file = event.target.file,
			getBinaryDataReader = new FileReader();

		$("#dropPreview").html("<img id='item " + index + "' src='" + data + "' />");
		getBinaryDataReader.addEventListener("loadend", function(evt){
			matrixTools.dragDrop.prepareUpload(file, index, evt.target.result, false);
		}, false);
		getBinaryDataReader.readAsBinaryString(file);
	};
	
	matrixTools.dragDrop.isBulkFileTool = function(){
		return (typeof(local_file_table) === "undefined" ? false : true);
	};
	
	matrixTools.dragDrop.isParseFile = function(){
		return $("input[type=file][name*='assoc_file_']").length === 0 ? false : true;
	};
	
	matrixTools.dragDrop.init();
});