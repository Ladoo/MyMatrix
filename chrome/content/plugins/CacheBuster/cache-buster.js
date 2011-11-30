$(document).ready(function(){
    chrome.tabs.getSelected(null, function(tab){
        // TODO: Detection should already be done from the background page, need to find a way to fix this
        if (tab.title.search(/administration/i) > -1 && tab.title.search(/matrix/i) > -1) {
            var loaderPath = '../gui/icons/loader-horizontal.gif',
                matrixCacheURL = tab.url + "?SQ_BACKEND_PAGE=main&backend_section=tools&tool_type_code=tool_clear_matrix_cache",
                assetID = null;

            // Listen for events from content scripts
            chrome.extension.onRequest.addListener(function(request, sender) {
                switch (request.msg) {
                    case "myMatrix-AssetID":
                        assetID = request.data;
                        break;
                    default:
                        break;
                }
            });

            // Get the current asset ID (if available)
            chrome.tabs.sendRequest(tab.id, {
                msg: "myMatrix-GetAssetID"
            });

            $("#cacheBuster").bind("click", function(){
                if ($(this).attr("disabled") !== "disabled") {
                    // Clear Matrix Cache
                    if (assetID) {
                        $("img").show();
                        $(this).attr("disabled", true);
                        var data = new FormData();
                        data.append("process_form", 1);
                        data.append("changes", 0);
                        data.append("tool_clear_matrix_cache_assetid[assetid]", assetID);
                        data.append("tool_clear_matrix_cache_assetid[url]", "//");
                        data.append("tool_clear_matrix_cache_level", "dependants");
                        data.append("tool_clear_matrix_cache_clear_now", 1);
                        data.append("sq_lock_release", 1);

                        $.ajax({
                            url: matrixCacheURL,
                            type: "POST",
                            data: data,
                            processData: false,
                            contentType: false,
                            success: function(data){
                                $("img").hide();
                                $("#cacheBuster").attr("disabled", false);
                            }
                        });
                    }
                }
            }).after("<img src='"+ loaderPath + "' />");
        }
    });
});