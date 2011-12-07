//CodeMirror.modeExtenders["css"] = function ()
CodeMirror.defineMode("css_ext", function (config, parserConfig)
{
  var cssOverlay =
  {
    token: function (stream, state)
    { // Stub
      stream.skipToEnd();
      return null;
    }
  };
  var resMode = CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || "css")
    , cssOverlay);

  resMode.commentStart = "/*";
  resMode.commentEnd = "*/";
  resMode.wordWrapChars = [";", "\\{", "\\}"];

  // Formatting-related
  resMode.autoFormatLineBreaks = function (text)
  {
    return text.replace(new RegExp("(;|\\{|\\})([^\r\n])", "g"), "$1\n$2");
  };

  return resMode
});