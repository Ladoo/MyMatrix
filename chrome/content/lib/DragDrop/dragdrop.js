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
	
	concierge.dragDrop.prepareUpload = function(file, index, bin){
		var $fileInput = $("#main_form input[type=file]").hide();
		$fileInput.before("<input type='text' class='sq-form-field drag-temp' value='" + file.name + "' /> <input type='button' class='sq-form-field drag-temp' value='Browse…' />");
		var data = new FormData();
		data.append("image_0", file);
		concierge.dragDrop.formData = data;
		
		$("#sq_commit_button").attr("onclick", "").bind("click", function(){
			concierge.dragDrop.beginUpload();
			$(this).attr("disabled", "disabled");
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

		$dropPreview.append("<img id='item " + index + "' src='" + data + "' />");
		getBinaryDataReader.addEventListener("loadend", function(evt){
			concierge.dragDrop.prepareUpload(file, index, evt.target.result);
		}, false);
		getBinaryDataReader.readAsBinaryString(file);
	};

	
	concierge.dragDrop.init();
});