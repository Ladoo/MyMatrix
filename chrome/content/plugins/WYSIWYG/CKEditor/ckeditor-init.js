$(document).ready(function(){
	$('table[content_type] textarea,td[id*=content_type_wysiwyg] textarea').each(function(){
		if ($(this).attr('id').search(/wysiwyg/) !== -1) {
			var $table = $(this).parents('table[content_type],table[layout_type]');
			$(this).appendTo($table.parent());
			$table.children().hide();
			CKEDITOR.replace($(this).attr('id'), { toolbar: 'Coder', height: 600 });
		}
	});
});