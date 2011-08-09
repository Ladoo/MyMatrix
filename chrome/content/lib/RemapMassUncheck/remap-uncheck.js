$(document).ready(function(){
	
	//inject the button into the page
	$('#remap_manager_19_remap_urls_page').before('<div style="text-align: right;"><input type="button" id="matrixdevelopertoolbar-remap-massuncheck-all" value="Uncheck All Never Delete"></div>');
	
	//check the lock status for the page
	var lockStatus = $('.sq-backend-button-fake').html();
	
	//enable/disable the button based on lock status
	if(lockStatus === 'Release Lock(s)') {
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('disabled',false);
	} else {
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('disabled',true);
	}
	
	//take action onclick
	$('#matrixdevelopertoolbar-remap-massuncheck-all').toggle(function() {
		$('input[name^="remap_manager_19_never_delete_remap"]').attr('checked',false);
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('value','Check All Never Delete');
	}, function() {
		$('input[name^="remap_manager_19_never_delete_remap"]').attr('checked',true);
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('value','Uncheck All Never Delete');
	});

});