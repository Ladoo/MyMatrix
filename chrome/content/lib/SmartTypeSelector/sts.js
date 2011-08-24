// Todo: Refactoring love
$(document).ready(function(){
	// globals
	matrixTools.sts = {};
	
	// privates
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
	function init(){
		$selectors.each(function(){
			var $selector = $(this);
			if ($.inArray($selector.attr("id"), idsInserted) === -1) {
				idsInserted.push($selector.attr("id"));
				$selector.parent().children("input,select,label").hide();
				
				// construct the initial ui (before type formats are placed in there)
				// <input type='text' value='' />
				$selector.after("<div class='sst-selector'><div class='search'>Show: <a href='#' class='all current'>All</a> <a href='#' class='selected'>Selected (<span>0</span>)</a></div><div class='groups'></div></div>");
				var $sst = $selector.next().children(".groups");
				
				// group each type format under the appropriate section
				$.each(groups, function(i, v){
					$sst.append("<div class='group'><strong>" + i + "</strong><ul></ul></div>");
					var $ul = $sst.find("ul:last"), $options = $selector.children();
					if (v.length > 0) {
						$.each(v, function(){
							var $option = $selector.find("option[value=" + this + "]");
							$ul.append("<li><span class='icon' style='background-image: url(/__data/asset_types/" + this + "/icon.png)'></span><input type='checkbox' value='" + this + "' name='" + $selector.attr("name") +"' /><label>" + $option.text() + "</label><span class='toggle'>inherit</span></li>");
						});
					} else {
						$ul.parent().addClass("full")
						$options.each(function(){
							// check if it hasn't already been added to one of the pre-defined lists
							if ($sst.find("input:[value=" + this.value + "]").length === 0 && this.text.length > 0) {
								$ul.append("<li><span class='icon' style='background-image: url(/__data/asset_types/" + this.value + "/icon.png)'></span><input type='checkbox' value='" + this.value + "' name='" + $selector.attr("name") +"' /><label>" + this.text + "</label><span class='toggle'>inherit</span></li>");
							}
						});
					}
				});
				
				selectAssets($selector.parent(), $sst);
				removeOldElements($selector.parent());
				bindHandlers($sst.parent());
			}
		});	
	}
	
	function selectAssets($from, $to){
		// find all options in the container based on the "value"
		var $selected = $from.find("option:selected:not(:empty)");
		$selected.each(function(){
			var $checkbox = $to.find("input[value=" + $(this).val() + "]").attr("checked", "checked");
			var $inherit = $(this).parent().nextAll("input[type=hidden]:first");
			if (parseInt($inherit.val()) === 1) {
				$checkbox.nextAll("span").addClass("toggle-on");
			}
			$inherit.appendTo($checkbox.parent());
			matrixTools.sts.inheritName = $inherit.attr("name"); 
		});
		
		determineSelectedItems($to.parent());
	}
	
	function removeOldElements($from){
		$from.children("select:not(.sst-control),input:not(.sst-control)").remove();
	}
	
	function determineSelectedItems($from){
		$from.find("a span").text($from.find("input:checked").length);
	}
	
	function bindHandlers($container){
		// toggle switches (all / selected)
		$container.children(".search").children("a").bind("click", function(){
			var $this = $(this), selected = $this.hasClass("current");
			if (selected) return false;
			
			$container.children(".search").children("a").removeClass("current");
			$this.addClass("current");
			
			var $c = $container.children(".groups");
			if ($this.hasClass("selected")) {
				$c.children(".group").hide();
				$c.append("<div class='group full additional'><strong>Selected asset types</strong><ul></ul></div>");
				$c.find("input:checked").parent().clone(true, true).appendTo($c.children(":last"));
			} else {
				$c.children(".additional").remove();
				$c.children(".group").show();
			}
			
			return false;
		});
		
		// inherit toggles
		$container.find(".toggle").bind("click", function(){
			$(this).toggleClass("toggle-on");
			if ($(this).hasClass("toggle-on")) {
				$(this).next().val(1);
			} else {
				$(this).next().val(0);
			}
		});
				
		// catch events when a user select / de-selects an item
		// we basically replicate the drop downs
		$container.find("label").bind("click", function(e){
			var $input = $(this).prev();
			var inherit = $input.nextAll(".toggle").hasClass("toggle-on") ? 1 : 0;
			
			if ($input.attr("checked")) {
				$input.attr("checked", false).nextAll("input[type=hidden]").remove();
				
			} else {
				$input.attr("checked", true).parent().append("<input type='hidden' class='sst-control' name='" + matrixTools.sts.inheritName + "' value='" + inherit + "' />");
			}
			determineSelectedItems($container);
			return false;
		});
	}
	
	
	// init
	init();
});