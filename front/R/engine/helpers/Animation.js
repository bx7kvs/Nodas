/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.helper.system(
    function Animation() {

        function TickVal(complete, progress, start, end) {
            var locs = false, loce = false;
            if (typeof start === "function") locs = start();
            if (typeof end === "function") loce = end();

            if (start.constructor === Array) {
                var result = [];
                for (var i = 0; i < start.length; i++) {
                    result.push(TickVal(complete, progress, start[i], end[i]));
                }
            }
            else if (typeof start === 'object') {
                var result = {};
                for (var prop in start) {
                    result[prop] = TickVal(complete, progress, start[prop], end[prop]);
                }
            }
            else if (typeof start === 'number' || typeof start === 'function') {
                var endval = loce === false ? end : loce,
                    startval = locs === false ? start : locs,
                    difference = endval - startval,
                    result = startval + (difference * complete);
                if (progress >= 1) result = endval;
            }
            return result;
        }

        this.normalizeConfig = function (config) {
            config.duration = typeof config.duration === "number" && config.duration > 0 ? config.duration : 1000;
            config.queue = !!config.queue;
            config.step = typeof config.step === "object" ? config.step : {};
            config.easing = typeof config.easing === 'string' ? config.easing : 'linear';
            config.done = typeof config.done === "function" ? config.done : function () {
            };
        };

        this.getTickFunction = function () {
            return TickVal;
        };

    });