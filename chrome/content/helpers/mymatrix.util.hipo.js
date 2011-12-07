/*
    Class: HIPO
    
    This module runs a HIPO job continously until it is either finished or aborted by the user. It needs a valid id supplied to it for
    it to run correctly. The id is a URL which is given to the browser when attempting to run an intensive job (i.e. acquiring locks).
    Only one HIPO job can be run at a time. If multiple are requested they will be placed into an AJAX queue.
*/


/*
    Class: job
    A HIPO job object instance. Stored in the jobs property array of the HIPO class. Invoked by <add>.

    Accepts the following properties:
    * id - The ID of the HIPO job (i.e. hipo_job_acquire_locks-45f1ee817d6feb2ed56d3dfba24ed704)
    * success - The callback function for a successful object creation.
    * error - The callback function for a failed object creation.
*/
function job(id, callback) {
    this.id = id;
    this.status = "running";
    this.completedListeners = [callback];
};

function findJob(hipo_job_id) {
    if (hipo_job_id) {
        var job;
        $.each(myMatrix.utils.HIPO.jobs, function(){
            if (this.id == hipo_job_id) {
                job = this;
                return false;
            }
        });
        return job;
    } else {
        return null;
    }
};

function findJobIndex(hipo_job_id) {
    var job_index = 0;
    $.each(myMatrix.utils.HIPO.jobs, function(index, value){
        if (this.id == hipo_job_id) {
            job_index = index;
            return false;
        }
    });
    return job_index;
};

job.prototype = {		
    /*
        Function: continueJob
        A recursive function to run a HIPO job until its progress reports 100%. The progress is snatched from the HTML of the page.

        Parameters:
            string - html
            * HTML of the page that is outputted by the hipo herder. This is required for extracting the current progress of the hipo job.

        Returns:
            void
    */
    continueJob: function(html) {
        var tempID = Math.floor(Math.random() * 100000);
        $("body").append("<div id='" + tempID + "'></div>");
        var $hipo = $("#" + tempID).hide();
        html = myMatrix.util.chopContent(html);
        $hipo.append(html);

        var progress = parseInt($hipo.find(".sq-hipo-header-progress-bar-percent").text().replace("%", ""));
        if (!progress) { progress = 0; }
        $hipo.remove();


        var params = "?SQ_ACTION=hipo" + "&hipo_source_code_name=" + this.id + "&SQ_BACKEND_PAGE=main";

        if (progress < 100) {
            var $this = this,
                url = jmx.options.url + params;

            // run the AJAX call recursively until progress reports 100%
            $.ajax({
                type: "GET",
                url: url,
                success: function(html){
                    // The normal this clause has expired by now, and this becomes the GET post instead
                    // Hence why we use the $this, since its stored in memory
                    $this.continueJob(html);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    $.each(this.completedListeners, function(){
                        if ($.isFunction(this)) {
                            this("error", errorThrown);
                        }
                    });

                    // Delete the job from the job list
                    myMatrix.utils.HIPO.jobs.remove(findJobIndex(this.id));
                }
            }); // end $.ajax()
        } // end if (progress)
        else {
            $.each(this.completedListeners, function(){
                if ($.isFunction(this)) {
                    this("success");
                }
            });

            // Delete the job from the job list
            myMatrix.utils.HIPO.jobs.remove(findJobIndex(this.id));
        } // end else statement
    },
    cancel: function() {
        // TODO: This API hasn't been written yet, any takers?
    }
};

myMatrix.utils.HIPO = {
    jobs: [],

    /*
        Function: addJob
        Adds a new HIPO job to the end of its job list.

        Parameters:
            string - screen (default: details)
            function - callback(status, message)

            Callback parameters:
            * status - success/error
            * message
            * * on success the HIPO id will be returned
            * * on error the error_message will be returned

        Returns:
            bool - success/failure
    */
    addJob: function(id, callback) {
        if (!id || $.isFunction(id)) {
            return false;
        }

        // Adding a HIPO job with the same ID is pointless, therefore we can skip everything below
        if (findJob(id)) {
            return false;
        } else {
            var i = this.jobs.push(new job(id, callback));
            --i;

            this.jobs[i].continueJob();
            return true;
        }
    },

    /*
        Function: checkIfHIPOSpawned
        Based on supplied HTML string, checks if a HIPO spawned was spawned.

        Returns
            an object that looks like so:
            {
                bool - jobDetected
                bool - jobAlreadyRunning
                string - jobID
            }
    */
    checkIfHIPOSpawned: function(html) {
	    // All hipo jobs have unique IDs. Therefore we need to find it.
        var result = {
            jobDetected: false,
            jobAlreadyRunning: false,
            jobID: null
        }, hipo_job_id = html.match(myMatrix.util.regex.hipoJobCode);
        
        if (hipo_job_id) {
            result.jobDetected = true;
            result.jobID = hipo_job_id[0].replace("hipo_source_code_name=", "");

            if (html.search(jmx.regex.hipoRunning) > -1) {
               result.jobAlreadyRunning = true;
            }
        }

        return result;
    },

    /*
        Function: addCompletedListener
        Adds a listener to a HIPO job or to all jobs. Is called when the job is completed (successfully or fails).

        Parameters:
            string - hipo_job_id
            function - callback(status, message)

            Callback parameters:
            * status - success/error
            * message
            * * on success the HIPO id will be returned
            * * on error the error_message will be returned

        Returns:
            bool - success/fail
    */
    addCompletedListener: function(hipo_job_id, callback) {
        // There are jobs in the list
        if (this.jobs.length > 0) {
            // no hipo job was specified, so add a listener to all jobs
            if ($.isFunction(hipo_job_id)) {
                $.each(this.jobs, function(){
                    this.completedListeners.push(hipo_job_id);
                });
                return true;
            } else {
                var job = findJob(hipo_job_id);
                if (job && $.isFunction(callback)) {
                    job.completedListeners.push(callback);
                    return true;
                } else {
                    return false;
                }
            }
        }
        // If there are no jobs in the list then we obviously can't add any listener
        else {
            return false;
        }
    }
}

