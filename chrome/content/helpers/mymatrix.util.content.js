// Chops HTML content based on a set of regular expressions. Faster than using jQuery.
myMatrix.util.chopContent = function(content, startPointRegex, endPointRegex) {
    if (!content) {
        return false;
    }

    // Delete all scripts, styles and images from the html
    content = content.replace(myMatrix.util.regex.scriptBlock, "").replace(myMatrix.util.regex.styleBlock, "").replace(myMatrix.util.regex.allImages, "");

    // Now anchor the content from one point to another
    startPointRegex = (!startPointRegex) ? myMatrix.util.regex.contentBegin : startPointRegex;
    endPointRegex = (!endPointRegex) ? myMatrix.util.regex.contentEnd : endPointRegex;

    var start = content.search(startPointRegex);
    var end = content.search(endPointRegex);
    content = content.substring(start, end);

    return content;
}

// Set of Regular Expressions for finding elements, stripping out elements. Faster than using jQuery.
myMatrix.util.regex = {
    pageRedirect: /self.location\s=\s*"[^"]*"/,
    hipoJobCode: /hipo_source_code_name=\w*\W\w*/,
    hipoRunning: /A HIPO Job with this code name is currently run/,
    contentBegin: /<form[^>]*>/,
    contentEnd: /<\/form>/,
    scriptBlock: /(<script [^>]*)(.|\s)*?(<\/script>).*/g,
    styleBlock: /(<style [^>]*)(.|\s)*?(<\/style>).*/g,
    allImages: /<img [^>]*>/g,
    onClick: /onclick=\s*"[^"]*"/
}