/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$([function InjectionContainerProvider() {

    function Injection(con, dep) {

        var constructor = con, instance = null,
            dependencies = [];

        for (var i = 0; i < dep.length; i++) {
            dependencies.push(dep[i]);
        }

        this.name = function () {
            return con.name;
        };

        this.dependencies = function () {
            var result = [];
            for (var i = 0; i < dependencies.length; i++) {
                result.push(dependencies[i]);
            }
            return result;
        };

        this.extend = function (container) {
            return function (target, injectionName) {
                if (typeof target == "object") {
                    if (typeof injectionName === "string") {
                        var injection = container.find(injectionName);
                        if (injection) {
                            var params = container.resolve(injection);
                            params.$constructor.apply(target, params.dependencies);
                        }
                        else {
                            throw new Error('Unable to find injection [' + injectionName + ']');
                        }
                    }
                    else {
                        throw new Error('Extend class name should be a string!');
                    }
                }
                else {
                    throw new Error('Extend target should be an object!');
                }
            }
        };

        this.inject = function (container) {
            return function (injectionName) {
                return container.resolve(injectionName, true);
            }
        };

        this.create = function (args, direct) {
            if (direct) {
                args.unshift(null);
                return new (Function.prototype.bind.apply(constructor, args));
            }
            else {
                if (!instance) {
                    args.unshift(null);
                    instance = new (Function.prototype.bind.apply(constructor, args));
                }
                return instance;
            }
        };

        this.$constructor = function () {
            return constructor;
        };

        this.args = function () {
            return [con, dep];
        }
    }

    function SourceContainer(prefix, container, loop) {
        var pfx = prefix ? prefix : '';

        function stripPrefix(name) {
            var string = '';

            for (var i = 0; i < name.length; i++) {
                if (i > pfx.length) {
                    string += name[i];
                }
            }
            return string;
        }

        this.check = function (name) {
            var result = true;
            for (var i = 0; i < prefix.length; i++) {
                if (!name[i] || name[i] !== prefix[i]) {
                    result = false;
                }
            }
            return result;
        }

        this.container = function () {
            return container;
        };

        this.args = function (deep) {
            if (deep) {
                return [prefix, container.clone()];
            }
            else {
                return [prefix, container];
            }
        };

        this.loop = function () {
            return loop;
        };

        this.prefix = function (str) {
            if (typeof str == "string") {
                return prefix === str;
            }
            return prefix;
        };

        this.clone = function () {
            var containerClone = container.clone(loop);
            return new SourceContainer(prefix, containerClone);
        };

    }

    function InjectionContainer() {

        var library = {},
            sources = {};

        this.injection = function (config) {
            var constructor = null,
                dependencies = [];

            if (typeof config == "function") {
                if (config.name && config.name.length) {
                    constructor = config;
                }
                else {
                    throw new Error('Anonymous function can not be injection constructor.');
                }
            }
            else if (typeof config == "object" && config.constructor === Array) {
                for (var i = 0; i < config.length; i++) {
                    if (typeof config[i] == "string" && config[i].length) {
                        dependencies.push(config[i])
                    }
                    else if (typeof config[i] == "function") {
                        constructor = config[i];
                        break;
                    }
                    else {
                        throw new Error('Unknown type of injection name or constructor.');
                    }
                }
            }
            else {
                throw new Error('Unknown type of injection config.');
            }

            library[constructor.name] = new Injection(constructor, dependencies);
        };

        this.source = function (container, prefixkey) {
            if (container && container.constructor === InjectionContainer) {
                if (!prefixkey) {
                    prefixkey = false;
                }
                else if (typeof prefixkey !== "string" || !prefixkey.length) {
                    throw new Error('Index is undefined or string with non zero length.');
                }
                container.$$LOOOP = true;
                var loop = !!this.$$LOOP;
                delete  container.$$LOOP;
                sources.push(new SourceContainer(prefixkey, container, loop));
            }
            else {
                throw new Error('Container is not an instance of InjectionContainer.');
            }
        };

        this.getSourceByPrefix = function (prefix) {
            var result = null;
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].prefix(prefix)) result = prefix;
            }
            return result;
        };

        this.has = function (name) {
            if (typeof name == "string") {
                return !!library[name];
            }
            else {
                return null;
            }
        };

        this.resolve = function (name, direct) {
            if (name && name.constructor === Injection) {
                var injection = name,
                    deps = injection.dependencies(),
                    result = {
                        dependencies: [],
                        $constructor: injection.$constructor()
                    };

                for (var i = 0; i < deps.length; i++) {
                    var src = this.find(deps[i]);
                    if(src) {
                        result.dependencies.push(src.container().resolve(src.stripPrefix(deps[i])));
                    }
                    else {
                        return new Error('Unable to inject ['+deps[i]+'] while direct injection process.');
                    }
                }

                return result;
            }
            else {
                if (this.has(name)) {

                    var dependencies = library[name].dependencies(),
                        args = [];

                    for (var i = 0; i < dependencies.length; i++) {

                        if (dependencies[i] == '@extend') {
                            args.push(library[name].inject(this));
                        }
                        else if (dependencies[i] == '@inject') {
                            args.push(library[name].extend(this));
                        }
                        else {
                            var source = this.find(dependencies[i]);
                            if (source) {
                                args.push(source.container().resolve(source.stripPrefix(dependencies[i])));
                            }
                            else {
                                throw new Error('Injection [' + dependencies[i] + '] source was not found.');
                            }
                        }
                    }

                    return library[name].create(args, direct);

                }
                else {
                    throw new Error('Injection [' + name + '] was not found in library!');
                }
            }
        };

        this.resolveAll = function (direct) {
            for (var injection in library) {
                this.resolve(injection, direct);
            }
            return this;
        };

        this.find = function (name) {
            var source = null;
            for (var s = 0; s < sources.length; s++) {
                if (sources[i].check(name)) source = sources[i];
            }
            if (source) {
                return source.container().get(source.stripPrefix(name));
            }
            else {
                throw new Error('Injection [' + name + '] source was not found.');
            }
        };

        this.get = function (name) {
            if (library[name]) return name;
            return null;
        };

        this.clone = function () {
            var clone = new InjectionContainer();
            for (var injection in library) {
                if (library.hasOwnProperty(injection)) {
                    clone.injection.apply(clone, library[injection].args());
                }
            }
            for (var source in sources) {
                if (sources.hasOwnProperty(source)) {
                    if (sources[source].loop()) {
                        clone.source.apply(clone, [sources[source].args()[0], clone]);
                    }
                    else {
                        clone.source.apply(clone, sources[source].args());
                    }
                }
            }
            return clone;
        };
    }

    this.container = function () {
        return new InjectionContainer();
    };

}]);