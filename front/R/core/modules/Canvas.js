/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Canvas(Ticker) {

    var element = null,
        context = null,
        size = [800, 600],
        resizeCb = [],
        switchCb = [],
        self = this,
        queue = [],
        ready = false;

    Ticker.queue(0, DrawScene);

    function DrawScene(date, frame) {
        if (ready) {
            var args = [context, date, frame];
            for(var i = 0 ; i < queue.length; i++) {
                try {
                    queue[i].f.apply(self, args);
                }
                catch (e) {
                    console.error(e);
                    throw new Error('Error emerged while drawing. \n' +
                        'Queue          : [' + queue[i].o + ']\n' +
                        'Queue Ordering : [' + i + ']\n' +
                        'Queue Member   : [' + queue[i].f.name + ']\n' +
                        'Message        : ' + e.message);
                }
            }
            for (var ordering in queue) {
                for (var i = 0; i < queue[ordering].length; i++) {

                }
            }
        }
    }

    function resolve(array) {
        for (var i = 0; i < array.length; i++) {
            array[i].call(self);
        }
    }

    this.element = function (id) {
        if (typeof id === "string") {
            var e = document.getElementById(id);
            if (e && e.getContext) {
                var ctx = e.getContext('2d');
                if (ctx) {
                    e.setAttribute('width', size[0]);
                    e.setAttribute('height', size[1]);
                    context = ctx;
                    element = e;
                    ready = true;
                    resolve(switchCb);
                }
                else throw new Error('Element with id [#' + id + '] is not a canvas. Can not get 2d context.')

            }
            else throw new Error('Element with id [#' + id + '] was not found or not a canvas');
        }
        else if (id instanceof HTMLElement) {
            if (id.getContext) {

                var ctx = id.getContext('2d');
                if (ctx) {
                    id.setAttribute('width', size[0]);
                    id.setAttribute('height', size[1]);
                    element = id;
                    context = ctx;
                    ready = true;
                    resolve(switchCb);
                }
                else throw new Error('Element is not a Canvas. Can not get 2d context.');
            }
            else throw new Error('Element is not a Canvas');
        }
        else {
            return element;
        }
    };

    this.queue = function (a, b) {
        if (typeof a === "function") {
            if (!a.name) throw new Error('Unable to enqueue callback. Provide a named function');
            queue.push({o: 0, f: b});
        }
        else if (typeof a === "number") {
            if (typeof b === "function") {
                if (!b.name) throw new Error('Unable to enqueue callback. Provide a named function.');
                queue.push({o: a, f: b});
            }
            else throw new Error('Unable to enqueue callback. Provide a named function');
        }
        else throw new Error('Unable to enqueue callback. Wrong arguments.');

        queue.sort(function (a,b) {
           return a.o > b.o;
        });

        return this;
    };

    this.size = function (width, height) {
        if (typeof width === "number" && typeof height === "number") {
            if (width < 0) width = 0;
            if (height < 0) height = 0;
            if (size[0] !== width || size[1] !== width) {
                size[0] = width;
                size[1] = height;
                element.setAttribute('width', width);
                element.setAttribute('height', height);
                resolve(resizeCb);
            }
        }
        return [size[0], size[1]];
    };

    this.resize = function (f) {
        if (typeof f === "function") {
            resizeCb.push(f);
            return this;
        }
        else throw new Error('Unable to set ressize callback. f argument is not a function');
    };

    this.switch = function (f) {
        if (typeof f === "function") {
            switchCb.push(f);
            return this;
        }
        else throw new Error('Unable to set switch callback. f argument is not a function');
    };

    this.ready = function () {
        return ready;
    };

});