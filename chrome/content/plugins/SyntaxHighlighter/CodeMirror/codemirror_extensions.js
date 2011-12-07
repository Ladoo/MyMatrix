function addExtensions(cmInstance)
{
  // ============== Formatting extensions ============================
  // Converts a { line, ch } object to a char position from the beginning of
  // the doc.
  cmInstance.relToAbs = function (relPos)
  {
    var curAbsPos = 0;
    for (var i = 0; i < relPos.line && i < this.lineCount(); i++)
    { // Count the \n char which is not retrieved
      curAbsPos += this.getLine(i).length + 1;
    }
    curAbsPos += relPos.ch;
    return curAbsPos;
  };

  // Converts char position from the beginning of the doc (e.g. 0 = first char)
  // to a { line, ch } object.
  cmInstance.absToRel = function (absPos)
  {
    var relPos = { line: 0, ch: 0 };
    for (i = 0; i < this.lineCount(); i++)
    { // Count the \n char which is not retrieved
      absPos -= this.getLine(i).length + 1;
      if (absPos <= 0)
      {
        relPos.line = i;
        relPos.ch = absPos + this.getLine(i).length + 1;
        return relPos;
      }
    }

    // The absPos is out of the upper bound, return the end of the doc
    var lastLn = this.lineCount() - 1;
    var lastCh = this.getLine(lastLn).length - 1;
    return { line: lastLn, ch: lastCh };
  };

  cmInstance.getSelectedRange = function ()
  {
    return { from: this.getCursor(true), to: this.getCursor(false) };
  }

  cmInstance.getMode = function ()
  {
    return CodeMirror.getMode({}, this.getOption("mode"));
  }

  cmInstance.getModeAtPos = function (pos)
  {
    var token = this.getTokenAt(pos);
    if (token.state.base.htmlState)
      return CodeMirror.getMode({}, (token.state.base.mode == "html" ? "htmlmixed" : token.state.base.mode) + "_ext");
    else
      return this.getMode();
  }

  // Adds extra \n chars to the specified text as needed and returns 
  // the wrapped text
  cmInstance.getWrappedText = function (text, charsPerLine, wordWrapChars)
  {
    var lines = text.split("\n");
    var res = "";
    var reSplitChars = new RegExp(wordWrapChars.join("|"));

    for (var i = 0; i < lines.length; i++)
    {
      if (lines[i].length == 0)
      { // Empty line
        res += "\n";
        continue;
      }

      var curPos = 0;
      while (curPos < lines[i].length)
      {
        var curStr = lines[i].substr(curPos, Math.min(lines[i].length - curPos, charsPerLine));
        var newPortion = "";
        if (curStr.length == charsPerLine)
        { // Enumerate chars from the end of the string to find breaking point 
          var posInString = curStr.length - 2;
          while (posInString > 0)
          {
            if (reSplitChars.test(curStr.charAt(posInString)))
            { // Breaking char found
              break;
            }
            posInString--;
          }
          if (posInString > 0)
          { // There was a breaking char in the string, catch it too
            newPortion = curStr.substr(0, posInString + 1);
          }
          else
          { // No breaking chars found, take charsPerLine chars 
            newPortion = curStr;
          }
        }
        else
        { // The string is shorter than charsPerLine, no breaking needed
          newPortion = curStr;
        }
        curPos += newPortion.length;
        // Don't append a line break after the last line
        res += newPortion + (curPos >= lines[i].length - 1
          && i == lines.length - 1 ? "" : "\n");
      }
    }

    return res;
  };

  // Increase/decrease indentation of the specified range
  cmInstance.indentRange = function (isIncreaseIndent, from, to)
  {
    this.operation(function ()
    {
      for (var i = from.line, e = to.line; i <= e; ++i)
      {
        cmInstance.indentLine(i, isIncreaseIndent);
      }
    });
  };

  // Comment/uncomment the specified range
  cmInstance.commentRange = function (isComment, from, to)
  {
    var curMode = this.getModeAtPos(this.getCursor());
    if (isComment)
    { // Comment range
      var commentedText = this.getRange(from, to);
      this.replaceRange(curMode.commentStart + this.getRange(from, to) + curMode.commentEnd
        , from, to);
      if (from.line == to.line && from.ch == to.ch)
      { // An empty comment inserted - put cursor inside
        this.setCursor(from.line, from.ch + curMode.commentStart.length);
      }
    }
    else
    { // Uncomment range
      var selText = this.getRange(from, to);
      var startIndex = selText.indexOf(curMode.commentStart);
      var endIndex = selText.lastIndexOf(curMode.commentEnd);
      if (startIndex > -1 && endIndex > -1 && endIndex > startIndex)
      {
        // Take string till comment start
        selText = selText.substr(0, startIndex)
        // From comment start till comment end
          + selText.substring(startIndex + curMode.commentStart.length, endIndex)
        // From comment end till string end
          + selText.substr(endIndex + curMode.commentEnd.length);
      }
      this.replaceRange(selText, from, to);
    }
  };

  // Word wraps the specified text range. Tabs are replaced with N spaces
  // according to options to provide correct chars width calculation.
  cmInstance.wordWrapRange = function (from, to)
  {
    var textToWrap = this.getRange(from, to);
    var tabReplacement = "";
    for (var i = 0; i < this.getOption("indentUnit"); i++)
    {
      tabReplacement += " ";
    }
    textToWrap = textToWrap.replace(new RegExp("\t", "g"), tabReplacement);
    this.replaceRange(textToWrap, from, to);

    // Recalc "to" in case there were tabs in the text
    to = this.absToRel(this.relToAbs(from) + textToWrap.length);

    // Get the needed width (in chars)
    var charWidth = 8; // Default value
    for (var i = from.line; i <= to.line; i++)
    {
      if (this.getLine(i).length > 1)
      { // Measure the actual char width
        charWidth = (this.charCoords({ line: i, ch: 1 }).x - this.charCoords({ line: from.line, ch: 0 }).x);
        break;
      }
    }

    var gutter = this.getGutterElement();
    var charsPerLine = -2
      + Math.round((this.getScrollerElement().clientWidth
        - (gutter != null ? gutter.clientWidth : 0))
        / charWidth);

    // Make the wrap
    var wrapChars = [",", "\\.", "\\(", "\\)", "\\s"].concat(this.getMode().wordWrapChars);
    var wrappedText = this.getWrappedText(textToWrap, charsPerLine, wrapChars);

    // Check whether the wrap will increase gutter width
    var oldLinesCountLength = this.lineCount().toString().length;
    var constLinesCount = this.lineCount() - (to.line - from.line + 1);

    function getNewDigits(oldLinesCountLength, wrappedText)
    {
      return (constLinesCount + wrappedText.charCount("\n")).toString().length - oldLinesCountLength;
    }

    var newDigits = getNewDigits(oldLinesCountLength, wrappedText);
    while (newDigits > 0)
    { // Gutter will be increased after wrap, re-calc needed
      charsPerLine -= newDigits;
      oldLinesCountLength += newDigits;
      wrappedText = this.getWrappedText(textToWrap, charsPerLine, wrapChars);
      newDigits = getNewDigits(oldLinesCountLength, wrappedText);
    }

    // Replace the range with wrapped text
    this.operation(function ()
    {
      cmInstance.replaceRange(wrappedText, from, to);
    });
  };

  // Applies automatic mode-aware indentation to the specified range
  cmInstance.autoIndentRange = function (from, to)
  {
    this.operation(function ()
    {
      for (var i = from.line; i <= to.line; i++)
      {
        cmInstance.indentLine(i);
      }
    });
  };

  // Applies automatic formatting to the specified range
  cmInstance.autoFormatRange = function (from, to)
  {
    var absStart = this.relToAbs(from);
    var absEnd = this.relToAbs(to);
    // Insert additional line breaks where necessary according to the
    // mode's syntax
    var res = this.getMode().autoFormatLineBreaks(this.getValue(), absStart, absEnd);

    // Replace and auto-indent the range
    this.operation(function ()
    {
      cmInstance.replaceRange(res, from, to);
      var startLine = cmInstance.absToRel(absStart).line;
      var endLine = cmInstance.absToRel(absStart + res.length).line;
      for (var i = startLine; i <= endLine; i++)
      {
        cmInstance.indentLine(i);
      }
    });
  };

  return cmInstance;
}