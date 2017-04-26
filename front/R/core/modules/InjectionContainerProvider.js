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

        this.args = function () {
            return [con, dep];
        }
    }

    function SourceContainer(prefix, container) {
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
        };

        this.get = function (name) {
            if (this.check(name)) {
                var stripname = stripPrefix(name);

            }
        };

        this.container = function () {
            return container;
        };

        this.args = function (deep) {
            if(deep) {
                return [prefix,container.clone()];
            }
            else {
                return [prefix,container];
            }
        };

        this.clone = function () {
            var containerClone = container.clone();
            return new SourceContainer(prefix, containerClone);
        }

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
                sources.push(new SourceContainer(prefixkey, container));
            }
            else {
                throw new Error('Container is not an instance of InjectionContainer.');
            }
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
            if (this.has(name)) {

                var dependencies = library[name].dependencies(),
                    args = [];

                for (var i = 0; i < dependencies.length; i++) {
                    var source = null;
                    for (var s = 0; s < sources.length; s++) {
                        if (sources[i].check(name)) source = sources[i];
                    }
                    if (source) {
                        args.push(source.container().resolve(source.stripPrefix(dependencies[i])));
                    }
                    else {
                        throw new Error('Injection [' + dependencies[i] + '] is not valid.');
                    }
                }

                return library[name].create(args, direct);

            }
            else {
                throw new Error('Injection [' + name + '] was not found in library!');
            }
        };

        this.clone = function (deep) {
            var clone = new InjectionContainer();
            for(var injection in library) {
                if(library.hasOwnProperty(injection)) {
                    clone.injection.apply(clone,library[injection].args());
                }
            }
            for(var source in sources) {
                if(sources.hasOwnProperty(source)) {
                    clone.source.apply(clone,sources[source].args(deep));
                }
            }
            return clone;
        }
    }

    this.container = function () {
        return new InjectionContainer();
    };

}]);