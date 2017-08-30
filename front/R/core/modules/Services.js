/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Services() {

    var services = {},
        serviceClasses = {},
        plugins = {},
        pluginsClasses = {};

    function service(cfg) {
        if (typeof cfg === "object" && cfg.constructor === Array) {
            var serviceName = null;
            for (var i = 0; i < cfg.length; i++) {
                if (typeof cfg[i] === "function") {
                    serviceName = cfg[i].name;
                }
                else if (typeof cfg[i] !== "string") throw new Error('Unable to create service. Invalid config');

            }
            if (serviceName) {
                if (services[serviceName]) console.warn('Duplicate declaration. Service [' + serviceName + '] has been overwritten');
                services[serviceName] = Core.inject('Injection', [cfg]);
            }
        }
        else if (typeof cfg === "function") {
            if (cfg.name) {
                if (services[cfg.name]) console.warn('Duplicate declaration. Service [' + serviceName + '] has been overwritten');
                services[cfg.name] = Core.inject('Injection', [cfg]);
            }
            else throw new Error('Unable to create service. Constructor is not a named function.');
        }
    }

    function plugin(a, b) {
        if (typeof a === "string") {
            if (typeof b === "object" && b.constructor === Array) {
                var pluginName = null;
                for (var i = 0; i < b.length; i++) {
                    if (typeof b[i] === "function") {
                        pluginName = b[i].name;
                    }
                    else if (typeof b[i] !== "string") {
                        throw new Error('Unable to create plugin. Invalid constructor arguments');
                    }
                }
                if (pluginName) {
                    if (!plugins[a]) plugins[a] = {};
                    if (plugins[a][pluginName]) console.warn('Plugin duplicated. [' + pluginName + '] has been overwritten');
                    plugins[a][pluginName] = Core.inject('Injection', [b]);
                }
                else {
                    throw new Error('Unable to create plugin. Constructor is not a named function');
                }
            }
        }
        else {
            throw new Error('Unable to create plugin. Invalid arguments.');
        }
    }

    plugin.class = function (svc, a, b) {
        if (typeof svc === "string") {
            if (typeof a === "string") {
                if (typeof b === "object" && b.constructor === Array) {
                    var pluginClassName = null;
                    for (var i = 0; i < b.length; i++) {
                        if (typeof b[i] === "function") {
                            pluginClassName = b[i].name;
                        }
                        else if (typeof b[i] !== "string") {
                            throw new Error('Unable to create plugin class. Invalid constructor arguments');
                        }
                    }
                    if (pluginClassName) {
                        if (!pluginsClasses[svc]) pluginsClasses[svc] = {};
                        if (!pluginsClasses[svc][a]) pluginsClasses[svc][a] = {};
                        if (pluginsClasses[svc][a][pluginClassName]) console.warn('Plugin class duplicated. [' + pluginClassName + '] has been overwritten');

                        pluginsClasses[svc][a][pluginClassName] = Core.inject('Injection', [b]);
                    }
                    else {
                        throw new Error('Unable to create plugin. Constructor is not a named function');
                    }
                }
                else if (typeof b === "function") {
                    if (b.name) {
                        if (!pluginsClasses[svc]) pluginsClasses[svc] = {};
                        if (!pluginsClasses[svc][a]) pluginsClasses[svc][a] = {};
                        if (pluginsClasses[svc][a][b.name]) console.warn('Plugin class duplicated. [' + b.name + '] has been overwritten');

                        pluginsClasses[svc][a][b.name] = Core.inject('Injection', [b]);
                    }
                }
                else throw new Error('Unable to register plugin class. Invalid arguments');
            }
            else {
                throw new Error('Unable to create plugin. Invalid arguments.');
            }
        }

    };
    service.class = function (a, b) {
        var className = null;
        if (typeof a === "string") {
            if (typeof b === "function") {
                if (b.name) {
                    if (!serviceClasses[a]) serviceClasses[a] = {};
                    serviceClasses[a][b.name] = Core.inject('Injection', [b]);
                }
                else throw new Error('Unable to create class for extension [' + a + ']. Constructor is not a named function');
            }
            else if (typeof b === "object" && b.constructor === Array) {
                for (var i = 0; i < b.length; i++) {
                    if (typeof b[i] === "function") {
                        className = b[i].name;
                    }
                    else if (typeof b[i] !== "string") {
                        throw new Error('Unable to create class for service[' + a + ']. Invalid config.');
                    }
                }
                if (className) {
                    if (!serviceClasses[a]) serviceClasses[a] = {};
                    if (serviceClasses[a][className]) console.warn('Duplicate declaration. Class [' + className + '] for extension [' + a + '] has been overwritten');
                    serviceClasses[a][className] = Core.inject('Injection', [b]);
                }
            }
        }
        else {
            throw new Error('Unable to create class. Invalid arguments');
        }
    };

    Core.define('service', service);
    Core.define('plugin', plugin);

    function getPluginManager(lib) {
        function Plugins() {
            var library = [];
            for (var i = 0; i < lib.length; i++) {
                var list = lib[i].list();
                for (var prop in list) {
                    if (list[prop].$constructor() !== Plugins) {
                        library.push(prop);
                    }
                }
            }
            this.each = function (f) {
                for (var i = 0; i < library.length; i++) {
                    f(library[i]);
                }
                return this;
            };

            this.list = function () {
                var list = [];
                for (var i = 0; i < library.length; i++) {
                    list.push(library[i]);
                }
                return list;
            };
        }

        return Core.inject('Container', [Core.inject('Injection', [Plugins])]);
    }

    this.getApplicationServices = function (_helpers, _sysClasses, _engineDefaults) {

        var _services = {},
            _servicesClasses = {},
            _servicesPlugins = {},
            _servicesPluginsClasses = {},
            _service, _plugin;

        for (var service in services) {
            if (services.hasOwnProperty(service)) {
                _service = Core.inject('Container', [services[service]]);
                var _plugins = [];

                if (plugins[service]) {
                    for (var plugin in plugins[service]) {
                        if (plugins[service].hasOwnProperty(plugin)) {
                            _plugin = Core.inject('Container', [plugins[service][plugin]]);
                            if (!_servicesPlugins[service]) _servicesPlugins[service] = {};
                            _servicesPlugins[service][plugin] = _plugin;
                            if (pluginsClasses[service][plugin]) {
                                var _pluginClassesContainer = Core.inject('Container', [pluginsClasses[service][plugin]]);
                                if (!_servicesPluginsClasses[service]) _servicesPluginsClasses[service] = {};
                                _servicesPluginsClasses[service][plugin] = _pluginClassesContainer;
                                _plugin.source(_pluginClassesContainer, '$');
                                _pluginClassesContainer.source(_pluginClassesContainer, '$');
                                _pluginClassesContainer.source(_sysClasses, '.');
                                _pluginClassesContainer.source(_helpers, '+');
                            }
                            _plugin.source(_sysClasses, '.');
                            _plugin.source(_helpers, '+');
                            _plugins.push(_plugin);
                        }
                    }
                }

                _plugins.push(getPluginManager(_plugins));
                _service.source(_plugins, '<');
                _service.source(_sysClasses, '.');
                _service.source(_helpers, '+');
                _service.source(_engineDefaults, '@');
                if (serviceClasses[service]) {
                    var serviceClassesContainer = Core.inject('Container', [serviceClasses[service]]);
                    _service.source(serviceClassesContainer, '$');
                    serviceClassesContainer.source(serviceClassesContainer, '$');
                    serviceClassesContainer.source(_sysClasses, '.');
                    serviceClassesContainer.source(_plugins, '<');
                    serviceClassesContainer.source(_helpers, '+');
                    serviceClassesContainer.source(_engineDefaults, '@');
                    _servicesClasses[service] = serviceClassesContainer;
                }
                else {
                    _servicesClasses[service] = null;
                }
                _services[service] = _service;
            }
        }

        for (var s in _services) {
            if (_services.hasOwnProperty(s)) {
                var _servicesServiceSource = [];
                for (var s2 in _services) {
                    if (_services.hasOwnProperty(s2)) {
                        if (s !== s2) {
                            _servicesServiceSource.push(_services[s2]);
                        }
                    }
                }
                _services[s].source(_servicesServiceSource, false);

                if (_servicesClasses[s]) _servicesClasses[s].source(_servicesServiceSource, false);

                if (_servicesPlugins[s]) {
                    for (var p in _servicesPlugins[s]) {
                        if (_servicesPlugins[s].hasOwnProperty(p)) {
                            _servicesPlugins[s][p].source(_servicesServiceSource, false);
                        }
                    }
                }

                if (_servicesPluginsClasses[s]) {
                    for (var pcl in _servicesPluginsClasses[s]) {
                        if (_servicesPluginsClasses[s].hasOwnProperty(pcl)) {
                            _servicesPluginsClasses[s][pcl].source(_servicesServiceSource, false);
                        }
                    }
                }
            }
        }

        var result = [];

        for (var prop in _services) {
            if (_services.hasOwnProperty(prop)) {
                result.push(_services[prop]);
            }
        }
        _helpers.source(result, false);
        return result;
    }


});