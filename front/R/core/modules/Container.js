/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
$R.$(function Container() {
    
    function SourceContainer(prefix, container, loop) {
        var pfx = prefix ? prefix : false,
            containers = [];

        if (typeof container == "object") {
            if (container.constructor === InjectionContainer) {
                containers = [container]
            }
            else if (container.constructor == Array) {
                var valid = true;
                for (var i = 0; i < container.length; i++) {
                    if (container[i].constructor === InjectionContainer) {
                        containers.push(container[i]);
                    }
                    else {
                        valid = false;
                        break;
                    }
                }
                if (container.length == 0) valid = false;

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
            var result = true;
            if (prefix) {
                for (var i = 0; i < prefix.length; i++) {
                    if (!name[i] || name[i] !== prefix[i]) result = false;
                }
            }
            return result;
        };

        this.has = function (name) {
            var result = false;
            if (this.check(name)) {
                for (var i = 0; i < containers.length; i++) {
                    var stripName = stripPrefix(name);
                    if (containers[i].has(stripName)) {
                        result = true;
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
            if (this.has(name)) {
                var source = null;
                var stripName = stripPrefix(name);
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].has(stripName)) {
                        source = containers[i];
                    }
                }
                if (source) {
                    return source.resolve(stripName, 'extend')
                }
            }
        };

    }

    function InjectionContainer(lib) {
        var library = typeof lib == "object" ? lib : {},
            sources = {};

        this.list = function () {
            return library;
        };

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
                    else if (typeof config[i] == "function" && config[i].name) {
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

            dependencies.push(constructor);

            library[constructor.name] = new Injection(dependencies);
        };

        this.source = function (container, prefixkey) {
            if (container && typeof container == "object") {
                if (container.constructor === InjectionContainer) {
                    if (!prefixkey) prefixkey = false;
                    if ((typeof prefixkey == "string" && prefixkey.length) || prefixkey === false) {
                        container.$$LOOP = true;
                        var loop = false;
                        if (this.$LOOP) loop = true;
                        delete container.$$LOOOP;
                        sources[prefixkey ? prefixkey : '$$noprefix'] =
                            new SourceContainer(prefixkey, [container], [loop]);

                    }
                }
                else if (container.constructor === Array) {
                    var valid = true,
                        loop = [];

                    for (var i = 0; i < container.length; i++) {
                        if (typeof container[i] == "object" && container[i].constructor == InjectionContainer) {
                            container[i].$$LOOOP = true;
                            if (this.$$LOOOP) {
                                loop.push(true);
                            }
                            else {
                                loop.push(false);
                            }
                            delete  container[i].$$LOOOP;
                        }
                        else {
                            valid = false
                        }
                    }

                    if (valid) {
                        if (!prefixkey) prefixkey = false;

                        if ((typeof prefixkey == "string" && prefixkey.length) || prefixkey === false) {
                            sources[prefixkey ? prefixkey : '$$noprefix'] = new SourceContainer(prefixkey, container, loop);
                        }
                    }
                    else {
                        throw new Error('Source container config is not valid. One of the containers provided is not an InjectionContainer instance');
                    }
                }
            }
        };

        this.clone = function () {
            var newLibrary = {};
            for (var injection in library) {
                if (library.hasOwnProperty(injection)) {
                    newLibrary[injection] = library[injection].clone();
                }
            }
            var newContainer = new InjectionContainer(newLibrary);
            for (var source in sources) {
                var containers = sources[source].containers(),
                    sourceloop = sources[source].loop(),
                    sourceprefix = sources[source].prefix(),
                    newcontainers = [];

                for (var i = 0; i < containers.length; i++) {
                    if (sourceloop[i]) {
                        newcontainers.push(newContainer);
                    }
                    else {
                        newcontainers.push(containers[i].clone());
                    }
                }

                newContainer.source(newcontainers, sourceprefix);
            }
            return newContainer;
        };

        this.findSourceByPrefix = function (prefix) {
            if (prefix === false) return sources.$$noprefix;

            if (typeof prefix === "string") {
                return sources[prefix];
            }

            return null;
        };

        this.findSourceByInjectionName = function (injectionName) {
            var source = null;

            for (var prefix in sources) {
                if (sources.hasOwnProperty(prefix)) {
                    if (sources[prefix].prefix()) {
                        if (sources[prefix].has(injectionName)) {
                            source = sources[prefix];
                            break;
                        }
                    }
                }
            }
            if (!source && sources.$$noprefix && sources.$$noprefix.has(injectionName)) source = sources.$$noprefix;

            return source;
        };

        this.resolve = function (name, direct) {
            if (direct === 'extend') {

                if (library[name]) {
                    var result = {
                            dependencies: [],
                            $constructor: library[name].$constructor()
                        },
                        dependencies = library[name].dependencies();

                    for (var d = 0; d < dependencies.length; d++) {
                        if (dependencies[d] == '@extend') {
                            result.dependencies.push(library[name].extend(this));
                        }
                        else if (dependencies[d] == '@inject') {
                            result.dependencies.push(library[name].inject(this));
                        }
                        else {
                            var src = this.findSourceByInjectionName(dependencies[d]);
                            if (src) {
                                result.dependencies.push(src.resolve(dependencies[d]));
                            }
                            else {
                                throw new Error('Unable to inject [' + dependencies[d] + '] while direct injection process.');
                            }
                        }
                    }
                    return result;

                }
                else {
                    throw new Error('Unable to inject [' + name + '] no such injection found');
                }
            }
            else {
                if (this.has(name)) {

                    var dependencies = library[name].dependencies(),
                        args = [];

                    for (var i = 0; i < dependencies.length; i++) {

                        if (dependencies[i] == '@extend') {
                            args.push(library[name].extend(this));
                        }
                        else if (dependencies[i] == '@inject') {
                            args.push(library[name].inject(this));
                        }
                        else if (dependencies[i].charAt(0) === '.') {
                            args.push(library[name].$constructor);
                        }
                        else {
                            var source = this.findSourceByInjectionName(dependencies[i]);
                            if (source) {
                                args.push(source.resolve(dependencies[i]));
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

        this.resolveDirectInjection = function (name) {
            var source = this.findSourceByInjectionName(name);
            if (source) {
                return source.resolve(name, true);
            }
            else {
                return source;
            }
        };

        this.has = function (name) {
            return !!library[name];
        };

        this.get = function (name) {
            if (library[name]) return library[name];
            return null;
        };
    }

    this.container = function (lib) {
        return new InjectionContainer(lib);
    };

    this.injection = function (constuctor) {
        return new Injection(constuctor);
    };

});