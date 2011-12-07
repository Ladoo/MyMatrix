// Todo: Refactoring love
if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {
    $(document).ready(function(){
        // globals
        myMatrix.sts = {
            selectors: [], // array of selector names and their inherit control names (important for submission of data)
            searchForAssetType: function($input){
                var $groups = $input.parent().next(), $query = $.trim($input.val().toLowerCase());

                if ($query.length > 0) {
                    $input.prev().show();
                    var results = [];
                    $groups.find("label").each(function(){
                        var text = $.trim($(this).text().toLowerCase());
                        if (text.search($query) !== -1) {
                            results.push($(this).parent()[0]);
                        }
                    });

                    if (results.length > 0) {
                        $groups.addClass("no-grid");
                        if ($groups.children(".search-results-heading").length === 0) {
                            $groups.prepend("<strong class='search-results-heading'>Search results</strong>");
                        }
                        $groups.find("li").hide();
                        $(results).each(function(){
                            $(this).show();
                        });
                    } else {
                        $groups.children(".search-results-heading").remove();
                        $groups.removeClass("no-grid").find("li").show();
                    }
                } else {
                    $groups.children(".search-results-heading").remove();
                    $groups.removeClass("no-grid").find("li").show();
                }
            }
        };

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
                myMatrix.sts.selectors.push({
                    selectName: $selector.attr("name"),
                    inheritName: findInheritControl($selector).attr("name")
                });

                if ($.inArray($selector.attr("id"), idsInserted) === -1) {
                    addEmptyFormat($selector);
                    idsInserted.push($selector.attr("id"));
                    $selector.parent().children("input,select,label").hide();

                    // construct the initial ui (before type formats are placed in there)
                    // <input type='text' value='' />
                    $selector.after("<div class='sst-selector'><div class='search'>Show: <a href='#' class='all current'>All</a> <a href='#' class='selected'>Selected (<span>0</span>)</a> <input type='text' value='Type to search for assets' class='default' /></div><div class='groups'></div></div>");
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

        function findInheritControl($selector) {
            return $selector.nextAll("input[type=hidden]:first");
        }

        // Finds a given selector obj based on its name
        // Only useful for when a user presses the "inherit" button
        function findSelectorInHistory(name) {
            for (var counter = 0; counter < myMatrix.sts.selectors.length; counter++) {
                var sel = myMatrix.sts.selectors[counter];
                if (sel.selectName === name) {
                    return sel;
                }
            }

            return null;
        }

        function selectAssets($from, $to){
            // find all options in the container based on the "value"
            var $selected = $from.find("option:selected:not(:empty)");
            $selected.each(function(){
                var $checkbox = $to.find("input[value=" + $(this).val() + "]").attr("checked", "checked");
                var $inherit = findInheritControl($(this).parent());
                if (parseInt($inherit.val()) === 1) {
                    $checkbox.nextAll("span").addClass("toggle-on");
                }
                $inherit.appendTo($checkbox.parent());
            });

            determineSelectedItems($to.parent());
        }

        function removeOldElements($from){
            $from.children("select:not(.sst-control),input:not(.sst-control)").remove();
        }

        function determineSelectedItems($from){
            $from.find("a.selected span").text($from.find("input:checked").length);
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
                    $c.addClass("no-grid");
                    $c.prepend("<strong class='search-results-heading'>Selected asset types</strong>");
                    $c.find("li").hide();
                    $c.find("input:checked").each(function(){
                        $(this).parent().show();
                    });
                } else {
                    $c.children(".additional, .search-results-heading").remove();
                    $c.removeClass("no-grid");
                    $c.find("li").show();
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
                var inheritName = findSelectorInHistory($input.attr("name")).inheritName;

                if ($input.attr("checked")) {
                    $input.attr("checked", false).nextAll("input[type=hidden]").remove();

                } else {
                    $input.attr("checked", true).parent().append("<input type='hidden' class='sst-control' name='" + inheritName + "' value='" + inherit + "' />");
                }
                determineSelectedItems($container);
                return false;
            });

            // bind the search input field
            $container.children(".search").children("input")
                .bind("focus", function(){
                    if ($(this).hasClass("default")) {
                        $(this).val("").removeClass("default");
                    }
                })
                .bind("blur", function(){
                    if ($(this).val().length === 0) {
                        $(this).val("Type to search for assets").addClass("default");
                    }
                })
                .bind("keydown", function(){
                   myMatrix.sts.keyDown = true;
                    // unset keydown var after 80 ms
                    clearTimeout(myMatrix.sts.keyDownTimeout);
                    myMatrix.sts.keyDownTimeout = setTimeout(function(){
                        myMatrix.sts.keyDown = false;
                    }, 200);
                })
                .bind("keyup", function(){
                    var $this = $(this);
                    setTimeout(function(){
                        // if key is not down, then perform a search
                        if (!myMatrix.sts.keyDown) {
                            clearTimeout(myMatrix.sts.keyDownTimeout);
                            myMatrix.sts.searchForAssetType($this);
                        }
                    }, 400);
                });
        }

        function capitaliseFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Adds an empty hidden input field
        // Ensures that if a user has de-selected all type formats that it gets registered
        function addEmptyFormat($selector){
            var selName = $selector.attr("name");
            $selector.parent().append("<input type='hidden' class='sst-control' name='" + selName + "' value='' />");
            $selector.parent().append("<input type='hidden' class='sst-control' name='" + findSelectorInHistory(selName).inheritName + "' value='' />");
        }

        // init
        init();
    });
}