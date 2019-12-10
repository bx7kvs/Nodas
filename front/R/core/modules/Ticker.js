/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Ticker() {
    var frameDuration = (1000 / 58.8).toFixed(2),
        queue = [],
        frame = 0,
        args = [null, 0],
        draw = function () {
            for (var i = 0; i < queue.length; i++) {
                try {
                    queue[i].f.apply(self, args);
                }
                catch (e) {
                    throw new Error('Error emerged while resolving callbacks.\n' +
                        'Queue   : [' + queue[i].o + ']\n' +
                        'Order   : [' + i + ']\n' +
                        'Name    : [' + (queue[i].f.name) + '].\n' +
                        'Message : ' + e.message);
                }
            }
            frame++;
        },
        tick = function () {
            args[0] = new Date();
            args[1] = frame;
            try {
                draw();
            }
            catch (e) {
                clearInterval(interval);
                resolve('error', e);
                throw new Error('Unable to run ticker anymore. ' +
                    'Error emerged during sources ticker progress.\n ' +
                    'Frame :' + frame + '\n' +
                    'Date  : ' + args[0] + '\n' +
                    e.message
                );
            }

        },
        interval = null,
        eventCb = {
            stop: [],
            start: [],
            error: []
        },
        self = this;

    function resolve(event, args) {
        var _call_args = [];
        if (typeof args === "object" && args.constructor === Array) {
            _call_args = args;
        }
        else if (args !== undefined) {
            _call_args.push(args);
        }

        if (typeof event === "string" && event.length) {
            if (eventCb[event]) {
                for (var i = 0; i < eventCb[event].length; i++) {
                    eventCb[event][i].apply(self, _call_args);
                }
            }
            else {
                throw new Error('Unable to resolve event [' + event + ']. No such event.')
            }
        }
        else {
            throw new Error('Unable to resolve event. Event parameter is not a string or empty')
        }
    }

    this.on = function (event, func) {
        if (typeof event === "string" && event.length) {
            if (eventCb[event]) {
                if (typeof func === "function") {
                    eventCb[event].push(func)
                }
                else {
                    throw new Error('Unable to set event [' + event + ']. Callback is not a function.');
                }
            }
            else {
                throw new Error('Unable to set event [' + event + '] handler. No such event.')
            }
        }
        else {
            throw new Error('Unable to set event. Event argument is not a string or empty.')
        }
        return this;
    };

    this.stop = function () {
        if (interval) {
            frame = 0;
            clearInterval(interval);
            interval = null;
            resolve('stop', this);
        }
        return this;
    };

    this.start = function () {
        if (!interval) {
            interval = setInterval(tick, frameDuration);
            resolve('start', this);
        }
        return this;
    };

    this.fps = function (number) {
        if (typeof number === "number") {
            if (number > 60) number = 60;
            if (number <= 0) number = 1;
            frameDuration = (1000 / number).toFixed(2);
            if (interval) {
                this.stop();
                this.start();
            }
        }
        else {
            return (1000 / frameDuration).toFixed(2);
        }
        return this;
    };

    this.queue = function (a, b) {
        if (typeof a === "function") {
            if (!a.name) throw new Error('Unable to set callback. Callback is not a named function.');
            queue.push({o: 0, f: b});
        }
        else if (typeof a === "number") {
            if (typeof b === "function") {
                if (!b.name) throw new Error('Unable to set callback. Callback is not a named function.');
                queue.push({o: a, f: b});
            }
            else {
                throw new Error('Unable to queue. callback is not a function')
            }
        }
        else {
            throw new Error('Unable to create callback. Wrong arguments passed');
        }
        queue.sort(function (a,b) {
            return a.o > b.o;
        });
        return this;
    }
});