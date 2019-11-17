/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
function Reflect() {
}

var modules = {},
    properties = {},
    core = new Reflect(),
    expect =
        [
            'Application', 'Audio', 'Canvas', 'Classes',
            'Config', 'Container', 'Fonts', 'Helpers',
            'Injection', 'Root', 'Services', 'Source',
            'Ticker'
        ];

function Core(f) {
    new Injection(f);
    var ready = true;
    for (var i = 0; i < expect.length; i++) {
        if (!modules[expect[i]]) {
            ready = false;
            break;
        }
    }
    if (ready) {
        BuildCore();
    }
    return Core;
}

function getRouteFunction(f) {
    return function routeFunction() {
        var result = f.apply(Reflect, arguments);
        if (result !== undefined) return Reflect;
        return result;
    }.bind(core);
}

Core.get = function (module, payload) {
    if (typeof module === "string") {
        if (modules[module]) {
            return modules[module].get.apply(modules[module], payload);
        } else throw new Error('Module [' + module + '] was not found');
    } else throw new Error('Module name is not a string. Wrong arguments');
};

Core.is = function (target, name) {
    if (typeof name === "string") {
        if (modules[name]) {
            return modules[name].is(target);
        }
    }
};

Core.inject = function (module, payload) {
    if (typeof module === "string") {
        if (modules[module]) {
            return modules[module].create(payload);
        } else throw new Error('Nodule [' + module + '] was not found.');
    } else throw new Error('Module name is not a string. Wrong Arguments');
};

Core.extend = function (module, target, payload) {
    if (typeof modules[module] === "string") {
        if (typeof target === "object") {
            return modules[module].extend(target, payload);
        } else throw new Error('Unable to extend target of tyoe [' + (typeof target) + '] bu module constructor [' + module + '].');
    }
};

Core.define = function (property, value) {
    if (!core) core = new Reflect();
    if (typeof property === "string") {
        if (properties[property] !== undefined) throw new Error('Unable to define property [' + property + ']. Already defined!');
        if (typeof property === "function") properties[property] = getRouteFunction(value);
        else if (property !== null || typeof property !== "undefined" || typeof property !== "object") properties[property] = value
        return core;
    }
};

function BuildCore() {
    Core.get('Root');
    for (var property in properties) {
        if (properties.hasOwnProperty(property)) {
            core[property] = properties[property];
        }
    }
}

function Injection(f) {
    if (typeof f !== "function" || !f.name) throw new Error('Unable to createinjection. Constructor is not a named function!');
    modules[f.name] = this;
    var cache = null;

    this.create = function (payload) {
        var args = [null];
        if (payload && typeof payload === "object" && payload.constructor === Array) {
            for (var i = 0; i < payload.length; i++) {
                args.push(payload[i]);
            }
        }
        return new (Function.prototype.bind.apply(f, args));
    };

    this.get = function () {
        if (cache) return cache;
        else {
            var result = this.create.apply(this, arguments[0]);
            cache = result;
            return result;
        }
    };

    this.is = function (target) {
        return target.constructor === f;
    };

    this.extend = function (target, payload) {
        if (typeof payload === "object" && payload.constructor === Array) {
            f.apply(target, payload);
            return target;
        } else {
            f.call(target);
            return target;
        }
    }
}

window.$R = core;