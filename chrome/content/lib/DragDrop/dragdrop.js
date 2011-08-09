// Original credit goes to Ryan Seddon (@ryanseddon)
// Code was slightly modified (to play nice with jQuery and follow conventions) for this implementation, however the core has remained
// http://www.thecssninja.com/javascript/fileapi

$(document).ready(function(){
	concierge.dragDrop = {};
	var $dropContainer, $dropPreview;
	
	// Drag Enter (File Upload)
	function showOverlay(){
		$("#drop").css("opacity", 0.5).show();
	}
	
	function hideOverlay(e){
		$("#drop").css("opacity", 0).hide();
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
		$("#main_form").append("<div id='drop'><h1>Drop your file here</h1></div>");
		var $inputRow = $("input[type=file]").parents("tr:first");
		$("#drop").css("top", $inputRow.position().top).css("left", $inputRow.position().left).css("width", $inputRow.width());
		
		
		$dropPreview = $("#dropPreview");
		$dropContainer = $("#main_form");
		$dropContainer.bind({
			dragenter: function(e){
				e.preventDefault();
				e.stopPropagation();
				showOverlay();
			},
			dragleave: function(e){
				e.preventDefault();
				e.stopPropagation();
				if (notInDropZone($("#drop"), e)) {
					hideOverlay(e);
				}
			},
			dragover: function(e){
				e.preventDefault();
				e.stopPropagation();
			}
		});
		
		$dropContainer[0].addEventListener("drop", function(e){
			concierge.dragDrop.handleDrop(e);
			hideOverlay(e);
			e.preventDefault();
		}, false);
	};
	
	concierge.dragDrop.uploadError = function(error){
		console.log("error: " + error.code);
	};
	
	concierge.dragDrop.prepareUpload = function(file, index, bin, bulk){
		if (!bulk) {
			var $input = $("#main_form input[type=file]").hide();
			$input.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' id='drag-temp-browse' class='sq-form-field drag-temp' value='Browse…' />");
			
			var data = new FormData();
			data.append($input.attr("name"), file);
			concierge.dragDrop.formData = data;			
		} else {
			local_file_table.addRow();
			var $input = $(local_file_table.tbody).find("tr:last input");
			$input.after("<input type='text' name='" + $input.attr("name") + " id='" + $input.attr("id") + "' ' />");
			local_file_table.fileSelected($input.next(), local_file_table.id_count);
			
			if (concierge.dragDrop.formData) {
				concierge.dragDrop.formData.append($input.attr("name"), file);
			} else {
				var data = new FormData();
				data.append($input.attr("name"), file);
				concierge.dragDrop.formData = data;	
			}
		}
		
		concierge.dragDrop.oldSubmit = $("#sq_commit_button").attr("onclick");
		$("#sq_commit_button").attr("onclick", "").bind("click", function(){
			concierge.dragDrop.beginUpload();
			$(this).attr("disabled", true);
			return false;
		});
		
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
				var location = data.match(/action="(?:[^\\"]+|\\.)*"/)[0];
				window.location.href = location;
			}
		});
	};

	concierge.dragDrop.handleDrop = function(event){
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
			if (typeof(local_file_table) === "undefined") {
				reader.addEventListener("loadend", function(e){
					if (e.target.file.type.search(/image/) > -1) {
						concierge.dragDrop.showPreview(e);
					}
					e.preventDefault();
				}, false);
				reader.readAsDataURL(file);
			} else {
				reader.addEventListener("loadend", function(e){
					concierge.dragDrop.prepareUpload(e.target.file, e.target.index, evt.target.result, true);
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

		$dropPreview.append("<img id='item " + index + "' src='" + data + "' />");
		getBinaryDataReader.addEventListener("loadend", function(evt){
			concierge.dragDrop.prepareUpload(file, index, evt.target.result, false);
		}, false);
		getBinaryDataReader.readAsBinaryString(file);
	};

	
	concierge.dragDrop.init();
});