CodeMirror.defineMode("xml_ext", function (config, parserConfig)
{
  var xmlOverlay =
  {
    token: function (stream, state)
    { // Stub
      stream.skipToEnd();
      return null;
    }
  };
  var resMode = CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || "xml")
    , xmlOverlay);

  resMode.commentStart = "<!--";
  resMode.commentEnd = "-->";
  resMode.wordWrapChars = [">"];

  // Formatting-related

  resMode.autoFormatLineBreaks = function (text)
  {
    var lines = text.split("\n");
    var reProcessedPortion = new RegExp("(^\\s*?<|^[^<]*?)(.+)(>\\s*?$|[^>]*?$)");
    var reOpenBrackets = new RegExp("<", "g");
    var reCloseBrackets = new RegExp("(>)([^\r\n])", "g");
    for (var i = 0; i < lines.length; i++)
    {
      var mToProcess = lines[i].match(reProcessedPortion);
      if (mToProcess != null && mToProcess.length > 3)
      { // The line starts with whitespaces and ends with whitespaces
        lines[i] = mToProcess[1]
            + mToProcess[2].replace(reOpenBrackets, "\n$&").replace(reCloseBrackets, "$1\n$2")
            + mToProcess[3];
        continue;
      }
    }

    return lines.join("\n");
  };

  return resMode;
});