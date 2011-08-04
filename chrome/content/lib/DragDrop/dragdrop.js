// Original credit goes to Ryan Seddon (@ryanseddon)
// Code was slightly modified (to play nice with jQuery and follow conventions) for this implementation, however the core has remained
// http://www.thecssninja.com/javascript/fileapi

if (concierge) {
	concierge.dragDrop = {};
}

$(document).ready(function(){
	var $dropContainer, $dropListing;
	
	// Drag Enter (File Upload)
	function showOverlay(){
		$("#drop").css("opacity", 0.5);
	}
	
	function hideOverlay(e){
		$("#drop").css("opacity", 0);
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
		$("#sq-content").append("<ul id='dropListing'></ul>");
		$("#main_form").append("<div id='drop'><h1>Drop your file here</h1></div>");
		var $inputRow = $("input[type=file]").parents("tr:first");
		$("#drop").css("top", $inputRow.position().top).css("left", $inputRow.position().left).css("width", $inputRow.width());
		
		
		$dropListing = $("#dropListing");
		$dropContainer = $("#drop");
		$dropContainer.bind({
			dragenter: function(e){
				e.preventDefault();
				e.stopPropagation();
				showOverlay();
			},
			dragleave: function(e){
				e.preventDefault();
				e.stopPropagation();
				if (notInDropZone($dropContainer, e)) {
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
		}, false);
	};
	
	concierge.dragDrop.uploadError = function(error){
		console.log("error: " + error.code);
	};
	
	concierge.dragDrop.prepareUpload = function(file, index, bin){
		// Hard-coded for single uploads at the moment
		var $fileInput = $("input[type=file]");
		var name = $fileInput.attr("name");
		$fileInput.remove();
		$("#main_form").append("<input type='file' value='" + file.mozFullPath + "' name='" + name + "' />");	
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
			reader.addEventListener("loadend", function(e){ 
				concierge.dragDrop.buildImageListItem(e);
				e.preventDefault();
			}, false);
			reader.readAsDataURL(file);
		}
	};
	
	concierge.dragDrop.buildImageListItem = function(event){
		var data = event.target.result,
			index = event.target.index,
			file = event.target.file,
			getBinaryDataReader = new FileReader();

		$dropListing.append("<li><img id='item " + index + "' src='" + data + "' /></li>");
		getBinaryDataReader.addEventListener("loadend", function(evt){
			concierge.dragDrop.prepareUpload(file, index, evt.target.result);
		}, false);
		getBinaryDataReader.readAsBinaryString(file);
	};

	
	concierge.dragDrop.init();
});