$(document).ready(function(){

	//inject the saving message box into the page (hidden by default)
	$('#sq_commit_button').after('<div id="matrixdevelopertoolbar-seamless-save-message" style="background:rgba(0,0,0,0.8);color:#fff;display:none;position:fixed;bottom:8px;right:65px;padding:5px 30px;text-align:center;"><p style="margin:0;padding:0;color:white">Saving...</p></div>');
	
	//remove the default matrix onclick event for the save button
	$('#sq_commit_button').attr('onclick','');
	
	 var options = { 
	    beforeSubmit:  showMessage,  // pre-submit callback 
        success:       hideMessage  // post-submit callback 
    }; 
 
	//add ajax click event
   $('#sq_commit_button').click(function() {
		$('#main_form').ajaxSubmit(options); 
		// return false to prevent normal browser submit and page navigation 
		return false; 
	});
	
});

//callback functions for pre and post submit - display/hide save alert
function showMessage() {
	$('#sq_commit_button').attr('disabled',true);
	$('#matrixdevelopertoolbar-seamless-save-message').fadeIn('slow');
}
function hideMessage(data) {
	//if(sq_lock_release_manual) does not exist
		//inform user we have lost lock, no save
	//else
		//save success
		$('#sq_commit_button').attr('disabled',false);
		$('#matrixdevelopertoolbar-seamless-save-message').html("Saved!...").delay(3000).fadeOut('slow');
}