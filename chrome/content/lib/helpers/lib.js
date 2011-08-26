// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
/*
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fun){
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in t)
        fun.call(thisp, t[i], i, t);
    }
  };
}
*/

// https://github.com/jquery/jquery/blob/master/src/core.js
function inArray( elem, array ) {
	var indexOf = Array.prototype.indexOf;
	
	if ( !array ) {
		return -1;
	}

	if ( indexOf ) {
		return indexOf.call( array, elem );
	}

	for ( var i = 0, length = array.length; i < length; i++ ) {
		if ( array[ i ] === elem ) {
			return i;
		}
	}

	return -1;
};
