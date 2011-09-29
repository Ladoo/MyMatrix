if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {
    $(document).ready(function(){

        // lock expired,
        function lockExpired() {
            $('#myMatrix-lock-countdown').removeClass('myMatrix-lock-countdown-warning');
            $('#myMatrix-lock-countdown').addClass('myMatrix-lock-countdown-expired');
        }

        // lock expiry warning (in seconds)
        function watchCountdown(periods) {
            if (typeof($.countdown.periodsToSeconds) !== "undefined") {
                if ($.countdown.periodsToSeconds(periods) === 30) {
                    $('#myMatrix-lock-countdown').addClass('myMatrix-lock-countdown-warning');
                }
            }
        }
        
        // inject timer and icon
        $('#sq_lock_release_manual').before('<div id="myMatrix-lock-countdown" /><div id="myMatrix-lockstatus" />');

        // scrape the lock time from the page - need to checks due to different page types
        if ($('#sq_lock_info').length) {
            lockTime = $('#sq_lock_info').html();
        } else {
            lockTime = $('.sq-lock-message').html();
        }

        //hours
        var pattHours = /[0-9] hour/i;
        lockTimeHours = lockTime.match(pattHours);
        if (!lockTimeHours) {
            lockTimeHours = '0h';
        } else {
            lockTimeHours = String(lockTimeHours).replace(" hour", "h");
        }

        // minutes
        var pattMinutes = /[0-5] minute|[0-5][0-9] minute/i;
        lockTimeMinutes = lockTime.match(pattMinutes);
        if (!lockTimeMinutes) {
            lockTimeMinutes = '0m';
        } else {
            lockTimeMinutes = String(lockTimeMinutes).replace(" minute", "m");
        }

        //seconds
        var pattSeconds = /[0-5] second|[0-5][0-9] second/i;
        lockTimeSeconds = lockTime.match(pattSeconds);
        if (!lockTimeSeconds) {
            lockTimeSeconds = '0s';
        } else {
            lockTimeSeconds = String(lockTimeSeconds).replace(" second", "s");
        }

        var countDownStart = '+' + lockTimeHours + ' +' + lockTimeMinutes + ' +' + lockTimeSeconds;

        $('#myMatrix-lock-countdown').countdown({ until: countDownStart, compact: false, layout: '{h<} {hn} {hl} {h>} {m<} {mn} {ml} {m>} {s<} {sn} {sl} {s>} until locks expire',
            significant: 2, onExpiry: lockExpired, onTick: watchCountdown, labels: ['years','months','weeks','days','hours','minutes','seconds'],
            labels1: ['year','month','week','day','hour','minute','second'],
            expiryText: 'Locks have expired' });
    });
}