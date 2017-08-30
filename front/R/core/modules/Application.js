/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Application(Canvas, Ticker, Config) {

    var self = this;

    Config.define('fps', 58.8, {isNumber: true, greater: 0, under: 61}).watch(function (v) {
        Ticker.fps(v);
    });

    Config.define('canvas', null, {isString: true}).watch(function (v) {
        Canvas.element(v);
    });

    this.$ = function (n, f) {
        if (typeof n === "string") {
            if (n.charAt(0) === '$') throw new Error('Unable to set API function. Function name starts with $');
            if (this[n]) throw new Error('Application API property [' + n + '] duplication!');
            if (typeof f !== "function") throw new Error('Application API property [' + n + '] value is not a function');
            this[n] = function () {
                var result = f.apply(this, arguments);
                if (result !== undefined) {
                    return result;
                }
                else {
                    return self;
                }
            };
        }
        else throw new Error('Unable to set API method. Name is not a string.');
    };

    this.stop = function () {
        Ticker.stop();
        return this;
    };
    this.start = function () {
        Ticker.start();
        return this;
    };

    this.config = function (a, b) {
        if (typeof a === "string") {
            if (typeof b !== "undefined" && typeof b !== "function") {
                Config.set(a, b);
            }
            else if (typeof b === "function") {
                Config.watch(a, b);
            }
            else {
                return Config.get(a);
            }
        }
        else if (typeof a === "object" && a.constructor !== Array) {
            for (var property in a) {
                if (a.hasOwnProperty(property)) {
                    Config.set(property, a[property]);
                }
            }
        }
        else {
            throw new Error('Unable to config application. Config format is invalid');
        }
        return this;
    };
});