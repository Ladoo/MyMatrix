$(document).ready(function(){

	$('#remap_manager_19_remap_urls_page').before('<div style="text-align: right;"><input type="button" id="matrixdevelopertoolbar-remap-massuncheck-all" value="Uncheck All Never Delete"></div>');
	
	$('#matrixdevelopertoolbar-remap-massuncheck-all').toggle(function() {
		$('input[name^="remap_manager_19_never_delete_remap"]').attr('checked',false);
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('value','Check All Never Delete');
	}, function() {
		$('input[name^="remap_manager_19_never_delete_remap"]').attr('checked',true);
		$('#matrixdevelopertoolbar-remap-massuncheck-all').attr('value','Uncheck All Never Delete');
	});

});