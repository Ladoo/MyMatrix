$(document).ready(function(){
	if ($("#sq_lock_release_manual").length !== 0) {
		$("#remap_manager_19_select_all").parent().next().append("<input type='checkbox' checked='checked' class='sq-form-field' id='myMatrix-remap-massuncheck-all' />");
	}
	
	$('#myMatrix-remap-massuncheck-all').bind("change", function(){
		var checkStatus = ($(this).attr("checked")) ? $(this).attr("checked") : false;
		$('input[name^="remap_manager_19_never_delete_remap"]').attr('checked', checkStatus);
		return false;
	});
});