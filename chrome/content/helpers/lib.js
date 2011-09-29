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
