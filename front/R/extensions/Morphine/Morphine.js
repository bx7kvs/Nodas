/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@inject', 'Easings', '@app', 'Debug', function Morphine(inject, Easings, app, Debug) {

    var morphines = [];

    this.create = function (start, end, func, easing, duration, rpt) {

        if (typeof start !== "number" || typeof end !== "number") {
            Debug.error({}, 'Morphine / Unable to create. Start value is wrong!');
            return;
        }

        if (typeof func !== "function") {
            Debug.error({}, 'Morphine / Unable to create. End value is wrong!');
            return;
        }

        if (typeof easing !== "string") {
            Debug.error({}, 'Morphine / Unable to create. Easing is not a string!');
            return;
        }

        if (typeof  duration !== "number" || duration <= 0) {
            Debug.error({}, 'Morphine / Unable to create. Duration is less than 0 or not a number');
        }

        var efunc = Easings.get(easing);

        if (!efunc) {
            Debug.error({easing: easing}, ' Morphine / Unable to create. No such easing {easing}');
        }


        var morphine = inject('Morphine');

        var tickF = morphine.config(start, end, func, duration, efunc, rpt);

        if (!tickF || typeof tickF !== "function") {
            Debug.error({}, 'Morphine / Unable to config morphine. Due to some error.');
            return;
        }

        tickF.$m = morphine;

        morphines.push(tickF);

        return morphine;

    };

    app.$('tick', function (date) {
        var date = date.getTime(),
            _morphines = [];

        for (var i = 0; i < morphines.length; i++) {
            if (!morphines[i].$m.done()) {
                morphines[i](date);
                _morphines.push(morphines[i]);
            }
        }
        morphines = _morphines;
    });
}]);