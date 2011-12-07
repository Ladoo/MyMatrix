CodeMirror.defineMode("htmlmixed_ext", function (config, parserConfig)
{
  var htmlmixedOverlay =
  {
    token: function (stream, state)
    { // Stub
      stream.skipToEnd();
      return null;
    }
  };
  var resMode = CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || "htmlmixed")
    , htmlmixedOverlay);

  resMode.commentStart = "<!--";
  resMode.commentEnd = "-->";
  resMode.wordWrapChars = [">", ";", "\\{", "\\}"];

  // ========================= Formatting-related ===========================
  resMode.getModeInfos = function (text, absPos)
  {
    var modeInfos = new Array();
    modeInfos[0] =
      {
        pos: 0,
        mode: CodeMirror.getMode(config, { name: "xml_ext", htmlMode: true }),
        modeName: "xml"
      };

    var modeMatchers = new Array();
    modeMatchers[0] =
      {
        regex: new RegExp("<style[^>]*>([\\s\\S]*?)(</style[^>]*>|$)", "i"),
        mode: CodeMirror.getMode(config, "css_ext"),
        modeName: "css"
      };
    modeMatchers[1] =
      {
        regex: new RegExp("<script[^>]*>([\\s\\S]*?)(</script[^>]*>|$)", "i"),
        mode: CodeMirror.getMode(config, "javascript_ext"),
        modeName: "javascript"
      };

    var lastCharPos = (typeof (absPos) !== "undefined" ? absPos : text.length - 1);
    // Detect modes for the entire text
    for (var i = 0; i < modeMatchers.length; i++)
    {
      var curPos = 0;
      while (curPos <= lastCharPos)
      {
        var m = text.substr(curPos).match(modeMatchers[i].regex);
        if (m != null)
        {
          if (m.length > 1 && m[1].length > 0)
          {
            // Push block begin pos
            var blockBegin = curPos + m.index + m[0].indexOf(m[1]);
            modeInfos.push(
              {
                pos: blockBegin,
                mode: modeMatchers[i].mode,
                modeName: modeMatchers[i].modeName
              });
            // Push block end pos
            modeInfos.push(
              {
                pos: blockBegin + m[1].length,
                mode: modeInfos[0].mode,
                modeName: modeInfos[0].modeName
              });
            curPos += m.index + m[0].length;
            continue;
          }
          else
          {
            curPos += m.index + Math.max(m[0].length, 1);
          }
        }
        else
        { // No more matches
          break;
        }
      }
    }
    // Sort mode infos
    modeInfos.sort(function sortModeInfo(a, b)
    {
      return a.pos - b.pos;
    });

    return modeInfos;
  };

  resMode.autoFormatLineBreaks = function (text, startPos, endPos)
  {
    var modeInfos = this.getModeInfos(text);
    var reBlockStartsWithNewline = new RegExp("^\\s*?\n");
    var reBlockEndsWithNewline = new RegExp("\n\\s*?$");
    var res = "";
    // Use modes info to break lines correspondingly
    if (modeInfos.length > 1)
    { // Deal with multi-mode text
      for (var i = 1; i <= modeInfos.length; i++)
      {
        var selStart = modeInfos[i - 1].pos;
        var selEnd = (i < modeInfos.length ? modeInfos[i].pos : endPos);

        if (selStart >= selEnd)
        { // The block starts later than the needed fragment
          break;
        }
        if (selStart < startPos)
        {
          if (selEnd <= startPos)
          { // The block starts earlier than the needed fragment
            continue;
          }
          selStart = startPos;
        }
        if (selEnd > endPos)
        {
          selEnd = endPos;
        }
        var textPortion = text.substring(selStart, selEnd);
        if (modeInfos[i - 1].modeName != "xml")
        { // Starting a CSS or JavaScript block
          if (!reBlockStartsWithNewline.test(textPortion)
              && selStart > 0)
          { // The block does not start with a line break
            textPortion = "\n" + textPortion;
          }
          if (!reBlockEndsWithNewline.test(textPortion)
              && selEnd < text.length - 1)
          { // The block does not end with a line break
            textPortion += "\n";
          }
        }
        res += modeInfos[i - 1].mode.autoFormatLineBreaks(textPortion);
      }
    }
    else
    { // Single-mode text
      res = modeInfos[0].mode.autoFormatLineBreaks(text);
    }

    return res;
  };

  return resMode;
});