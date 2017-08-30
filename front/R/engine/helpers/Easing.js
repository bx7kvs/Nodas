/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.helper.system(
    ['Debug',
        function Easing(Debug) {

            var easings = {
                '_': function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                linear: function (t, b, c, d) {
                    t /= d;
                    return b + c * (t);
                },
                linearSoft: function (t, b, c, d) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (4 * tc * ts + -10 * ts * ts + 8 * tc + -2 * ts + t);
                },
                linearSoftOut: function (t, b, c, d) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (-3 * tc * ts + 11 * ts * ts + -14 * tc + 6 * ts + t);
                },
                linearSoftIn: function (t, b, c, d) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (-1 * tc * ts + 2 * tc);
                },
                easeInQuad: function (t, b, c, d) {
                    var result = c * (t /= d) * t + b;
                    return c * (t /= d) * t + b;
                },
                easeOutQuad: function (t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                easeInOutQuad: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                },
                easeInCubic: function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                easeOutCubic: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                },
                easeInOutCubic: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                },
                easeInQuart: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                },
                easeOutQuart: function (t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                },
                easeInOutQuart: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                },
                easeInQuint: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                easeOutQuint: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                easeInOutQuint: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                },
                easeInSine: function (t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                },
                easeOutSine: function (t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                easeInOutSine: function (t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                },
                easeInExpo: function (t, b, c, d) {
                    return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                },
                easeOutExpo: function (t, b, c, d) {
                    return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                },
                easeInOutExpo: function (t, b, c, d) {
                    if (t === 0) return b;
                    if (t === d) return b + c;
                    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                },
                easeInCirc: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
                },
                easeOutCirc: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                },
                easeInOutCirc: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
                },
                easeInBack: function (t, b, c, d, s) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (15.26 * tc * ts + -43.56 * ts * ts + 39.8 * tc + -10.6 * ts + 0.1 * t);
                },
                easeOutBack: function (t, b, c, d, s) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (11.24 * tc * ts + -23.96 * ts * ts + 12.24 * tc + 1.44 * ts + 0.04 * t);
                },
                easeInOutBack: function (t, b, c, d, s) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (22.92 * tc * ts + -57.78 * ts * ts + 45 * tc + -9.28 * ts + 0.14 * t);
                },
                easeOutBounce: function (t, b, c, d) {
                    if ((t /= d) < (1 / 2.75)) {
                        return c * (7.5625 * t * t) + b;
                    } else if (t < (2 / 2.75)) {
                        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    } else if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                }
            };

            this.get = function (name) {
                if (easings[name]) return easings[name];
                Debug.error({name: name}, 'Easings / Unable to get undefined easing [{name}]. Linear easing function provided.');
                return easings['linear'];
            };
        }
    ]
);