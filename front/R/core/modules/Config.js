/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Config() {

    var properties = {},
        funcs = {
            isNumber: function (v) {
                return typeof v === "number";
            },
            isString: function (v) {
                return typeof v === "string";
            },
            isArray: function (v) {
                return typeof v === "object" && v.constructor === Array;
            },
            custom: function (v, args) {
                if (typeof args[0] === "function") {
                    return args[0](v);
                }
            },
            under: function (v, args) {
                return funcs.isNumber(v) && v < args[0];
            },
            greater: function (v, args) {
                return funcs.isNumber(v) && v > args[0];
            },
            eq: function (v, args) {
                return funcs.isNumber(v) && v === args[0];
            },
            isBool: function (v) {
                return typeof  v === "boolean"
            }
        };

    function Property(name, value, cfg) {

        var checkArray = [],
            cb = [];

        function checkValue(v) {
            var result = true;
            for (var i = 0; i < checkArray; i++) {
                if (!funcs[checkArray[i].f](v, checkArray.args)) {
                    result = false;
                    break;
                }
            }
            return result;
        }

        this.get = function () {
            var arg = value;
            if (funcs.isArray(arg)) {
                arg = [];
                for (var i = 0; i < value.length; i++) {
                    arg.push(value[i]);
                }
            }
            return arg;
        };

        this.name = function () {
            return name;
        };

        this.set = function (n) {
            if (checkValue(n)) {
                if (funcs.isArray(n)) {
                    value = [];
                    for (var i = 0; i < n.length; i++) {
                        value.push(n[i]);
                    }
                }
                else {
                    value = n;
                }
            }
            for (var i = 0; i < cb.length; i++) {
                cb[i].call(this, this.get());
            }
            return this.get();
        };

        this.watch = function (f) {
            if (typeof f === "function") {
                cb.push(f);
            }
            else {
                throw new Error('Can not set config property watcher. Argument f is not a function.');
            }
            return value;
        };

        for (var prop in cfg) {
            if (cfg.hasOwnProperty(prop)) {
                if (cfg[prop] !== undefined) {
                    if (funcs[prop]) {
                        checkArray.push({f: prop, args: [cfg[prop]]});
                    }
                    else throw new Error('No such config value checker as [' + prop + ']');
                }
                else throw new Error('Wrong parameter for config property [' + prop + ']');
            }
        }

        if (typeof value === "object" && value !== null && !funcs.isArray(value)) throw new Error('Objects are not supported as config property value!');
        if (!checkValue(value)) throw new Error('Initial [' + name + ']\'s value does not meet config requirements.');
    }

    this.define = function (property, value, cfg) {
        if (typeof property === "string") {
            if (value !== undefined) {
                if (!properties[property]) {
                    try {
                        properties[property] = new Property(property, value, cfg);
                    }
                    catch (e) {
                        console.error('Unable to create config property [' + property + ']')
                        throw e;
                    }
                }
                else {
                    console.warn('Config property duplication on property name [' + property + ']');
                }
            }
            else throw new Error('Config property value can not be undefined.');
        }
        else throw new Error('Unable to define config property. Property name is not a string.');

        return properties[property];
    };

    this.set = function (name, value) {
        if (typeof name === "string" && properties[name]) {
            return properties[name].set(value);
        }
        else throw new Error('Unable to set property [' + name + ']. No such property.');
    };

    this.get = function (name) {
        if (typeof name === "string") {
            return properties[name].get();
        }
        else throw new Error('Unable to get property [' + name + ']. No such property.')

    };

    this.watch = function (name, f) {
        if (typeof name === "string") {
            if (typeof f === "function") {
                if (properties[name]) {
                    return properties[name].watch(f);
                }
                else throw new Error('No such property as [' + name + '] to watch.');
            }
            else throw new Error('Watcher callback is not a function');
        }
        else throw new Error('Unable to watch config property. Property name is invalid or undefined')
    }
});