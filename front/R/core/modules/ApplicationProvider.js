/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'ExtensionsProvider',
        'InjectionContainerProvider', 'ApplicationCanvasProvider',
        'ApplicationHTMLRootProvider', 'ApplicationTickerProvider', 'ApplicationConfigProvider',
        'ApplicationAudioContextProvider',

        function ApplicationProvider(define, Injector, Provider, CanvasProvider, HTMLRootProvider, TickerProvider, AppConfigProvider, AudioProvider) {
            var apps = {},
                modules = {},
                autorun = [],
                instances = {},
                reflectApps = {};

            function getAppSources(appname) {
                var container = Provider.container({'app': Provider.injection(getRApp(appname))});

                container.injection(CanvasProvider.canvasInjectionConstructor(appname));
                container.injection(
                    HTMLRootProvider.HTMLRootConstructor(
                        CanvasProvider.getApplicationCanvas(appname),
                        appname
                    )
                );

                container.injection(AudioProvider.getApplicationAudioContext(appname));

                container.source(container, false);

                return container;
            }


            function getRApp(appname) {
                return function ReflectApplication() {
                    var self = this,
                        ticker = TickerProvider.createTicker(appname, CanvasProvider.getApplicationCanvas(appname), self),
                        fps = 58.8,
                        methods = {
                            start: {
                                target: ticker,
                                func: 'start'
                            },
                            stop: {
                                target: ticker,
                                func: 'stop'
                            },
                            fps: {
                                target: ticker,
                                func: 'fps'
                            },
                            tick: {
                                target: ticker,
                                func: 'callback'
                            }
                        };

                    this.$ = function (func, args) {
                        if (typeof func == "string" && func.length) {
                            if (methods[func]) {
                                if (args === undefined) {
                                    args = []
                                }
                                else if (typeof args !== "object" || args.constructor !== Array) {
                                    args = [args];
                                }
                                return methods[func].target[methods[func].func].apply(methods[func].target, args);
                            }
                        }
                    };

                    var cb = {
                        stop: [],
                        start: [],
                        error: []
                    };

                    function resolve(event, args) {
                        if (typeof event == "string" && event.length) {
                            if (cb[event]) {
                                var passArgs = [];
                                if (typeof args == "object" && args.constructor == Array) {
                                    passArgs = args;
                                }
                                else if (args !== undefined) {
                                    passArgs = [args];
                                }

                                for (var i = 0; i < cb[event].length; i++) {
                                    cb[event][i].apply(self, passArgs);
                                }
                            }
                            else {
                                throw new Error('Unable to resolve event [' + event + ']. No such event.')
                            }
                        }
                        else {
                            throw new Error('Unable to resolve event. Event argument is not a string.');
                        }
                    }

                    ticker.on('stop', function () {
                        resolve('stop', self);
                    });

                    ticker.on('start', function () {
                        resolve('start', self);
                    });

                    ticker.on('error', function () {
                        resolve('error', self);
                    });

                    this.$on = function (event, func) {
                        if (typeof event == "string" && event.length) {
                            if (cb[event]) {
                                if (typeof func == "function") {
                                    cb[event].push(func);
                                }
                                else {
                                    throw new Error('Unable to set event [' + event + ']. Callback func is not a function.');
                                }
                            }
                            else {
                                throw new Error('Unable to set event [' + event + ']. No such event.');
                            }
                        }
                        else {
                            throw new Error('Unable to set handler. Event string is undefined or empty.');
                        }
                    };
                    this.$define = function (property, value) {
                        if(this[property] === undefined) {
                            if(property.charAt(0) !== '$') {
                                this[property] = value;
                            }
                        }
                    };

                    reflectApps[appname] = this;
                }
            }


            define('app', function (config) {
                if (typeof config == "function" && config.name) {
                    apps[config.name] = Provider.container();
                    apps[config.name].injection(config);
                }
                else if (typeof config == "object" && config.constructor === Array) {
                    var constructor = null,
                        dependancies = [];

                    for (var i = 0; i < config.length; i++) {
                        if (typeof config[i] == "string" && config[i].length > 0) {
                            dependancies.push(config[i]);
                        }
                        else if (typeof config[i] == "function" && config[i].name) {
                            constructor = config[i];
                        }
                    }
                    if (constructor) {
                        dependancies.push(constructor);
                        apps[constructor.name] = Provider.container();
                        apps[constructor.name].injection(dependancies);
                    }
                    else {
                        throw new Error('Unable to create application. Constructor not found!');
                    }
                }
                else {
                    throw new Error('Invalid application injection config');
                }
            });

            define('mod', function (app, constructor) {
                if (typeof app == "string" && app.length) {
                    if (!modules[app]) {
                        modules[app] = Provider.container();
                        modules[app].source(modules[app], '$');
                    }

                    if (typeof constructor === "function") {
                        modules[app].injection(constructor);
                    }
                    else if (typeof constructor === "object" && constructor.constructor == Array) {
                        var cfunc = null,
                            dependencies = [];

                        for (var i = 0; i < constructor.length; i++) {
                            if (typeof constructor[i] === "string" && constructor[i].length) {
                                dependencies.push(constructor[i]);
                            }
                            else if (typeof constructor[i] === "function" && constructor[i].name) {
                                cfunc = constructor[i];
                                break;
                            }
                            else {
                                throw new Error('Unknown type of module constructor parameter');
                            }
                        }

                        if (cfunc) {
                            dependencies.push(cfunc);
                            modules[app].injection(dependencies);
                        }
                        else {
                            throw new Error('Unable to create module. No constructor found!');
                        }
                    }
                }
            });


            define('run', function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] == "string" && arguments[i].length) {
                        var present = false;
                        for (var a = 0; a < autorun.length; a++) {
                            if (autorun[a] == arguments[i]) {
                                present = true;
                                break;
                            }
                        }
                        if (!present) {
                            autorun.push(arguments[i]);
                        }
                    }
                }
            });

            define('application', function (appname) {
                if (typeof appname == "string" && appname.length) {
                    if (reflectApps[appname]) {
                        return reflectApps[appname];
                    }
                    else if (apps[appname]) {

                        var extensions = Injector.extensions(),
                            sources = getAppSources(appname),
                            extsArray = [];

                        for (var extension in extensions) {
                            if (extensions.hasOwnProperty(extension)) {
                                extsArray.push(extensions[extension]);
                                var cfgConstructor = AppConfigProvider.getExtensionConfig(appname, extension);
                                var cfgSource = Provider.container();
                                cfgSource.injection(cfgConstructor);

                                var extsSource = [];
                                for (var _ext in extensions) {
                                    if (extensions.hasOwnProperty(_ext)) {
                                        if (_ext !== extension) {
                                            extsSource.push(extensions[_ext]);
                                        }
                                    }
                                }


                                extensions[extension].source(extsSource, false);
                                extensions[extension].source(sources, '@');
                                extensions[extension].source(cfgSource, '$$');

                                var extensionparts = extensions[extension].findSourceByPrefix('$');
                                if (extensionparts) {
                                    extensionparts.source(extsSource, false);
                                    extensionparts.source(extensionparts.containers(), '$');
                                    extensionparts.source(sources, '@');
                                    extensionparts.source(cfgSource, '$$');
                                }
                            }
                        }

                        for (var extension in extensions) {
                            if (extensions.hasOwnProperty(extension)) {
                                extensions[extension].resolve(extension);
                            }
                        }


                        if (modules[appname]) {
                            apps[appname].source(modules[appname], '$');
                            modules[appname].source(sources, '@');
                            modules[appname].source(extsArray, false);
                        }
                        apps[appname].source(sources, '@');
                        apps[appname].source(extsArray, false);
                        apps[appname].resolve(appname);

                        return reflectApps[appname];
                    }
                    else {
                        throw new Error('Unable to run app [' + appname + ']. No such app registered.');
                    }
                }
                else {
                    throw new Error('Unable to run app. App name (id) is not a string or empty.');
                }
            });

            $R.on('build', function () {
                var runapps = [];
                if (autorun.length) {
                    runapps = autorun;
                }
                else {
                    for (var app in apps) {
                        runapps.push(app);
                    }
                }
                for (var i = 0; i < runapps.length; i++) {
                    $R.application(runapps[i]);
                }
            });
        }
    ]
);