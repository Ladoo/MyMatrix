$(document).ready(function(){

	//inject the saving message box into the page (hidden by default)
	$('#sq_commit_button').after('<div id="matrixdevelopertoolbar-seamless-save-message" style="background:rgba(0,0,0,0.8);color:#fff;display:none;position:fixed;top:50%;right:50%;padding:5px 30px;text-align:center;"><h3>Saving...</h3></div>');
	
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
	$('#matrixdevelopertoolbar-seamless-save-message').fadeIn('slow');
}
function hideMessage() {
	$('#matrixdevelopertoolbar-seamless-save-message').delay(500).fadeOut('slow');
}