$(document).ready(function(){
	
	function updateTextAreas(){
		$("textarea:hidden").each(function(){
			var editor = window["editor_" + $(this).attr("id")];
			if (typeof(editor) !== "undefined" && editor._htmlArea) {
				$(this).val(editor.getHTML());
			}
		});
	}
	
	//inject the saving message box into the page (hidden by default)
	$('#sq_commit_button').after('<div id="seamlessSave"></div>');
	
	//get the default button action
	var defaultButtonAction = $("#sq_commit_button").attr("onclick");
	
	//remove the default matrix onclick event for the save button
	$('#sq_commit_button').attr('onclick','');
	
	 var options = { 
	    beforeSubmit:  showMessage,  // pre-submit callback 
        success:       hideMessage  // post-submit callback 
    }; 
 
	//add ajax click event
	$('#sq_commit_button').click(function(){
		//check if user has updated div details
		$("#main_form [name*=bodycopy_saved]").each(function(){ 
			if ( $(this).val().length > 0 ) {
				$('#sq_commit_button').attr('onclick',defaultButtonAction);
				document.forms["main_form"].submit();
				return false;
			} 
		})
		//check if user has added new nested content
		if ($('td[id*="content_type_nest_content"]:contains("No page has been selected")').length){
			$('#sq_commit_button').attr('onclick',defaultButtonAction);
			document.forms["main_form"].submit();
			return false;
		}
		//ajax submit
		if ($('#sq_commit_button').attr('onclick') === '') {
			$(this).val("Saving...");
			$("#seamlessSave").addClass("seamlessSave-saving");
			updateTextAreas(); // just incase the wysiwyg textareas haven't been updated... (bug: 48)
			$('#main_form').ajaxSubmit(options); 
			return false;
		}
	});
	
});

//callback functions for pre and post submit - display/hide save alert
function showMessage() {
	$('#sq_commit_button').attr('disabled',true);
	$('#seamlessSave').show();
}
function hideMessage(data, status, xhr) {
	$.get(window.location.href, function(data){
		if (data.search(/sq_lock_release_manual/) > -1) {
			$("#seamlessSave").removeClass("seamlessSave-saving").addClass("seamlessSave-success").delay(3000).fadeOut(function(){
				$(this).removeClass("seamlessSave-success");
			});
		} else {
			$("#seamlessSave").removeClass("seamlessSave-saving").addClass("seamlessSave-error").text("Error - could not save, your locks have been released.").delay(3000).fadeOut(function(){
				$(this).text("").removeClass("seamlessSave-error");
			});
		}
		
		$('#sq_commit_button').val("Save").attr('disabled', false);
		document.forms[0]['changes'].value = 0;
	});
}