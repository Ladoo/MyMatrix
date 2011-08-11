// Original credit goes to Ryan Seddon (@ryanseddon)
// Code was slightly modified (to play nice with jQuery and follow conventions) for this implementation, however the core has remained
// http://www.thecssninja.com/javascript/fileapi

$(document).ready(function(){
	concierge.dragDrop = {};
	
	// Drag Enter (File Upload)
	function dragActive(){
		var $dropBox = $("#dropBox");
		$dropBox.addClass("active").removeClass("inactive");
		if (concierge.dragDrop.isBulkFileTool()) { 
			$dropBox.text("Drop files to import here.");
		} else {
			$dropBox.text("Drop file to upload here.");
		}
	}
	
	function dragNotActive(e){
		var $dropBox = $("#dropBox");
		$dropBox.removeClass("active").addClass("inactive");
		if (concierge.dragDrop.isBulkFileTool()) { 
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
	
	concierge.dragDrop.init = function(){
		$("#sq-content").append("<div id='dropPreview'></div>");
		var $inputRow = $("input[type=file]").parents("tr:first");
		var dropBoxHTML = "<div id='dropBox' class='inactive'></div>";
		if (concierge.dragDrop.isBulkFileTool()) {
			$("#bulk_file_import_table_container").before(dropBoxHTML);
		} else {
			$("div[id*=file_upload]").after(dropBoxHTML);
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
			concierge.dragDrop.handleDrop(e);
			dragNotActive(e);
			e.preventDefault();
		}, false);
	};
	
	concierge.dragDrop.prepareUpload = function(file, index, bin){
		if (!concierge.dragDrop.isBulkFileTool()) {
			var $input = $("#main_form input[type=file]").hide();
			$input.prevAll("input").remove();
			$input.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");
			
			var data = new FormData();
			data.append($input.attr("name"), file);
			concierge.dragDrop.formData = data;			
		} else {
			local_file_table.addRow();
			var $file = $(local_file_table.tbody).find("tr:last input"), $newInput;
			$file.after("<input type='text' name='" + $file.attr("name") + "' id='" + $file.attr("id") + "' value='" + file.name + "' />");
			$newInput = $file.next();
			$file.remove();
			
			local_file_table.fileSelected($newInput[0], $newInput.attr("name").match(/\d.?/)[0]);
			
			if (concierge.dragDrop.formData) {
				concierge.dragDrop.formData.append($file.attr("name"), file);
			} else {
				var data = new FormData();
				data.append($file.attr("name"), file);
				concierge.dragDrop.formData = data;	
			}
		}
		
		$("#drag-temp-browse").bind("click", function(){
			// delete any dragged data
			$(".drag-temp").remove();
			concierge.dragDrop.formData = null;
			$("#dropPreview").empty();
			
			// completely restore previous state
			$("#sq_commit_button").unbind("click").attr("onclick", concierge.dragDrop.oldSubmit);
			$("#main_form input[type=file]").show().trigger("click");
			return false;
		});
	};
	
	concierge.dragDrop.beginUpload = function(){
		var d = concierge.dragDrop.formData;
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

	concierge.dragDrop.handleDrop = function(event){
		var dt = event.dataTransfer,
			files = dt.files,
			count = files.length;
		
		event.stopPropagation();
		event.preventDefault();
		
		var $commitButton = $("#sq_commit_button");
		concierge.dragDrop.oldSubmit = $commitButton.attr("onclick");
		$commitButton.attr("onclick", "").unbind("click").bind("click", function(){
			var $rootNodeSelector = $("#sq_asset_finder_bulk_file_import_local_upload_root_asset_assetid");
			$(this).attr("disabled", true);
			if ($rootNodeSelector.length > 0 && $rootNodeSelector.val().length === 0) {
				alert ("You need specify a Root Node before the upload can proceed.");
				$(this).attr("disabled", false);
			} else {		
				concierge.dragDrop.beginUpload();
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
			if (!concierge.dragDrop.isBulkFileTool()) {
				reader.addEventListener("loadend", function(e){
					if (e.target.file.type.search(/image/) > -1) {
						concierge.dragDrop.showPreview(e);
					} else {
						concierge.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
					}
					e.preventDefault();
				}, false);
				reader.readAsDataURL(file);
				
				break;
			} else {
				reader.addEventListener("loadend", function(e){
					concierge.dragDrop.prepareUpload(e.target.file, e.target.index, e.target.result);
					e.preventDefault();
				}, false);
				reader.readAsBinaryString(file);			
			}
		}
	};
	
	concierge.dragDrop.showPreview = function(event){
		var data = event.target.result,
			index = event.target.index,
			file = event.target.file,
			getBinaryDataReader = new FileReader();

		$("#dropPreview").html("<img id='item " + index + "' src='" + data + "' />");
		getBinaryDataReader.addEventListener("loadend", function(evt){
			concierge.dragDrop.prepareUpload(file, index, evt.target.result, false);
		}, false);
		getBinaryDataReader.readAsBinaryString(file);
	};
	
	concierge.dragDrop.isBulkFileTool = function(){
		return (typeof(local_file_table) === "undefined" ? false : true);
	};

	
	concierge.dragDrop.init();
});