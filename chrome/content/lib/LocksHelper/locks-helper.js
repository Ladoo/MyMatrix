$(document).ready(function(){
	
	//check the lock status for the page - BETTER WAY TO CHECK THIS?
	var lockStatusHelper = $('.sq-backend-button-fake').html();
	
	//enable/disable the button based on lock status
	if(lockStatusHelper === 'Release Lock(s)') {
	
		$('#sq_commit_button').before('<div id="matrixdevelopertoolbar-lock-countdown" style="float:left;"></div>');
		$('#sq_commit_button').before('<img id="matrixdevelopertoolbar-lockstatus" src="chrome://matrixdevelopertoolbar/content/lib/LocksHelper/lock-helper-green.png" style="position:absolute;bottom:5px;left:170px" />');		
		lockTime = $.trim( $(".sq-backend-table-cell:contains('The lock is due to expire in')").html() );

		var pattHours=/[0-9] hour/i;
		lockTimeHours = lockTime.match(pattHours);
		if( lockTimeHours === null ) {
			lockTimeHours = '0h';
		} else {
			lockTimeHours = String(lockTimeHours).replace(" hour", "h");
		}
		
		var pattMinutes=/[0-5] minute|[0-5][0-9] minute/i;
		lockTimeMinutes = lockTime.match(pattMinutes);
		if( lockTimeMinutes === null ) {
			lockTimeMinutes = '0m';
		} else {
			lockTimeMinutes = String(lockTimeMinutes).replace(" minute", "m");
		}
		
		var pattSeconds=/[0-5] second|[0-5][0-9] second/i;
		lockTimeSeconds = lockTime.match(pattSeconds);
		if( lockTimeSeconds === null ) {
			lockTimeSeconds = '0s';
		} else {
			lockTimeSeconds = String(lockTimeSeconds).replace(" second", "s");
		}
		
		var countDownStart = '+' + lockTimeHours + ' +' + lockTimeMinutes + ' +' + lockTimeSeconds;
		
		$('#matrixdevelopertoolbar-lock-countdown').countdown({ until: countDownStart, compact: true, description: '', format: 'HMS', onExpiry: lockExpired, onTick: watchCountdown });
		
	}
	
	function lockExpired() {
		$('#matrixdevelopertoolbar-lockstatus').attr('src','chrome://matrixdevelopertoolbar/content/lib/LocksHelper/lock-helper-red.png');
		$('#sq_commit_button').after('<div id="matrixdevelopertoolbar-lock-expire-message" style="background:rgba(0,0,0,0.8);color:#fff;display:none;position:fixed;top:50%;right:50%;padding:5px 30px;text-align:center;"><h3>Warning! The locks for this page have expired!</h3></div>');	
		$('#matrixdevelopertoolbar-lock-expire-message').fadeIn('slow').delay(7000).fadeOut('slow');
	}

	function watchCountdown(periods) {
		if( $.countdown.periodsToSeconds(periods) === 30 ) {
			$('#matrixdevelopertoolbar-lockstatus').attr('src','chrome://matrixdevelopertoolbar/content/lib/LocksHelper/lock-helper-yellow.png');
			$('#sq_commit_button').after('<div id="matrixdevelopertoolbar-lock-expire-message" style="background:rgba(0,0,0,0.8);color:#fff;display:none;position:fixed;top:50%;right:50%;padding:5px 30px;text-align:center;"><h3>Warning! The locks for this page will expire in 30 seconds!</h3></div>');	
			$('#matrixdevelopertoolbar-lock-expire-message').fadeIn('slow').delay(7000).fadeOut('slow');
		}
	}
	
});