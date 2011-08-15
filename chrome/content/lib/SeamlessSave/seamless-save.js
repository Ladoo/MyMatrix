$(document).ready(function(){

	//inject the saving message box into the page (hidden by default)
	$('#sq_commit_button').after('<div id="matrixdevelopertoolbar-seamless-save-message" style="background:rgba(0,0,0,0.8);color:#fff;display:none;position:fixed;bottom:8px;right:65px;padding:5px 30px;text-align:center;"><p style="margin:0;padding:0;color:white">Saving...</p></div>');
	
	//get the default button action
	var defaultButtonAction = $("#sq_commit_button").attr("onclick");
	
	//remove the default matrix onclick event for the save button
	$('#sq_commit_button').attr('onclick','');
	
	 var options = { 
	    beforeSubmit:  showMessage,  // pre-submit callback 
        success:       hideMessage  // post-submit callback 
    }; 
 
	//add ajax click event
	$('#sq_commit_button').click(function() {
		//check if user has updated div details
		$("#main_form [name*=bodycopy_saved]").each(function(){ 
			if ( $(this).val().length > 0 ) {
				$('#sq_commit_button').attr('onclick',defaultButtonAction);
				document.forms["main_form"].submit();
				return false;
			} 
		})
		//check if user has added new nested content
		if ( $('td[id*="content_type_nest_content"]:contains("No page has been selected")').length ) {
			$('#sq_commit_button').attr('onclick',defaultButtonAction);
			document.forms["main_form"].submit();
			return false;
		}
		//ajax submit
		if( $('#sq_commit_button').attr('onclick') === '' ) {
			$('#matrixdevelopertoolbar-seamless-save-message').html("Saving...");
			$('#matrixdevelopertoolbar-seamless-save-message').html("Saving...");
			$('#main_form').ajaxSubmit(options); 
			return false;
		}
	});
	
});

//callback functions for pre and post submit - display/hide save alert
function showMessage() {
	$('#sq_commit_button').attr('disabled',true);
	$('#matrixdevelopertoolbar-seamless-save-message').fadeIn('slow');
}
function hideMessage(data, status, xhr) {
	$.get(window.location.href, function(data){
		if (data.search(/sq_lock_release_manual/) > -1) {
			$('#matrixdevelopertoolbar-seamless-save-message').html("Saved!...").delay(3000).fadeOut('slow');
		} else {
			$('#matrixdevelopertoolbar-seamless-save-message').html("Error!...").delay(3000).fadeOut('slow');
		}
	});
	$('#sq_commit_button').attr('disabled',false);	
}

sq_main.$("#main_form [name*=bodycopy_saved]").each(function(){ if ($(this).val().length > 0) return true })