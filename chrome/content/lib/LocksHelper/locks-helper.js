$(document).ready(function(){
	
	// inject timer and icon	
	$('#sq_lock_release_manual').before('<div id="matrixTools-lock-countdown" style="position: relative; top: 23px; left: 152px;"></div>');
	$('#sq_lock_release_manual').before('<img id="matrixTools-lockstatus" src="chrome://matrixTools/content/lib/LocksHelper/lock-helper-green.png" style="position:relative;top:6px;left:130px" />');		
	
	// scrape the lock time from the page - need to checks due to different page types
	if( $('#sq_lock_info').length ) {
		lockTime = $('#sq_lock_info').html();
	} else {
		lockTime = $('.sq-lock-message').html();
	}

	//hours
	var pattHours=/[0-9] hour/i;
	lockTimeHours = lockTime.match(pattHours);
	if( lockTimeHours === null ) {
		lockTimeHours = '0h';
	} else {
		lockTimeHours = String(lockTimeHours).replace(" hour", "h");
	}
	
	// minutes
	var pattMinutes=/[0-5] minute|[0-5][0-9] minute/i;
	lockTimeMinutes = lockTime.match(pattMinutes);
	if( lockTimeMinutes === null ) {
		lockTimeMinutes = '0m';
	} else {
		lockTimeMinutes = String(lockTimeMinutes).replace(" minute", "m");
	}
	
	//seconds
	var pattSeconds=/[0-5] second|[0-5][0-9] second/i;
	lockTimeSeconds = lockTime.match(pattSeconds);
	if( lockTimeSeconds === null ) {
		lockTimeSeconds = '0s';
	} else {
		lockTimeSeconds = String(lockTimeSeconds).replace(" second", "s");
	}
	
	var countDownStart = '+' + lockTimeHours + ' +' + lockTimeMinutes + ' +' + lockTimeSeconds;
	
	$('#matrixTools-lock-countdown').countdown({ until: countDownStart, compact: false, layout: '{h<} {hn} {hl} {h>} {m<} {mn} {ml} {m>} {s<} {sn} {sl} {s>} until locks expire', 
		significant: 1, onExpiry: lockExpired, onTick: watchCountdown, labels: ['years','months','weeks','days','hours','minutes','seconds'], 
		labels1: ['year','month','week','day','hour','minute','second'], 
		expiryText: 'Locks have expired' });
	
	// lock expired, 
	function lockExpired() {
		$('#matrixTools-lockstatus').attr('src','chrome://matrixTools/content/lib/LocksHelper/lock-helper-red.png');
		$('#matrixTools-lock-countdown').removeClass('warning');
		$('#matrixTools-lock-countdown').addClass('expired');
	}

	// lock expiry warning (in seconds)
	function watchCountdown(periods) {
		if( $.countdown.periodsToSeconds(periods) === 30 ) {
			$('#matrixTools-lockstatus').attr('src','chrome://matrixTools/content/lib/LocksHelper/lock-helper-yellow.png');
			$('#matrixTools-lock-countdown').addClass('warning');
		}
	}
	
});