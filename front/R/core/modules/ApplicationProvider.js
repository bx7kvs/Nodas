/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'Injector', 'InjectionContainerProvider', 'CanvasProvider', 'HTMLRootProvider', 'ApplicationTickerProvider',
        function ApplicationProvider(define, Injector, Provider, CanvasProvider, HTMLRootProvider, TickerProvider) {

            /*
             TODO: App function should create injection and return constructor/dependencies defining function
             */
            var apps = {},
                modules = {},
                autorun = [],
                instances = {};

            apps.source(apps, '.');

            function getAppSources() {
                var container = Injector.container();

                container.injection(CanvasProvider.canvasInjectionConstructor());
                container.injection(HTMLRootProvider.HTMLRootContructor());

                container.source(container,false);

                return container;
            }

            function getAppConstructor(constructor) {
                return function Application(args) {
                    var ticker = TickerProvider.createTicker(constructor.name),
                        fps = 58.8,
                        methods = {
                            start : {
                                target : ticker,
                                func : 'start'
                            },
                            stop : {
                                target : ticker,
                                func : 'stop'
                            },
                            fps : {
                                target : ticker,
                                func : 'fps'
                            },
                            tick : {
                                target :ticker,
                                func : 'callback'
                            }
                        };

                    this.$ = function (func,args) {
                        if(typeof func == "string" && func.length) {
                            if(methods[func]) {
                                if(typeof args === undefined) {
                                    args = []
                                }
                                else if (typeof args !== "object" || args.constructor !== Array) {
                                    args = [args];
                                }
                                return methods[func].target[methods[func].func].apply(methods[func].target,args);
                            }
                        }
                    };

                    constructor.apply(this,args);
                }
            }


            define('app', function (config) {
                if (typeof config == "function" && config.name) {
                    apps[config.name] = Provider.container();
                    apps[config.name].injection(getAppConstructor(config));
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
                        dependancies.push(getAppConstructor(constructor));
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

            define('autorun', function () {
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

            define('get', function (appname) {
                if(typeof appname == "string" && appname.length) {
                    if(instances[appname]) {
                        return instances[appname];
                    }
                    else if (apps[appname]) {
                        var extensions = Injector.extensions(),
                            sources = getAppSources();

                        if(modules[appname]) {
                            apps[appname].source(modules[appname], '$');
                            modules[appname].source(appSources, '@');
                            modules[appname].source(extensions, false);
                        }

                        apps[appname].source(sources, '@');
                        apps[appname].source(extensions, false);
                        instances[appname] = apps[appname].resolve('Application');
                        return instances[appname];
                    }
                    else {
                        throw new Error('Unable to run app ['+appname+']. No such app registered');
                    }
                }
                else {
                    throw new Error('Inable to run app. App name (id) is not a string or empty.');
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

                for (var i = 0; i < runapps; i++) {
                   $R.get(runapps[i]);
                }
            });
        }
    ]
);