/**
 * Created by Viktor Khodosevich on 4/24/2017.
 */
(function () {


    function Reflect() {

        var config = {},
            injections = {},
            resolved = {},
            properties = {},
            reflect = this,
            buildCB = [];

        function CoreInjection() {

            var dependencies = [],
                constructor = null;

            this.name = function () {
                return constructor.name;
            };

            this.dependencies = function () {
                return dependencies;
            };

            this.instance = null;

            this.build = function () {
                var args = [];

                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                args.unshift(null);
                this.instance = new (Function.prototype.bind.apply(constructor, args));
                resolved[this.name()] = this;
                return this;
            };


            for (var i = 0; i < arguments.length; i++) {

                if (typeof arguments[i] == "string" && arguments[i].length) {
                    dependencies.push(arguments[i]);
                }
                if (typeof arguments[i] == "function") {
                    constructor = arguments[i];
                    break;
                }
            }

            if (!constructor || !constructor.name || constructor.name.length == 0) {
                throw new Error('Unable to create core injection. Constructor is undefined!');
            }

            injections[constructor.name] = this;
            config[constructor.name] = true;
        }

        function createDefineFunction(targetname) {
            return function define(property, value) {
                if (properties[property] === undefined) {
                    properties[property] = {
                        value: value,
                        targetname: targetname,
                        wrap: function () {
                            if (reflect[value] === undefined) {
                                if (typeof value == "function") {
                                    if (resolved[targetname]) {
                                        reflect[property] = function () {
                                            var result = value.apply(resolved[targetname].instance, arguments);
                                            if (result !== undefined) {
                                                return result;
                                            }
                                            else {
                                                return reflect;
                                            }
                                        }
                                    }
                                }
                                else {
                                    reflect[property] = value;
                                }
                            }
                        }
                    };
                }
            }
        }

        function resolve(injection) {
            var dependencies = injection.dependencies(),
                args = [];

            for (var i = 0; i < dependencies.length; i++) {
                var argname = dependencies[i];
                if (argname === '@define') {
                    args.push(createDefineFunction(injection.name()));
                }
                else if (typeof argname == "string") {
                    if (resolved[argname]) {
                        args.push(resolved[argname].instance);
                    }
                    else if (injections[argname]) {
                        args.push(resolve(injections[argname]).instance);
                    }
                    else {
                        args.push(undefined);
                        throw new Error('Unable to resolve injection [' + argname + ']. Mo such core module found!');
                    }
                }
                else {
                    args.push(undefined);
                    throw new Error('Unable to resolve injection [' + argname + ']. Unknown type of injection request.');
                }
            }

            return injection.build.apply(injection, args);
        }
        function buildCore() {
            for (var module in config) {
                if (!resolved[module]) {
                    resolved[module] = resolve(injections[module]);
                }
            }
            for (var prop in properties) {
                if (properties.hasOwnProperty(prop)) {
                    properties[prop].wrap();
                }
            }
        }

        function check() {
            var ready = true;
            for (var module in config) {
                if (config.hasOwnProperty(module)) {
                    if (!config[module]) {
                        ready = false;
                        break;
                    }
                }
            }
            if (ready) {
                buildCore();
            }
        }
        this.$ = function () {
            var args = [];
            if (typeof arguments[0] == "object" && arguments[0].constructor == Array) {
                for (var i = 0; i < arguments[0].length; i++) {
                    args.push(arguments[0][i]);
                }
            }
            else if (typeof arguments[0] == "function" && arguments[0].name) {
                args.push(arguments[0]);
            }
            args.unshift(null);
            new (Function.prototype.bind.apply(CoreInjection, args));
            check();
            return this;
        };
        this.modules = function () {
            for (var i = 0; i < arguments.length; i++) {
                if (!config[arguments[i]]) {
                    config[arguments[i]] = false;
                }
            }
            check();
        };

        document.addEventListener('DOMContentLoaded', function () {
            for (var i = 0; i < buildCB.length; i++) {
                buildCB[i].call(this);
            }
        });

        this.on = function (event, func) {
            if (event && typeof event == "string") {
                if (typeof func == "function") {
                    if (event == 'build') {
                        buildCB.push(func);
                    }
                    else {
                        throw new Error('Unable to add event listener. Unknown event');
                    }
                }
                else {
                    throw new Error('Unable to add event listener. func is not a function')
                }
            }
            else {
                throw new Error('Unable to add event listener. unknown event name type.');
            }

        }
    }

    window.$R = new Reflect();
})();