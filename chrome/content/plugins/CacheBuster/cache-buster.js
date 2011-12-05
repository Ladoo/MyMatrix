$(document).ready(function(){
    chrome.tabs.getSelected(null, function(tab){
        // TODO: Detection should already be done from the background page, need to find a way to fix this
        if (tab.title.search(/administration/i) > -1 && tab.title.search(/matrix/i) > -1) {
            var loaderPath = '../gui/icons/loader-horizontal.gif',
                matrixCacheURL = tab.url.replace(/\?SQ_ACTION=login/, "").replace(/&/, "") + "?SQ_BACKEND_PAGE=main&backend_section=tools",
                assetID = null;

            // TODO: This logic should be abstracted away so that it's the same for Firefox and Chrome
            // Listen for events from content scripts
            chrome.extension.onRequest.addListener(function(request, sender) {
                switch (request.msg) {
                    case "myMatrix-RealAssetID":
                        assetID = request.data;
                        break;
                    default:
                        break;
                }
            });

            // TODO: This logic should be abstracted away so that it's the same for Firefox and Chrome
            // Get the current asset ID (if available)
            chrome.tabs.sendRequest(tab.id, {
                msg: "myMatrix-GetRealAssetID"
            });

            // TODO: This logic should be abstracted away so that it's the same for Firefox and Chrome
            $("#cacheBuster").bind("click", function(){
                if ($(this).attr("disabled") !== "disabled") {
                    // Clear Matrix Cache
                    if (assetID) {
                        $("img").show();
                        $(this).attr("disabled", true);
                        var data = new FormData();
                        data.append("process_form", 1);
                        data.append("changes", 0);
                        data.append("allowconfirm", 1);
                        data.append("committed_tool_type_code", "tool_clear_matrix_cache");
                        data.append("tool_clear_matrix_cache_assetid[assetid]", assetID);
                        data.append("tool_clear_matrix_cache_assetid[linkid]", "");
                        data.append("tool_clear_matrix_cache_assetid[url]", "//");
                        data.append("tool_clear_matrix_cache_level", "dependants");
                        data.append("tool_clear_matrix_cache_type_codes[]", "");
                        data.append("tool_clear_matrix_cache_clear_now", 1);
                        data.append("sq_lock_release", 1);

                        // TODO: Add support for Clear cache jobs that spawn HIPOs
                        $.ajax({
                            url: matrixCacheURL,
                            type: "POST",
                            data: data,
                            processData: false,
                            contentType: false,
                            success: function(data){
                                $("img").hide();
                                $("#cacheBuster").attr("disabled", false);
                                // TODO: Clear Squid cache (if appropriate)
                            }
                        });
                    }
                }
            }).after("<img src='"+ loaderPath + "' />");
        }
    });
});