$(document).ready(function(){
	
	// vars
	// not supported (yet) select[id*='add_layouts[]'],select[id*='new_type']']
	var $selectors = $("select[id*='types[type_code][]'],select[id*='create_types[]']"), idsInserted = [];
	var hidden = [],
		groups = {
			"Content": [ "page_standard", "news_item", "folder", "page_multiple_page", "comment", "page_asset_listing", "search_page" ],
			"Documents": [ "pdf_file", "word_doc", "excel_doc", "powerpoint_doc" ],
			"Files": [ "image", "mp3_file", "video_file", "file" ],
			"All other types": []
		};
	
	// functions
	function selectAssets($from, $to){
		// find all options in the container based on the "value"
		var $selected = $from.find("option:selected");
		$selected.each(function(){
			$to.find("input[value=" + $(this).val() + "]").attr("checked", "checked");
		});
		
		$to.find("a span").text($selected.length);
	}
	
	function bindHandlers($container){
		// insta-search
		
		// toggle switches (all / selected)
		$container.children(".search").children("a").bind("click", function(){
			var $this = $(this), selected = $this.hasClass("current");
			if (selected) return false;
			
			$container.children(".search").children("a").removeClass("current");
			$this.addClass("current");
			
			if ($this.hasClass("selected")) {
				$container.children(".group").hide();
				$container.append("<div class='group full additional'><strong>Selected asset types</strong><ul></ul></div>");
				$container.find("input:checked").parent().clone(true, true).appendTo($container.children(":last"));
			} else {
				$container.children(".additional").remove();
				$container.children(".group").show();
			}
			
			return false;
		});
		
		// make the whole row clickable, rather than just the checkbox
		$container.find("li").bind("click", function(e){
			var $input = $(this).children("input");
			if ($input.attr("checked")) {
				$input.attr("checked", false);
			} else {
				$input.attr("checked", true);
			}
			e.preventDefault();
			e.stopPropagation();
		});
	}
	
	
	// init
	$selectors.each(function(){
		var $selector = $(this);
		if ($.inArray($selector.attr("id"), idsInserted) === -1) {
			idsInserted.push($selector.attr("id"));
			$selector.parent().children("input,select,label").hide();
			
			// construct the initial ui (before type formats are placed in there)
			// <input type='text' value='' />
			$selector.after("<div class='sst-selector'><div class='search'>Show: <a href='#' class='all current'>All</a> <a href='#' class='selected'>Selected (<span>0</span>)</a></div></div>");
			var $sst = $selector.next();
			
			// group each type format under the appropriate section
			$.each(groups, function(i, v){
				$sst.append("<div class='group'><strong>" + i + "</strong><ul></ul></div>");
				var $ul = $sst.find("ul:last"), $options = $selector.children();
				if (v.length > 0) {
					$.each(v, function(){
						var $option = $selector.find("option[value=" + this + "]");
						$ul.append("<li><span style='background-image: url(/__data/asset_types/" + this + "/icon.png)'></span><input type='checkbox' value='" + this + "' name='" + $selector.attr("name") +"' /><label>" + $option.text() + "</label></li>");
					});
				} else {
					$ul.parent().addClass("full")
					$options.each(function(){
						// check if it hasn't already been added to one of the pre-defined lists
						if ($sst.find("input:[value=" + this.value + "]").length === 0) {
							$ul.append("<li><span style='background-image: url(/__data/asset_types/" + this.value + "/icon.png)'></span><input type='checkbox' value='" + this.value + "' name='" + $selector.attr("name") +"' /><label>" + this.text + "</label></li>");
						}
					});
				}
			});
			
			selectAssets($selector.parent(), $sst);
			bindHandlers($sst);
		}
	});
});