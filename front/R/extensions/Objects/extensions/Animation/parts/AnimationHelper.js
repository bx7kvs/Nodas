/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', function AnimationHelper () {

    function TickVal(complete, start, end) {
        var locs = false, loce = false;
        if (typeof start == "function") locs = start();
        if (typeof end == "function") loce = end();

        if (start.constructor === Array) {
            var result = [];
            for (var i = 0; i < start.length; i++) {
                result.push(TickVal(complete, start[i], end[i]));
            }
        }
        else if (typeof start == 'object') {
            var result = {};
            for (var prop in start) {
                result[prop] = TickVal(complete, start[prop], end[prop]);
            }
        }
        else if (typeof start == 'number' || typeof start == 'function') {
            var endval     = loce === false ? end : loce;
            var startval   = locs === false ? start : locs;
            var difference = endval - startval;
            if (complete >= 1) {
                var value = endval;
            }
            else {

                var value = startval + (difference * complete);
            }
            var result = value;
        }
        return result;
    }

    this.normalizeConfig = function(config) {
        config.duration = typeof config.duration == "number" && config.duration > 0 ? config.duration : 1000;
        config.queue    = !!config.queue;
        config.step     = typeof config.step == "object" ? config.step : {};
        config.easing   = typeof config.easing == 'string' ? config.easing : 'linear';
        config.done     = typeof config.done === "function" ? config.done : function () {};
    };

    this.getTickFunction = function () {
        return TickVal;
    };

});