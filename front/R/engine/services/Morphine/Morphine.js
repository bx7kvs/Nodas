/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@inject', '+Easing', '@Canvas', 'Debug',
        function Morphine(inject, Easings, Canvas, Debug) {

            var morphines = [];

            function check(start, end, func, easing, duration, rpt) {
                if (typeof start !== "number" || typeof end !== "number") {
                    Debug.error({}, 'Morphine / Unable to create. Start value is invalid');
                    return false;
                }

                if (typeof func !== "function") {
                    Debug.error({}, 'Morphine / Unable to create. End value is invalid');
                    return false;
                }

                if (typeof easing !== "string") {
                    Debug.error({}, 'Morphine / Unable to create. Easing is not a string');
                    return false;
                }

                if (typeof  duration !== "number" || duration <= 0) {
                    Debug.error({}, 'Morphine / Unable to create. Duration is less than 0 or not a number');
                    return false;
                }

                var efunc = Easings.get(easing);

                if (!efunc) {
                    Debug.error({easing: easing}, ' Morphine / Unable to create. No such easing {easing}');
                    return false;
                }
                return efunc;
            }

            this.instance = function (start, end, func, easing, duration, rpt) {

                easing = check.apply(this, arguments);

                var morphine = inject('$Morphine'),
                    tickF = morphine.config(start, end, func, duration, easing, rpt);

                tickF.morphine = morphine;

                if (!tickF || typeof tickF !== "function") {
                    Debug.error({}, 'Unable to config morphine due to some config error.');
                    return null;
                }
                return tickF;
            };

            this.create = function (start, end, func, easing, duration, rpt) {

                easing = check.apply(this, arguments);

                var morphine = inject('$Morphine');

                var tickF = morphine.config(start, end, func, duration, easing, rpt);

                if (!tickF || typeof tickF !== "function") {
                    Debug.error({}, 'Morphine / Unable to config morphine. Due to some error.');
                    return;
                }

                tickF.$m = morphine;

                morphines.push(tickF);

                return morphine;

            };

            Canvas.queue(-2, function processMorphines(context, date) {
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
        }
    ]
);