if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {
    $(document).ready(function(){

        // lock expired,
        function lockExpired() {
            $('#myMatrix-lockstatus').removeClass('myMatrix-lock-countdown-warning');
            $('#myMatrix-lockstatus').addClass('myMatrix-lock-countdown-expired');
        }

        // lock expiry warning (in seconds)
        function watchCountdown(periods) {
            if (typeof($.countdown.periodsToSeconds) !== "undefined") {
                if ($.countdown.periodsToSeconds(periods) === 30) {
                    $('#myMatrix-lockstatus').addClass('myMatrix-lock-countdown-warning');
                }
            }
        }
        
        // inject timer and icon
        $('#sq_lock_release_manual').before('<div id="myMatrix-lock-countdown" /><div id="myMatrix-lockstatus" />');

        // scrape the lock time from the page - need to checks due to different page types
        if ($('#sq_lock_info').length) {
            var lockTime = $.trim($('#sq_lock_info .sq-backend-table-cell:last').text());
        } else {
            var lockTime = $('.sq-lock-message').html();
        }

        //hours
        var pattHours = /\d?\d?\s?hour/;
        if (lockTime.search(pattHours) === -1) {
            var lockTimeHours = '0h';
        } else {
            var lockTimeHours = lockTime.match(pattHours)[0].replace(" hours", "h");
        }

        // minutes
        var pattMinutes = /\d?\d?\s?minute/;
        if (lockTime.search(pattMinutes) === -1) {
            var lockTimeMinutes = '0m';
        } else {
            var lockTimeMinutes = lockTime.match(pattMinutes)[0].replace(" minutes", "m");
        }

        //seconds
        var pattSeconds = /\d?\d?\s?second/;
        if (lockTime.search(pattSeconds) === -1) {
            var lockTimeSeconds = '0s';
        } else {
            var lockTimeSeconds = lockTime.match(pattSeconds)[0].replace(" seconds", "s");
        }

        var countDownStart = '+' + lockTimeHours + '+' + lockTimeMinutes + ' +' + lockTimeSeconds;
        $('#myMatrix-lock-countdown').countdown({
            until: countDownStart,
            compact: false,
            layout: '{h<} {hn} {hl} {h>} {m<} {mn} {ml} {m>} {s<} {sn} {sl} {s>} until locks expire',
            significant: 1,
            onExpiry: lockExpired,
            onTick: watchCountdown,
            labels: ['years','months','weeks','days','hours','minutes','seconds'],
            labels1: ['year','month','week','day','hour','minute','second'],
            expiryText: 'Locks have expired'
        });
    });
}