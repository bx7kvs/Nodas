/**
 * Created by Viktor Khodosevich on 4/24/2017.
 */
(function () {
    function Reflect() {

        var config = {},
            injections = {},
            resolved = {},
            properties = {},
            reflect = this;

        function CoreInjection () {
            var dependencies = [],
                constructor = null;

            for(var i = 0 ; i < arguments.length; i++) {

                if(typeof arguments[i] == "string" && arguments[i].length) {
                    dependencies.push(arguments[i]);
                }
                if(typeof arguments[i] == "function") {
                    constructor = arguments[i];
                    break;
                }
            }

            if(!constructor || !constructor.name || constructor.name.length == 0)  {
                throw new Error('Unable to create core injection. Constructor is undefined!');
                return;
            }
            else {
                injections[constructor.name] = this;
                config[constructor.name] = true;

                this.name = function () {
                    return constructor.name;
                };

                this.dependencies = function () {
                    return dependencies;
                };

                this.instance = null;

                this.build = function () {
                    this.instance = new (Function.prototype.bind.apply(constructor, arguments));
                    resolved[this.name()] = this;
                    return this;
                }
            }
        }

        function createDefineFunction(targetname) {
            return function define(property, value) {
                if (properties[property] === undefined) {
                    properties[property] = {
                        value : value,
                        targetname : targetname,
                        wrap : function () {
                            if(reflect[value] === undefined) {
                                if(typeof value == "function") {
                                    if(resolved[targetname]) {
                                        reflect[property] = value.bind(resolved[targetname].instance);
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

            for(var i = 0; i < dependencies.length;i++) {
                var argname = dependencies[i];
                if(argname === '@define') {
                    args.push(createDefineFunction(injection.name()));
                }
                else if(typeof argname == "string") {
                    if(resolved[argname]) {
                        args.push(resolved[argname].instance);
                    }
                    else if(injections[argname]) {
                        args.push(resolve(injections[argname]));
                    }
                    else {
                        args.push(undefined);
                        throw new Error('Unable to resolve injection ['+argname+']. Mo such core module found!');
                    }
                }
                else {
                    args.push(undefined);
                    throw new Error('Unable to resolve injection ['+argname+']. Unknown type of injection request.');
                }
            }

            return injection.build.apply(injection,args);
        }

        function buildCore() {
            for(var module in config) {
                if(!resolved[resolved[module]]) {
                    resolve(injections[module]);
                }
            }
        }

        function check() {
            var ready = true;
            for(var module in config) {
                if(config.hasOwnProperty(module)) {
                    if(!config[module]) {
                        ready = false;
                        break;
                    }
                }
            }
            if(ready) {
                buildCore();
            }
        }

        this.$ = function () {
            new (Function.prototype.bind.apply(CoreInjection, arguments));
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
    }

    window.$R = new Reflect();
})();