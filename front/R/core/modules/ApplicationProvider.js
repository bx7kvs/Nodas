/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'Injector', 'InjectionContainerProvider', 'CanvasProvider', 'HTMLRootProvider',
    function ApplicationProvider(define, Injector, Provider, CanvasProvider, HTMLRootProvider) {
        var extensions = Injector.extensions(),
            apps = Provider.container(),
            modules = {};

        apps.source(apps, '.');

        function getAppConstructor(constructor) {
            return function Application(arguments) {
                var appExts = extensions.clone(),
                    appsources = Provider.container(),
                    appmodules = Provider.container();

                appsources.injection(CanvasProvider.canvasInjectionConstructor());
                appsources.injection(HTMLRootProvider.HTMLRootContructor());
                appExts.source(appsources, '$$');
                appmodules.source(appmodules, '$$');

                var ready = false,
                    resolved = false,
                    running = false,
                    config = {};

                this.module = function () {
                    appmodules.injection.apply(appmodules, arguments);
                };

                this.config = function (cfg) {
                    if (typeof cfg == "object" && cfg.constructor !== Array) {
                        if (cfg.target && typeof cfg.target == "string" && cfg.target.length) {
                            config.target = cfg.target;
                            if (cfg.size && typeof cfg.size == "object"
                                && cfg.size.constructor == Array && cfg.size.length == 2
                                && (typeof cfg[0] == "number" || typeof cfg[0] == "string") &&
                                (typeof cfg[1] == "number" || typeof cfg[1] == "string")
                            ) {
                                config.size = [cfg.size[0], cfg.size[1]];
                            }
                            else {
                                config.size = ['100%', '100$']
                            }
                            if (cfg.fps && typeof cfg.fps == "number" && cfg.fps > 0) {
                                var fps = cfg.fps;
                                if (fps > 60) fps = 60;
                                if (fps <= 0) fps = 1;
                                config.fps = fps;
                            }
                            else {
                                config.fps = 58.2
                            }
                            ready = true;
                        }
                        else {
                            throw new Error('No target html element!');
                        }
                    }
                };

            }
        }


        define('app', function (config) {
            if (typeof config == "function" && config.name) {
                apps.injection(getAppConstructor(config), []);
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
                    apps.injection(dependancies);
                }
                else {
                    throw new Error('Unable to create application. Constructor not found!');
                }
            }
            else {
                throw new Error('Invalid application injection config');
            }
        });
    }]);