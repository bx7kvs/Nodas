/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Container(lib, direct) {
    var library = {},
        sources = {},
        cache = {};

    this.list = function () {
        return library;
    };

    this.injection = function (config) {
        var constructor = null,
            dependencies = [];

        if (typeof config === "function") {
            if (config.name && config.name.length) {
                constructor = config;
            }
            else {
                throw new Error('Anonymous function can not be injection constructor.');
            }
        }
        else if (typeof config === "object" && config.constructor === Array) {
            for (var i = 0; i < config.length; i++) {
                if (typeof config[i] === "string" && config[i].length) {
                    dependencies.push(config[i])
                }
                else if (typeof config[i] === "function" && config[i].name) {
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

        if (library[constructor.name]) {
            console.warn('Injection [' + constructor.name + '] duplicated and has been overwritten');
        }
        library[constructor.name] = Core.inject('Injection', [dependencies]);
    };

    this.merge = function (cfg, clone) {
        if (cfg) {
            try {
                for (var property in cfg) {
                    if (cfg.hasOwnProperty(property)) {
                        if (Core.is(cfg[property], 'Injection')) {
                            if (library[cfg[property].name()]) console.warn('Injection [' + property + '] has been merged.s');
                            if (clone) {
                                library[lib[property].name()] = lib[property].clone();
                            }
                            else {
                                library[lib[property].name()] = lib[property];
                            }
                        }
                    }
                }
            }
            catch (e) {
                throw new Error('Unable to merge libs.');
            }
        }
    };

    this.source = function (container, prefixkey) {
        if (container && typeof container === "object") {
            if (Core.is(container, 'Container')) {
                if (!prefixkey) prefixkey = false;
                if ((typeof prefixkey === "string" && prefixkey.length) || prefixkey === false) {
                    container.$$LOOP = true;
                    var loop = false;
                    if (this.$LOOP) loop = true;
                    delete container.$$LOOOP;
                    sources[prefixkey ? prefixkey : '$$noprefix'] = Core.inject('Source', [prefixkey, container, loop]);

                }
            }
            else if (container.constructor === Array) {
                var valid = true,
                    loop = [];

                for (var i = 0; i < container.length; i++) {
                    if (typeof container[i] === "object" && Core.is(container[i], 'Container')) {
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

                    if ((typeof prefixkey === "string" && prefixkey.length) || prefixkey === false) {
                        sources[prefixkey ? prefixkey : '$$noprefix'] = Core.inject('Source', [prefixkey, container, loop]);
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
        var newContainer = Core.inject('Container', [newLibrary]);

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
        if(cache[injectionName]) {
            return cache[injectionName];
        }
        else {
            for (var prefix in sources) {
                if (sources.hasOwnProperty(prefix)) {
                    if (sources[prefix].prefix()) {
                        if (sources[prefix].has(injectionName)) {
                            source = sources[prefix];
                            cache[injectionName] = source;
                            break;
                        }
                    }
                }
            }
        }
        if (!source && sources.$$noprefix && sources.$$noprefix.has(injectionName)) {
            source = sources.$$noprefix;
            cache[injectionName] = source;
        }
        if(!source) {
            throw new Error('Unable to find source containing injection [' + injectionName+']. ')
        }
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
                    if (dependencies[d] === '@extend') {
                        result.dependencies.push(library[name].extend(this));
                    }
                    else if (dependencies[d] === '@inject') {
                        result.dependencies.push(library[name].inject(this));
                    }
                    else {
                        var src = this.findSourceByInjectionName(dependencies[d]);
                        if (src) {
                            result.dependencies.push(src.resolve(dependencies[d]));
                        }
                        else {
                            throw new Error('No source found containing [' + dependencies[d] + '] for ['+name+'].');
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

                    if (dependencies[i] === '@extend') {
                        args.push(library[name].extend(this));
                    }
                    else if (dependencies[i] === '@inject') {
                        args.push(library[name].inject(this));
                    }
                    else {
                        var source = this.findSourceByInjectionName(dependencies[i]);
                        if (source) {
                            args.push(source.resolve(dependencies[i]));
                        }
                        else {
                            throw new Error('Injection [' + dependencies[i] + '] for [' + name + '] source was not found.');
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


    if (Core.is(lib, 'Injection')) {
        library[lib.name()] = lib.clone();
    }
    else if (typeof lib === "object") {
        for (var property in lib) {
            if (lib.hasOwnProperty(property)) {
                if (Core.is(lib[property], 'Injection')) {
                    if (direct) {
                        library[lib[property].name()] = lib[property];
                    }
                    else {
                        library[lib[property].name()] = lib[property].clone();
                    }

                }
            }
        }
    }
    else if (lib !== undefined) {
        throw new Error('Unable to create container. Wrong arguments. Lib is Injection or object')
    }
});