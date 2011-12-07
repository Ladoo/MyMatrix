CodeMirror.defineMode("javascript_ext", function (config, parserConfig)
{
  var javascriptOverlay =
  {
    token: function (stream, state)
    { // Stub
      stream.skipToEnd();
      return null;
    }
  };
  var resMode = CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || "javascript")
    , javascriptOverlay);

  resMode.commentStart = "/*";
  resMode.commentEnd = "*/";
  resMode.wordWrapChars = [";", "\\{", "\\}"];

  // Formatting-related
  resMode.getNonBreakableBlocks = function (text)
  {
    var nonBreakableRegexes = [
        new RegExp("for\\s*?\\(([\\s\\S]*?)\\)"),
        new RegExp("'([\\s\\S]*?)('|$)"),
        new RegExp("\"([\\s\\S]*?)(\"|$)"),
        new RegExp("//.*([\r\n]|$)")
      ];
    var nonBreakableBlocks = new Array();
    for (var i = 0; i < nonBreakableRegexes.length; i++)
    {
      var curPos = 0;
      while (curPos < text.length)
      {
        var m = text.substr(curPos).match(nonBreakableRegexes[i]);
        if (m != null)
        {
          nonBreakableBlocks.push({
            start: curPos + m.index,
            end: curPos + m.index + m[0].length
          });
          curPos += m.index + Math.max(1, m[0].length);
        }
        else
        { // No more matches
          break;
        }
      }
    }
    nonBreakableBlocks.sort(function (a, b)
    {
      return a.start - b.start;
    });

    return nonBreakableBlocks;
  };

  resMode.autoFormatLineBreaks = function (text)
  {
    var curPos = 0;
    var reLinesSplitter = new RegExp("(;|\\{|\\})([^\r\n])", "g");
    var nonBreakableBlocks = this.getNonBreakableBlocks(text);
    if (nonBreakableBlocks != null)
    {
      var res = "";
      for (var i = 0; i < nonBreakableBlocks.length; i++)
      {
        if (nonBreakableBlocks[i].start > curPos)
        { // Break lines till the block
          res += text.substring(curPos, nonBreakableBlocks[i].start).replace(reLinesSplitter, "$1\n$2");
          curPos = nonBreakableBlocks[i].start;
        }
        if (nonBreakableBlocks[i].start <= curPos
          && nonBreakableBlocks[i].end >= curPos)
        { // Skip non-breakable block
          res += text.substring(curPos, nonBreakableBlocks[i].end);
          curPos = nonBreakableBlocks[i].end;
        }
      }
      if (curPos < text.length - 1)
      {
        res += text.substr(curPos).replace(reLinesSplitter, "$1\n$2");
      }
      return res;
    }
    else
    {
      return text.replace(reLinesSplitter, "$1\n$2");
    }
  };

  return resMode;
});