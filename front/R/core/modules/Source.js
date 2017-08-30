/**
 * Created by Viktor Khodosevich on 15/08/2017.
 */
Core(function Source(prefix, container, loop) {

    var pfx = prefix ? prefix : false,
        containers = [],
        cache = {},
        checkCache = {};

    if (typeof container === "object") {
        if (Core.is(container, 'Container')) {
            containers = [container]
        }
        else if (container.constructor === Array) {
            var valid = true;
            for (var i = 0; i < container.length; i++) {
                if (Core.is(container[i], 'Container')) {
                    containers.push(container[i]);
                }
                else {
                    valid = false;
                    break;
                }
            }
            if (container.length === 0) valid = false;

            if (!valid) throw new Error('Container array is empty!');
        }
        else {
            throw new Error('Invalid type if container!');
        }
    }


    function stripPrefix(name) {
        if (prefix) {
            var string = '';
            for (var i = 0; i < name.length; i++) {
                if (i >= pfx.length) {
                    string += name[i];
                }
            }
            return string;
        }
        return name;
    }

    this.check = function (name) {
        if(checkCache[name]) return checkCache[name];
        var result = true;
        if (prefix) {
            for (var i = 0; i < prefix.length; i++) {
                if (!name[i] || name[i] !== prefix[i]) result = false;
            }
        }
        checkCache[name] = result;
        return result;
    };

    this.has = function (name) {
        var result = false;
        if(cache[name]) return true;
        if (this.check(name)) {
            for (var i = 0; i < containers.length; i++) {
                var stripName = stripPrefix(name);
                if (containers[i].has(stripName)) {
                    result = true;
                    cache[name] = containers[i];
                    break;
                }
            }
        }
        return result;
    };

    this.loop = function () {
        return loop;
    };

    this.containers = function () {
        return containers;
    };

    this.source = function () {
        for (var i = 0; i < containers.length; i++) {
            containers[i].source.apply(containers[i], arguments);
        }
    };

    this.prefix = function (str) {
        if (str !== undefined) {
            return str === pfx;
        }
        return pfx;
    };

    this.resolve = function (name, direct) {
        var result = null;
        if (this.has(name)) {
            var source = null;
            var stripName = stripPrefix(name);
            if(cache[name]) source = cache[name];
            for (var i = 0; i < containers.length; i++) {
                if (containers[i].has(stripName)) {
                    source = containers[i];
                }
            }
            if (source) result = source.resolve(stripName, direct);
        }
        return result;
    };

    this.resolveInjectionDependancies = function (name) {
        var source = null, stripName = null;
        if(cache[name]) {
            stripName = stripPrefix(name);
            return cache[name].resolve(stripName, 'extend');
        }
        else {
            if (this.has(name)) {
                stripName = stripPrefix(name);
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].has(stripName)) {
                        source = containers[i];
                        cache[name] = containers[i];
                    }
                }

                if (source) return source.resolve(stripName, 'extend');
            }
        }
    };

});