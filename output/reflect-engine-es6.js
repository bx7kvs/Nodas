/**
 * Created by Viktor Khodosevich on 4/24/2017.
 */

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
var $R = new Reflect();
/**
 * Created by Viktor Khodosevich on 4/24/2017.
 */
$R.modules(
    'ApplicationCanvasProvider',
    'ApplicationHTMLRootProvider',
    'ApplicationProvider',
    'ApplicationTickerProvider',
    'ApplicationConfigProvider',
    'InjectionContainerProvider',
    'ExtensionsProvider',
    'FontFamilyManager'
);
/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.$(function ApplicationAudioContextProvider() {


    var contexts = {};

    function getAppContext(appname) {
        return {
            context : new AudioContext(),
            constructor : function audio () {
                this.context = function () {
                    return contexts[appname].context;
                };
            }
        }
    }

    this.getApplicationAudioContext = function (appname) {
        contexts[appname] = getAppContext(appname);
        return contexts[appname].constructor;
    }
});
/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$([function ApplicationCanvasProvider() {

    var canvases = {};


    function getCanvasConstructor(appname) {
       return function Canvas() {
            var canvas = canvases[appname].element,
                context = canvas.getContext('2d');

            this.element = function () {
                return canvas;
            };

            this.context = function () {
                return context;
            };
        }
    }

    this.canvasInjectionConstructor = function (appname) {
        canvases[appname] = {
            appname : appname,
            element : document.createElement('canvas'),
            constructor : getCanvasConstructor(appname)
        };
        return canvases[appname].constructor;
    };

    this.getApplicationCanvas = function (app) {
        return canvases[app].element;
    };
}]);
/**
 * Created by Viktor Khodosevich on 4/28/2017.
 */
$R.$(['@define', function ApplicationConfigProvider(define) {

    var configs = {},
        defs = {};

    function createExtensionConfig(value) {
        return function config() {
            for (var prop in value) {
                if (value.hasOwnProperty(prop)) {
                    if (typeof value[prop] == "string" || typeof value[prop] == "number" || typeof value[prop] == "boolean") {
                        this[prop] = value[prop];
                    }
                    else if (typeof value[prop] == "object" && value[prop].constructor === Array) {
                        var pvalue = [];

                        for (var i = 0; i < value[prop].length; i++) {
                            if (typeof value[prop][i] == "boolean" || typeof value[prop][i] == "string" || typeof value[prop][i] == "number") {
                                pvalue.push(value[prop][i]);
                            }
                        }
                        this[prop] = pvalue;
                    }
                }
            }
        }
    }

    function getAppConfig(cfg) {
        var result = {};
        for (var prop in cfg) {
            if (cfg.hasOwnProperty(prop)) {
                if (typeof cfg[prop] == "object" && cfg[prop].constructor !== Array) {
                    result[prop] = createExtensionConfig(cfg[prop]);
                }
            }
        }
        return result;
    }

    var defaultConfig = function config() {
    };

    define('cfg', function (app, cfg) {
        if (typeof cfg === "object") {
            configs[app] = getAppConfig(cfg);
        }
    });

    this.getExtensionConfig = function (app, extname) {
        if (configs[app]) {
            if (configs[app][extname]) {
                return configs[app][extname];
            }
            return defaultConfig;
        }
        return defaultConfig;
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$(function ApplicationHTMLRootProvider() {


    var elements = {},
        hiddendiv = document.createElement('div');

    function getHTmlRootConstructor(canvas, appname) {
        var lastparent = null;

        elements[appname] = {
            element: document.createElement('div'),
            $constructor: function HTMLRoot() {
                var element = elements[appname].element,
                    cb = {
                        resize: []
                    };

                var width = 0,
                    height = 0;

                this.element = function () {
                    return element;
                };

                function resolve(event, argarray) {
                    var arr = cb[event],
                        args = argarray && typeof argarray == "object" && argarray.constructor == Array ? argarray : [];

                    if (arr) {
                        for (var f = 0; f < arr.length; f++) {
                            var _args = [];
                            arr[f].apply(this, args);
                        }
                    }
                }

                this.on = function (event, func) {
                    if (typeof event == "string" && event.length > 0) {
                        if (cb[event]) {
                            if (typeof func == "function") {
                                cb[event].push(func);
                            }
                            else {
                                throw new Error('Unable to set event [' + event + '] callback. Not a function');
                            }
                        }
                        else {
                            throw new Error('Unable to set event [' + event + ']. No such event.');
                        }
                    }
                    else {
                        throw new Error('Unable to set event. Event name is not a string or empty.');
                    }
                };

                this.hide = function () {
                    lastparent = this.element().parentNode;
                    hiddendiv.appendChild(this.element());
                };

                this.show = function () {
                    if(lastparent) {
                        lastparent.appendChild(this.element());
                        lastparent = null;
                    }
                };

                function checkElementResize(w, h) {
                    if (w !== width || h !== height) {
                        width = w;
                        height = h;
                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);
                        resolve('resize', [w, h]);
                    }
                }

                document.addEventListener('DOMContentLoaded', function () {
                    checkElementResize(element.offsetWidth, element.offsetHeight);
                });

                window.addEventListener('resize', function () {
                    checkElementResize(element.offsetWidth, element.offsetHeight);
                });
            }
        };
        elements[appname].element.setAttribute('class', 'reflect-canvas-wrapper');
        elements[appname].element.setAttribute('style', 'position:absolute; left:0;top:0;width:100%;height:100%;');
        canvas.setAttribute('style', 'position:absolute; left:0;top:0;');
        canvas.setAttribute('id','reflect-canvas-'+appname);
        canvas.setAttribute('class', 'reflect-canvas-output');
        elements[appname].element.appendChild(canvas);
        document.getElementsByTagName('body')[0].appendChild(elements[appname].element);
        return elements[appname].$constructor;
    }

    this.HTMLRootConstructor = function (canvas,appname) {
        return getHTmlRootConstructor(canvas,appname);
    }
});
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
                reflectApps = {},
                classes = {};

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
                        if (this[property] === undefined) {
                            if (property.charAt(0) !== '$') {
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

                        var classContainer = Provider.container();

                        for (var name in classes) {
                            if (classes.hasOwnProperty(name)) {
                                classContainer.injection(classes[name]);
                            }
                        }

                        classContainer.source(classContainer, '.');

                        if (modules[appname]) {
                            apps[appname].source(modules[appname], '$');
                            modules[appname].source(sources, '@');
                            modules[appname].source(classContainer, '.');
                            modules[appname].source(extsArray, false);
                        }
                        apps[appname].source(classContainer, '.');
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

            define('cls', function (func) {
                if (typeof func === "function" && func.name && func.name.length) {
                    if (!classes[func.name]) {
                        classes[func.name] = func;
                    }
                    else {
                        throw new Error('Duplicate or invalid class name [' + func.name + ']');
                    }
                }
                else if (typeof func == "object" && func.constructor == Array) {
                    var valid = true, constructor = null;

                    for (var i = 0; i < func.length; i++) {
                        if (typeof func[i] == 'string') {
                            if (func[i] !== '@extend' && func[i] !== '@inject') {
                                valid = false;
                                break;
                            }
                        }
                        else if (typeof func[i] == "function") {
                            constructor = func[i];
                            break;
                        }
                    }

                    if (valid) {
                        if (constructor) {
                            if (constructor.name) {
                                if (!classes[constructor.name]) {
                                    classes[constructor.name] = func;
                                }
                                else {
                                    throw new Error('Duplicate or invalid class name [' + func.name + ']');
                                }
                            }
                            else {
                                throw new Error('Unable to create class. Constructor is not a named function.');
                            }
                        }
                        else {
                            throw new Error('Class constructor is undefined');
                        }
                    }
                    else {
                        throw new Error('Unable to add dependencies. Only @extend and @inject are possible for cls');
                    }
                }
                else {
                    throw new Error('Class func should be a named function');
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
/**
 * Created by Viktor Khodosevich on 4/28/2017.
 */
$R.$(function ApplicationTickerProvider() {

    var tickers = {};

    function Ticker(canvas, target) {
        var ticktime = (1000 / 58.8).toFixed(2),
            callbacks = {},
            context = canvas.getContext('2d'),
            frame = 0,
            args = [null, canvas, context, 0],
            tickfunction = function () {
                args[0] = new Date();
                args[3] = frame;
                try {
                    for (var ordering in callbacks) {
                        for (var i = 0; i < callbacks[ordering].length; i++) {
                            callbacks[ordering][i].apply(target, args);
                        }
                    }
                    frame++;
                }
                catch (e) {
                    clearInterval(interval);
                    resolve('error', e);
                    console.error('Unable to run ticker anymore. Error emerged during app ticker progress.');
                    throw e;
                }

            },
            interval = null,
            eventCb = {
                stop: [],
                start: [],
                error: []
            },
            self = this;

        function resolve(event, args) {
            var _call_args = [];
            if (typeof args == "object" && args.constructor == Array) {
                _call_args = args;
            }
            else if (args !== undefined) {
                _call_args.push(args);
            }

            if (typeof event == "string" && event.length) {
                if (eventCb[event]) {
                    for (var i = 0; i < eventCb[event].length; i++) {
                        eventCb[event][i].apply(self, _call_args);
                    }
                }
                else {
                    throw new Error('Unable to resolve event [' + event + ']. No such event.')
                }
            }
            else {
                throw new Error('Unable to resolve event. Event parameter is not a string or empty')
            }
        }

        this.on = function (event, func) {
            if(typeof event == "string" && event.length) {
                if(eventCb[event]) {
                    if(typeof func == "function") {
                        eventCb[event].push(func)
                    }
                    else {
                        throw new Error('Unable to set event ['+event+']. Callback is not a function.');
                    }
                }
                else {
                    throw new Error('Unable to set event ['+event+'] handler. No such event.')
                }
            }
            else {
                throw new Error('Unable to set event. Event argument is not a string or empty.')
            }
        };

        this.stop = function () {
            if (interval) {
                frame = 0;
                clearInterval(interval);
                interval = null;
                resolve('stop', this);
            }
        };

        this.start = function () {
            if (!interval) {
                interval = setInterval(tickfunction, ticktime);
                resolve('start', this);
            }
        };

        this.fps = function (number) {
            if (typeof number == "number") {
                if (number > 60) number = 60;
                if (number <= 0) number = 1;
                ticktime = (1000 / number).toFixed(2);
                this.stop();
                this.start();
            }
            else {
                return (1000 / ticktime).toFixed(2);
            }
        };

        this.callback = function (a, b) {
            if (typeof a === "function") {
                if (!callbacks[0]) callbacks[0] = [];
                callbacks[0].push(a);
            }
            else if (typeof a == "number") {
                if (typeof b == "function") {
                    if (!callbacks[a]) callbacks[a] = [];
                    callbacks[a].push(b);
                }
                else {
                    throw new Error('Unable to queue. callback is not a function')
                }
            }
            else {
                throw new Error('Unable to create callback. Wrong arguments passed');
            }
        }
    }

    this.createTicker = function (app, canvas, target) {
        if (tickers[app]) tickers[app].stop();

        tickers[app] = new Ticker(canvas, target);

        return tickers[app];
    }

});
/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'InjectionContainerProvider', function ExtensionsProvider(define, provider) {

    //TODO: onInit event handling for providers requiring core to be built for some functionality

    var extensions = {},
        parts = {};

    this.extensions = function () {
        var result = {};
        for(var ext in extensions) {
            if(extensions.hasOwnProperty(ext)) {
                result[ext] = extensions[ext].clone();
            }
        }
        return result;
    };

    function createExtensionContainer(name) {
        if (!extensions[name]) {
            extensions[name] = provider.container();
            return extensions[name];
        }
        else {
            return extensions[name];
        }
    }

    function createPartContainer(extension) {
        if (!parts[extension]) {
            parts[extension] = provider.container();
            createExtensionContainer(extension).source(parts[extension],'$');
            return parts[extension];
        }
        else {
            return parts[extension];
        }
    }

    define('ext', function (config) {
        if (typeof config == "function" && config.name) {
            createExtensionContainer(config.name).injection(config);
        }
        else if (typeof config == "object" && config.constructor === Array) {
            var name = null;
            for (var i = 0; i < config.length; i++) {
                if (typeof config[i] === "function" && config[i].name) {
                    name = config[i].name;
                    break
                }
            }
            if (name) {
                createExtensionContainer(name).injection(config);
            }
            else {
                throw new Error('Constructor not found.');
            }
        }
        else {
            throw new Error('Wrong arguments');
        }

    });

    define('part', function (ext, config) {
        if (typeof ext == "string" && ext.length > 0) {
            if (typeof config == "function" && config.name) {
                createPartContainer(ext).injection(config);
            }
            else if (typeof config == "object" && config.constructor == Array) {
                var name = null;
                for (var i = 0; i < config.length; i++) {
                    if (typeof config[i] == "function" && config[i].name) {
                        name = config[i].name;
                        break;
                    }
                }
                if (name) {
                    createPartContainer(ext).injection(config);
                }
                else {
                    throw new Error('Extension [' + ext + '] part Constructor was not found.');
                }
            }
        }
        else {
            throw new Error('Host extension was not specified!');
        }
    });

}]);
/**
 * Created by Viktor Khodosevich on 6/2/2017.
 */
$R.$(['@define', function FontFamilyManager(define) {

    var element = document.createElement('style');

    var families = {},
        format = ['eot', 'svg', 'ttf', 'woff'];

    document.getElementsByTagName('head')[0].appendChild(element);

    var formatStr = {
        eot: function (url) {
            return 'url("' + url + '.eot?#iefix") format("embedded-opentype")';
        },
        woff: function (url) {
            return 'url("' + url + '.woff") format("woff")';
        },
        ttf: function (url) {
            return 'url("' + url + '.ttf") format("truetype")';
        },
        svg: function (url, font, style) {
            return 'url("' + url + '.svg#' + font + '-' + (style.charAt(0).toUpperCase() + style.slice(1)) + '") format("svg")';
        }
    };

    function fontString(font, root) {

        var result = '';

        for (var w = 0; w < font.weight.length; w++) {
            for (var s = 0; s < font.style.length; s++) {
                if (!font[font.weight[w] + '-' + font.style[s]]) {
                    var filestring = root + '/' + font.name + '-' + font.weight[w] + '-' + font.style[s];
                    var string = '@font-face {' +
                        'font-family: "' + font.name + '-' + font.weight[w] + '";' +
                        'src:';

                    for (var f = 0; f < format.length; f++) {
                        string += formatStr[format[f]](filestring, font.name, font.style[s]);
                        if (f < format.length - 1) {
                            string += ','
                        }
                        else {
                            string += ';'
                        }
                    }
                    string += 'font-weight: ' + font.weight[w] + ';';
                    string += 'font-style:' + font.style[s] + ';}';
                    font[font.weight[w] + '-' + font.style[s]] = string;
                }

                result += font[font.weight[w] + '-' + font.style[s]];
            }
        }

        return result;
    }

    function update(path) {
        var string = '';
        for (var family in families) {
            if (families.hasOwnProperty(family)) {
                string += fontString(families[family], path);
            }
        }
        element.innerHTML = string;
    };

    function inArray(array, value) {
        var result = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                result = true;
                break;
            }
        }
        return result;
    };

    define('font', function (path, font, weight, style) {
        if (!families[font]) {
            families[font] = {
                name: font
            };
        }
        if (families[font][weight + '-' + style]) return;
        if (!families[font].weight) families[font].weight = [];
        if (!families[font].style) families[font].style = [];
        if (!inArray(families[font].weight, weight)) families[font].weight.push(weight);
        if (!inArray(families[font].style, style)) families[font].style.push(style);
        update(path);
    });

    define('fontFormats', function () {
        var result = [];
        for (var i = 0; i < format.length; i++) {
            result.push(format[i]);
        }
        return result;
    })
}]);
/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$([function InjectionContainerProvider() {

    function Injection(con) {
        var constructor = con, instance = null,
            dependencies = [];

        if (typeof con === "function" && con.name) {
            constructor = con;
        }
        else if (typeof con == "object" && con.constructor === Array) {
            for (var i = 0; i < con.length; i++) {
                if (typeof con[i] == "string" && con[i].length) {
                    dependencies.push(con[i]);
                }
                else if (typeof con[i] == "function" && con[i].name) {
                    constructor = con[i];
                    break;
                }
            }
        }

        if (!constructor) throw new Error('Injection constructor undefined!');

        this.name = function () {
            return constructor.name;
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
                        var source = container.findSourceByInjectionName(injectionName);
                        if (source) {
                            var config = source.resolveInjectionDependancies(injectionName);
                            config.$constructor.apply(target, config.dependencies);
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
                return container.resolveDirectInjection(injectionName);
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

        this.clone = function () {
            return new Injection(con);
        };
    }

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
            if(this.has(name)) {
                var source = null;
                var stripName = stripPrefix(name);
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].has(stripName)) {
                        source = containers[i];
                    }
                }
                if(source) {
                    return source.resolve(stripName,'extend')
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

                if(library[name]) {
                    var result = {
                        dependencies : [],
                        $constructor : library[name].$constructor()
                    },
                        dependencies = library[name].dependencies();

                    for(var d = 0 ; d < dependencies.length; d++) {
                        if (dependencies[d] == '@extend') {
                            result.dependencies.push(library[name].extend(this));
                        }
                        else if (dependencies[d] == '@inject') {
                            result.dependencies.push(library[name].inject(this));
                        }
                        else {
                            var src = this.findSourceByInjectionName(dependencies[d]);
                            if(src) {
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
                        else if(dependencies[i].charAt(0) === '.') {
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
            if(source) {
                return source.resolve(name,true);
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

}]);
/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'InjectionContainerProvider','ApplicationProvider', function Injector(define, provider, applications) {

    //TODO: onInit event handling for providers requiring core to be built for some functionality

    var extensions = {},
        parts = {};

    this.extensions = function () {
        var result = [];
        for(var ext in extensions) {
            if(extensions.hasOwnProperty(ext)) {
                result.push(extensions[ext].clone())
            }
        }
        return result;
    };

    function createExtensionContainer(name) {
        if (!extensions[name]) {
            extensions[name] = provider.container();
            return extensions[name];
        }
        else {
            return extensions[name];
        }
    }

    function createPartContainer(extension) {
        if (!parts[extension]) {
            parts[extension] = provider.container();
            createExtensionContainer(extension).source(parts[extension],'$');
            return parts[extension];
        }
        else {
            return parts[extension];
        }
    }

    define('ext', function (config) {
        if (typeof config == "function" && config.name) {
            if (!extensions[config.name]) {
                createExtensionContainer(config.name).injection(config);
            }
            else {
                throw new Error('Extension constuctor is not a named function');
            }
        }
        else if (typeof config == "object" && config.constructor === Array) {
            var name = null;
            for (var i = 0; i < config.length; i++) {
                if (typeof config[i] === "function" && config[i].name) {
                    name = config[i].name;
                    break
                }
            }
            if (name) {
                if (!extensions[name]) {
                    createExtensionContainer(config.name).injection(config);
                }
                else {
                    throw new Error('Extension constructor was not found!');
                }
            }
            else {
                throw new Error('Constructor not found.');
            }
        }
        else {
            throw new Error('Wrong arguments');
        }

    });

    define('part', function (ext, config) {
        if (typeof ext == "string" && ext.length > 0) {
            if (typeof config == "function" && config.name) {
                createPartContainer(ext).injection(config);
            }
            else if (typeof config == "object" && config.constructor == Array) {
                var name = null;
                for (var i = 0; i < config.length; i++) {
                    if (typeof config[i] == "function" && config[i].name) {
                        name = config.name;
                        break;
                    }
                }
                if (name) {
                    createPartContainer(ext).injection(config);
                }
                else {
                    throw new Error('Extension [' + ext + '] part Constructor was not found.');
                }
            }
        }
        else {
            throw new Error('Host extension was not specified!');
        }
    });

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Morphine', [function Morphine () {

    var easing = null,
        duration = 1,
        repeat = false,
        repeatCount = 1,
        start_time = null,
        func = null,
        start = 0,
        end = 0;

    this.done = function () {
        return done;
    };

    this.pause = function () {
        pasued = true;
    };

    this.paused = function () {
        return pasued;
    };

    this.stop = function () {
        done = true;
    };

    var progress = 0,
        pasued = false,
        done = false;

    function Tick(time) {
        if(!done) {
            if(pasued) {
                start_time  = new Date().getTime() - (duration*progress);
                return;
            }
            if(!start_time) start_time = new Date().getTime();

            progress = (time - start_time) / duration;

            if(progress > 1) progress = 1;
            if(progress == 1) {
                if(!repeat) {

                    done = true;

                }
                else {
                    if(repeatCount > 0) {

                        if(repeatCount !== Infinity) {
                            repeatCount --;
                        }

                        start_time = new Date().getTime();
                    }
                    else {
                        done = true;
                    }
                }
            }
            func.apply(null, [progress, easing((time - start_time) / 1000, start, end - start, duration / 1000), start_time]);
        }
    }

    this.config = function (s,e,f,dur,ease,rpt) {

        if(typeof s !== "number" || typeof e !== "number" || typeof dur !== "number" || dur < 0 ) return;

        if(typeof ease !== "function") return;
        if(typeof f !== "function") return;

        if(typeof rpt == "number") repeat = rpt;

        start = s;
        end = e;
        easing = ease;
        func = f;
        duration = dur > 0 ? dur : 1;

        delete this.config;

        return Tick;
    }

}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', '@app', '$$config', function Tree(Debug, app, config) {

    var root = null, context = null, rootDrawer = null, rootStyle = null;

    this.root = function (object) {
        if (!root) {
            if (!object.type || typeof object.type !== "function" || object.type() !== 'Group') {
                Debug.error({}, 'Tree / Unable to set tree root! Wrong object type!');
                return;
            }

            root = object;

            var drawer = root.extension('Drawer');

            if (!drawer) {
                Debug.error({}, 'Tree / Unable to get Drawer extension!');
                return;
            }
            if (!drawer.draw || typeof drawer.draw !== "function") {
                Debug.error({}, 'Tree / Unable to register root Drawer. Drawer.draw is not a function!');
                return;
            }

            rootDrawer = drawer;

            rootStyle = root.extension('Style');

            return root;
        }
        else {
            return root;
        }
    };

    app.$('tick', function (date, canvas) {
        if (!root || !rootDrawer) return;
        if (!context) context = canvas.getContext('2d');
        if (config.clear === true) context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        rootDrawer.draw.call(root, context);

    });

}]);
/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.part('Objects', [function AreaObjectClass() {

}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$MouseHelper',function CircleObjectClass (MouseHelper) {
    this.mouseCheckFunction(MouseHelper.circleCheckFunction);
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects' , ['$Tree', function DefaultObjectType(Tree) {
    Tree.root(this).append(this);
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', function GroupObjectClass() {

});
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$MouseHelper',function ImageObjectClass(MouseHelper) {
    this.mouseCheckFunction(MouseHelper.rectCheckFunction);
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', function LineObjectClass() {

});
$R.part('Objects',['$MouseHelper', function RectangleObjectClass (MouseHelper) {
    this.mouseCheckFunction(MouseHelper.rectCheckFunction);
    var mouse = this.extension('Mouse');
    mouse.cursorTransformFunction(MouseHelper.rectCursorTransformFunction);
}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$MouseHelper',function SpriteObjectClass(MouseHelper) {
    this.mouseCheckFunction(MouseHelper.rectCheckFunction);
}]);
/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['$MouseHelper',function TextObjectClass(MouseHelper) {
    this.mouseCheckFunction(MouseHelper.rectCheckFunction);
}]);
/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', [function Canvas() {

    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    var w = 0, h = 0;

    this.context = function () {
        return context;
    };

    this.width = function (value) {
        if (typeof value == "number") {
            w = value;
            canvas.setAttribute('width', w);
        }
        else {
            return w;
        }
    };

    this.height = function (value) {
        if (typeof value == "number") {
            h = value;
            canvas.setAttribute('height', h);
        }
        else {
            return h;
        }
    };

    this.export = function () {
        return canvas;
    };

}]);
/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', function ColorHelper () {

    function NormalizeColorArray (array) {
        if(array !== false && array !== undefined) {
            for(var i =0 ;i < array.length; i++) {
                array[i] = array[i] <= 255 ? array[i] : 255;
                array[i] = array[i] >= 0 ? array[i] :0;
                array[i] = (i !== 3 && array[i] !== 0) ? parseInt(array[i]) : array[i];
                array[i] = ((i == 3) && array[i]) <=1 ? array[i] : 1;
                array[i] = Math.abs(array[i]);
            }
            return array;
        }
        else {
            return false;
        }
    }

    function ParseColour (color) {
        var cache
            , p = parseInt // Use p as a byte saving reference to parseInt
            , color = color.replace(/\s\s*/g,'') // Remove all spaces
            ;//var

        // Checks for 6 digit hex and converts string to integer
        if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
            cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];

        // Checks for 3 digit hex and converts string to integer
        else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
            cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];

        // Checks for rgba and converts string to
        // integer/float using unary + operator to save bytes
        else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color))
            cache = [+cache[1], +cache[2], +cache[3], +cache[4]];

        // Checks for rgb and converts string to
        // integer/float using unary + operator to save bytes
        else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
            cache = [+cache[1], +cache[2], +cache[3]];

        // Otherwise throw an exception to make debugging easier
        else return false;

        // Performs RGBA conversion by default
        isNaN(cache[3]) && (cache[3] = 1);

        // Adds or removes 4th value based on rgba support
        // Support is flipped twice to prevent erros if
        // it's not defined
        return NormalizeColorArray (cache.slice(0,4));
    }

    this.colorToArray = ParseColour;
    this.normalize = NormalizeColorArray;
    this.isColor = function (array) {
        var error = false;
        if(array.length == 4) {
            var valerror = false;
            for(var i = 0; i < array.length; i++) {
                if(typeof array[i] == 'number'|| typeof array[i] == 'string') {
                    if(typeof  array[i] == 'string' && isNaN(array[i]*1)) {
                        error = true;
                    }
                }
                else {
                    error = true;
                }
            }
        }
        else {
            error = true;
        }
        if(error) {
            console.warn('Silk : Check for color unsuccessful. "'+array+'" is not a color Array.');
        }
        return !error;
    };

    this.arrayToColor = function (array) {
        if(array && array.length ==4) {
            var string = 'rgba(';
            for(var i =0; i< array.length; i++){
                string+= i==3 ? array[i] + ')' : array[i]+',';
            }
            return string;
        }
        else  {
            console.warn('Unknown Input array format. Should be [R,G,B,A];');
            return false;
        }
    }
})
/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', ['Debug', function DrawerHelper(Debug) {

    var textDrawerContext = document.createElement('canvas').getContext('2d');

    this.measureText = function (func) {
        textDrawerContext.save();
        var width = func(textDrawerContext);
        textDrawerContext.restore();
        return width;
    };

    this.transform = function (object, context) {
        context.transform.apply(context, object.matrix().extract());
    };

    this.drawLineBgClipPath = function (context, path, style, assembler, sprite) {
        var bg = style.get('bg'),
            bgsize = style.get('bgSize'),
            bgposition = style.get('bgPosition');

        context.save();

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }

            context.lineTo(x2, y2);
        }

        context.closePath();
        context.clip();

        for (var b = 0; b < bg.length; b++) {

            if (!bg[b].loaded()) {
                bg[b].on('load', function () {
                    assembler.update('bg');
                });
            }
            else {
                context.save();
                var bgwidth = box.size[0] * bgsize[b][0],
                    bgheight = box.size[1] * bgsize[b][1],
                    bgpositionx = box.size[0] * bgposition[b][0],
                    bgpositiony = box.size[1] * bgposition[b][1];

                context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                context.restore();
            }
        }
        context.restore();
    };

    this.drawBezierBgClipPath = function (context, path, style, assembler, sprite) {
        var bg = style.get('bg'),
            bgsize = style.get('bgSize'),
            bgposition = style.get('bgPosition');

        context.save();

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);
        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }
            context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);

        }
        context.closePath();
        context.clip();

        for (var b = 0; b < bg.length; b++) {

            if (!bg[b].loaded()) {
                bg[b].on('load', function () {
                    assembler.update('bg');
                });
            }
            else {
                context.save();
                var bgwidth = box.size[0] * bgsize[b][0],
                    bgheight = box.size[1] * bgsize[b][1],
                    bgpositionx = box.size[0] * bgposition[b][0],
                    bgpositiony = box.size[1] * bgposition[b][1];

                context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                context.restore();
            }
        }

        context.restore();

    };

    this.drawLinePathFill = function (context, path, style) {
        var fill = style.get('fill'),
            cap = style.get('cap');

        context.save();
        context.lineCap = cap;
        context.moveTo(path[0][0], path[0][1]);

        context.beginPath();

        console.log(path);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            context.lineTo(x2, y2);
        }

        context.closePath();
        context.fillStyle = fill;
        context.fill();
        context.restore();

    };

    this.drawBezierPathFill = function (context, path, style) {
        var fill = style.get('fill'),
            cap = style.get('cap');

        context.save();

        context.lineCap = cap;

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }

            context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);

        }
        context.closePath();
        context.fillStyle = fill;
        context.fill();
        context.restore();

    };

    this.drawLinePath = function (context, path, style) {
        var strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth'),
            strokeStyle = style.get('strokeStyle'),
            strokeCap = style.get('cap');

        context.save();

        context.lineCap = strokeCap;

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(x2, y2);
            }
            else {
                context.moveTo(x1, y1);
                context.beginPath();
                context.strokeStyle = strokeColor[i];
                context.lineWidth = strokeWidth[i];
                context.setLineDash(strokeStyle[i]);
                context.lineTo(x2, y2);
                context.stroke();
            }
        }

        context.restore();
    };

    this.drawBezierPath = function (context, path, style) {
        var strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth'),
            strokeStyle = style.get('strokeStyle'),
            strokeCap = style.get('cap');

        context.save();

        context.lineCap = strokeCap;

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(x2, y2);
            }
            else {
                context.beginPath();
                context.moveTo(x1, y1);
                context.strokeStyle = strokeColor[i];
                context.lineWidth = strokeWidth[i];
                context.setLineDash(strokeStyle[i]);
                context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);
                context.stroke();
            }
        }

        context.restore();
    };

    this.drawRectFill = function (context, style, x, y, w, h) {

        context.save();

        var fill = style.get('fill');

        context.fillStyle = fill;

        context.rect(x, y, w, h);

        context.fill();

        context.restore();


    };

    this.drawRectStroke = function (context, style, x, y, w, h) {
        var strokeStyle = style.get('strokeStyle'),
            strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth');

        context.save();

        var _x = 0, _y = 0;

        for (var i = 0; i < 4; i++) {
            context.beginPath();
            context.strokeStyle = strokeColor[i];
            context.strokeWidth = strokeWidth[i];
            context.setLineDash(strokeStyle[i]);


            if (i == 0) {
                _x = x + w;
                _y = y;
            }
            if (i == 1) {
                _x = x + w;
                _y = y + h;
            }
            if (i == 2) {
                _x = x;
                _y = y + h;
            }
            if (i == 3) {
                _x = x;
                _y = y;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(_x, _y);
            }
            else {
                context.lineTo(_x, _y);
                context.stroke();
            }

        }


        context.restore();
    }
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', function Extension() {

    var properties = {}, clear = {}, object = null,
        applies = [];

    this.defineObject = function (o) {
        object = o;
        delete this.defineObject;
    };

    this.object = function () {
        return object;
    };

    this.matchType = function (type) {
        if (applies.length == 0) return true;

        var result = false;

        for (var i = 0; i < applies.length; i++) {
            if (applies[i] === type) {
                result = true;
                break;
            }
        }
        if (this.applyTo) {
            delete this.applyTo;
            delete  this.matchType;
        }
        return result;
    };

    this.applyTo = function (types) {
        if (typeof types == "string") {
            applies.push(types);
        }
        else if (typeof types == "object" && types.constructor === Array) {
            for (var i = 0; i < types.length; i++) {
                if (typeof types[i] == "string") {
                    applies.push(types[i]);
                }
            }
        }
        delete this.applyTo;
    };

    this.register = function (property, func, temp) {
        if (!properties[property]) properties[property] = func;
        if (temp) clear[property] = true;
    };

    this.wrap = function (object) {
        for (var property in properties) {
            if (!properties.hasOwnProperty(property)) continue;
            if (object[property]) continue;
            object[property] = properties[property];
        }

        delete  this.wrap;
        delete  this.register;
        delete  this.clear;
    };

    this.hasProperty = function (prop) {
        var result = false;

        for (var property in properties) {
            if (!properties.hasOwnProperty(property)) continue;

            if (prop == property) {
                result = true;
                break;
            }
        }

        return result;
    };

    this.clear = function (object) {
        for (var prop in clear) {
            if (!clear.hasOwnProperty(prop)) continue;
            delete  object[prop];
        }
    };
});
/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.part('Objects', ['@inject', 'Debug', function GraphicsAssembler(inject, Debug) {

    var output = inject('$Canvas'),
        context = output.context(),
        pipe = [],
        layers = {},
        w = 0,
        h = 0,
        boxExt = null,
        resized = false,
        ready = false;

    function SetSize(width, height) {
        for (var i = 0; i < pipe.length; i++) {
            pipe[i].size(width, height);
        }
        output.width(width);
        output.height(height);
        w = width;
        h = height;
    }

    function compose(ctx) {
        if(!resized) {
            if(boxExt) {
                var sprite = boxExt.box().sprite();
                if(sprite.size[0] !== w || sprite.size[1] !== h) {
                    SetSize(sprite.size[0],sprite.size[1]);
                }
            }
            resized = true;
        }
        if(!ready) {
            context.clearRect(0,0,w,h);
            for (var i = 0; i < pipe.length; i++) {
                pipe[i].draw(context);
            }
            ready = true;
        }
        ctx.drawImage(output.export(),0,0);
    }

    this.layer = function (order, name, updateFunc) {
        if (typeof order !== "number") {
            Debug.warn({o: order}, 'Invalid order argument [{o}] is not a number.');
            return;
        }
        if (typeof name !== "string") {
            Debug.warn({n: name}, '[{n}] is not valid name for layer');
            return;
        }
        if (typeof updateFunc !== "function") {
            Debug.warn('updateFunc is not a function!');
            return;
        }

        layers[name] = inject('$GraphicsAssemblerLayer');
        layers[name].f(updateFunc);
        layers[name].ordering(order);
        layers[name].update();
        pipe.push(layers[name]);
        pipe.sort(function (a, b) {
            return a.ordering() - b.ordering();
        });
        ready = false;
    };

    this.ready = function () {
        return ready;
    };

    this.box = function (boxProvider) {
        boxExt = boxProvider;
    };

    this.size = function (width, height) {
        if (width !== w || height !== h) {
            SetSize(width, height);
            ready = false;
        }
    };

    this.resize = function () {
        resized = false;
        ready = false;
    };

    this.update = function (name) {
        ready = false;
        layers[name].update();
    };

    this.draw = compose;

}]);
/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.part('Objects', ['@inject', 'Debug', function GraphicsAssemblerLayer(inject, Debug) {
    var canvas = inject('$Canvas'),
        context = canvas.context(),
        width = 0,
        height = 0,
        func = null,
        ready = false,
        ordering = 0;

    function updateCanvas(ctx) {
        if (!ready) {
            context.save();
            context.clearRect(0, 0, width, height);
            if (func) func(context);
            ready = true;
            context.restore();
        }
        ctx.drawImage(canvas.export(), 0, 0);
    }

    this.f = function (f) {
        if (typeof f == "function") {
            func = f;
            delete this.f;
        }
        else {
            Debug.warn({f: f}, '[{f}] is not a function');
        }
    };

    this.size = function (w, h) {
        if (width !== w || h !== h) {
            canvas.width(w);
            canvas.height(h);
            width = w;
            height = h;
            ready = false;
        }
    };

    this.ordering = function (value) {
        if (value && typeof value == "number") {
            ordering = value;
        }
        return ordering;
    };

    this.update = function () {
        ready = false;
    };

    this.draw = updateCanvas;
}]);
/**
 * Created by Viktor Khodosevich on 2/6/2017.
 */
$R.part('Objects', function MatrixHelper() {


    function GrapthicsTransformMatrix(object) {
        var value = [1, 0, 0, 1, 0, 0],
            inversion = [1, 0, 0, 1, 0, 0],
            globalInversion = null,
            history = [], inverted = false;

        function multiply(m1, m2) {
            var a1 = m1[0] * m2[0] + m1[2] * m2[1],
                a2 = m1[1] * m2[0] + m1[3] * m2[1],
                a3 = m1[0] * m2[2] + m1[2] * m2[3],
                a4 = m1[1] * m2[2] + m1[3] * m2[3],
                a5 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
                a6 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
            m1[0] = a1;
            m1[1] = a2;
            m1[2] = a3;
            m1[3] = a4;
            m1[4] = a5;
            m1[5] = a6;
        }

        function invert() {
            for (var i = history.length - 1; i >= 0; i--) {
                if (history[i].rotate) {
                    var sinA = Math.sin(-history[i].rotate),
                        cosA = Math.cos(-history[i].rotate);

                    multiply(inversion, [cosA, sinA, -sinA, cosA, 0, 0]);
                }
                if (history[i].translate) {
                    multiply(inversion, [1, 0, 0, 1, -history[i].translate[0], -history[i].translate[1]]);
                }
                if (history[i].skew) {
                    multiply(inversion, [1, Math.tan(-history[i].skew[1]), Math.tan(-history[i].skew[0]), 1, 0, 0]);
                }
                if (history[i].scale) {
                    multiply(inversion, [1 / history[i].scale[0], 0, 0, 1 / history[i].scale[1], 0, 0]);
                }
            }
            inverted = true;
            history = null;
        }

        this.rotate = function (angle) {
            var sinA = Math.sin(angle),
                cosA = Math.cos(angle),
                m = [cosA, sinA, -sinA, cosA, 0, 0];

            multiply(value, m);

            history.push({'rotate': angle});

            return this;
        };

        this.translate = function (x, y) {
            var m = [1, 0, 0, 1, x, y];

            if (x !== 0 || y !== 0) {
                multiply(value, m);
                history.push({'translate': [x, y]});
            }

            return this;
        };

        this.scale = function (x, y) {
            if (x !== 1 || y !== 1) {
                var m = [x, 0, 0, y, 0, 0];
                multiply(value, m);
                history.push({'scale': [x, y]});
            }

            return this;
        };

        this.skew = function (x, y) {
            if (x !== 0 || y !== 0) {
                var tanA = Math.tan(x),
                    tanB = Math.tan(y),
                    m = [1, tanB, tanA, 1, 0, 0];

                multiply(value, m);
                history.push({'skew': [x, y]});
            }

            return this;
        };

        this.extract = function () {
            return value;
        };

        function invertGlobal() {
            var parent = object.parent();

            if (!inverted) invert();

            if (parent) {
                if (!globalInversion) {
                    globalInversion = [inversion[0], inversion[1], inversion[2], inversion[3], inversion[4], inversion[5]];
                    multiply(globalInversion, parent.matrix().globalInversionMatrix());
                }
                else {
                    return globalInversion;
                }
            }
            else {
                globalInversion = inversion;
            }

            return globalInversion;
        }

        this.globalInversionMatrix = invertGlobal;

        this.globalCursorProjection = function (cursor) {
            if (!globalInversion) invertGlobal();

            var x = cursor[0] * globalInversion[0] + cursor[1] * globalInversion[2] + globalInversion[4],
                y = cursor[0] * globalInversion[1] + cursor[1] * globalInversion[3] + globalInversion[5];

            cursor[0] = x;
            cursor[1] = y;

            return cursor;
        };

        this.cursorProjection = function (cursor) {
            if (!inverted) invert();

            var x = cursor[0] * inversion[0] + cursor[1] * inversion[2] + inversion[4],
                y = cursor[0] * inversion[1] + cursor[1] * inversion[3] + inversion[5];

            cursor[0] = x;
            cursor[1] = y;

            return cursor;
        };

    }

    this.objectMatrix = function (object) {

        var matrix = new GrapthicsTransformMatrix(object);

        var style = object.extension('Style'),
            boxContainer = object.extension('Box').box(),
            sprite = boxContainer.sprite(),
            position = style.get('position'),
            origin = style.get('origin'),
            skew = style.get('skew'),
            rotate = style.get('rotate'),
            scale = style.get('scale'),
            translate = style.get('translate'),

            _translate = object.type() == 'Group' ? [
                    position[0] + translate[0] - sprite.margin[3],
                    position[1] + translate[1] - sprite.margin[0]
                ] :
                [
                    sprite.position[0] + translate[0],
                    sprite.position[1] + translate[1]
                ],
            _origin = [
                origin[0] * sprite.size[0] + sprite.margin[3],
                origin[1] * sprite.size[1] + sprite.margin[0]
            ];


        matrix.translate(_origin[0], _origin[1]);
        if (_translate[0] !== 0 || _translate[1] !== 0) matrix.translate(_translate[0], _translate[1]);
        if (rotate !== 0) matrix.rotate(rotate);
        if (skew[0] !== 0 || skew[1] !== 0) matrix.skew(skew[0], skew[1]);
        if (scale[0] !== 1 || scale[1] !== 1) matrix.scale(scale[0], scale[1]);
        matrix.translate(-_origin[0], -_origin[1]);

        return matrix;
    };

});
/**
 * Created by bx7kv_000 on 12/29/2016.
 */
$R.part('Objects', ['Debug', function ModelHelper(Debug) {

    this.cloneHash = function (hash) {
        if (typeof hash !== "object") {
            Debug.error('Hash is not an object!');
            return;
        }
        return JSON.parse(JSON.stringify(hash));
    };

    this.cloneArray = function (array) {
        if (typeof array !== "object" || array.constructor !== Array) {
            Debug.error('array is not an array!');
            return;
        }

        var result = [];

        for (var i = 0; i < array.length; i++) {
            if (typeof array[i] == "object") {
                if (array[i].constructor == Array) {
                    result.push(this.cloneArray(array[i]))
                }
                else {
                    result.push(this.cloneHash(array[i]));
                }
            }
            else if (typeof array[i] == "function") {
                var text = array[i].toString();
                result.push(eval(text));
                Debug.warn('You clone functions! It can be slow!');
            }
            else {
                result.push(array[i]);
            }
        }

        return result;
    };

    this.validNumericArray = function (array) {
        var result = true;

        if (typeof array !== "object" || array.constructor !== Array) return false;

        for (var i = 0; i < array.length; i++) {
            if (typeof array[i] !== "number") {
                result = false;
                break;
            }
        }

        return result;
    };

    var blendings = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over',
        'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply',
        'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
        'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
    ];

    this.validBlending = function (value) {
        var result = false;

        for (var i = 0; i < blendings.length; i++) {
            if (blendings[i] == value) {
                result = true;
                break;
            }
        }

        return result;
    };

    var sprite_regexp = /^([./_\da-zA-Z]+)(\[(\d+)\])$/;

    this.isSpriteString = function (str) {
        return sprite_regexp.test(str);
    };

    this.readSpriteString = function (str) {
        var result = str.match(sprite_regexp);

        return {
            url: result[1],
            frames  : parseInt(result[3])
        }
    };

}]);
/**
 * Created by Viktor Khodosevich on 2/3/2017.
 */
$R.part('Objects', [function MouseHelper() {

    this.circleUserCheckFunction = function (cursor) {
        var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]);

        if (coords < [0] || coords[1] < 0) return false;

        var sprite = this.extension('Box').box().sprite();

        if (coords[0] > sprite.size[0]) return false;

        if (coords[1] > sprite.size[1]) return false;

        var radius = sprite.size[0] / 2,
            cx = radius,
            cy = sprite.size[1] / 2;

        if (Math.pow(coords[0] - cx, 2) + Math.pow(coords[1] - cy, 2) <= Math.pow(radius, 2)) {
            return this;
        }

        return false;
    };

    this.squareUserCheckFunction = function (cursor) {
        var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]),
            sprite = this.extension('Box').box().sprite();

        if (coords[0] > 0 && coords[0] < sprite.size[0]) {
            if (coords[1] > 0 && coords[1] < sprite.size[1]) {
                return this
            }
            return false;
        }
        return false;
    };

    this.circleCheckFunction = function (cursor) {
        var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]);

        if (coords < [0] || coords[1] < 0) return false;

        var sprite = this.extension('Box').box().sprite();

        if (coords[0] > sprite.size[0]) return false;

        if (coords[1] > sprite.size[1]) return false;

        var center = sprite.size[0] / 2,
            radius = this.extension('Style').get('radius');

        if (Math.pow((coords[0] - center), 2) + Math.pow((coords[1] - center), 2) < Math.pow(radius, 2)) {
            return this;
        }

        return false;
    };

    this.rectCheckFunction = function (cursor) {
        var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]),
            sprite = this.extension('Box').box().sprite();

        if (coords[0] > 0 && coords[0] < sprite.size[0]) {
            if (coords[1] > 0 && coords[1] < sprite.size[1]) {
                return this
            }
            return false;
        }
        return false;
    };
}]);
/**
 * Created by bx7kv_000 on 12/29/2016.
 */
$R.part('Objects', ['Debug', function PathHelper(Debug) {

    function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = t * d01 / (d01 + d12);
        var fb = t * d12 / (d01 + d12);
        var p1x = x1 - fa * (x2 - x0);
        var p1y = y1 - fa * (y2 - y0);
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    }

    /*
     path = [x1,y1,x2,y2,ax1,ay1,ax2,ay2]
     */

    this.convertComplexPath = function (path) {
        var result = [];

        for (var i = 0; i < path.length; i++) {
            result.push([
                path[i][0],
                path[i][1]
            ]);
        }

        return result;
    };

    this.convertSimplePath = function (path) {

        if (path.length < 2) {
            Debug.error('Path should consist of at least two points!');
            return;
        }

        var result = [];

        for (var i = 0; i < path.length; i++) {
            var x = path[i][0],
                y = path[i][1];

            if (typeof x !== "number" || typeof  y !== "number") {
                Debug.error('Incorrect Path!');
                result = undefined;
                break;
            }

            if (i < path.length - 1) {
                if (!result[i]) result.push([]);
                result[i].push(x);
                result[i].push(y);
            }

            if (i !== 0) {
                result[i - 1].push(x);
                result[i - 1].push(y);
                result[i - 1].push(result[i - 1][0]);
                result[i - 1].push(result[i - 1][1]);

                result[i - 1].push(x);
                result[i - 1].push(y);
            }
        }

        return result;
    };

    this.interpolate = function (path, smoothing, closed) {

        for (var i = 0; i < path.length; i++) {

            var prev = [], mid = [path[i][0], path[i][1]], next = [path[i][2], path[i][3]], pts = null;

            if (i == 0) {
                prev = mid;
            }
            else {
                prev = [path[i - 1][0], path[i - 1][1]];

            }

            pts = getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing);

            if (i == 0) {
                path[i][4] = pts[2];
                path[i][5] = pts[3];
            }
            else {
                path[i - 1][6] = pts[0];
                path[i - 1][7] = pts[1];
                path[i][4] = pts[2];
                path[i][5] = pts[3];
            }

            if (i == path.length - 1) {

                prev = [path[i][0], path[i][1]];
                mid = [path[i][2], path[i][3]];
                next = mid;

                pts = getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing);

                path[i][6] = pts[0];
                path[i][7] = pts[1];
            }

            if (closed) {
                var s1 = path[path.length - 1],
                    s2 = path[0];

                var _segment = [
                    [s1[0], s1[1], s1[2], s1[3], s1[4], s1[5], s1[6], s1[7]],
                    [s2[0], s2[1], s2[2], s2[3], s2[4], s2[5], s2[6], s2[7]]];

                this.interpolate(_segment, smoothing);

                path[0][4] = _segment[1][4];
                path[0][5] = _segment[1][5];
                path[path.length - 1][6] = _segment[0][6];
                path[path.length - 1][7] = _segment[0][7];
            }

        }
    };

    this.checkSimplePath = function (path) {
        if (typeof path !== "object" || path.constructor !== Array) return false;

        var deepcheck = true;

        for (var i = 0; i < path.length; i++) {
            if (
                typeof path[i] !== "object" || path[i].constructor !== Array || path[i].length !== 2 ||
                typeof path[i][0] !== "number" || typeof  path[i][1] !== "number"
            ) {
                deepcheck = false;
                break;
            }
        }

        return deepcheck;
    };

    this.comparePaths = function (path1, path2) {
        var result = true;

        if (path1.length !== path2.length) {
            return false;
        }

        for (var i = 0; i < path1.length; i++) {
            for (var n = 0; n < path1[i].length; n++) {
                if (path1[i][n] !== path2[i][n]) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }


}]);
/**
 * Created by Viktor Khodosevich on 4/10/2017.
 */
$R.part('Resource', ['@extend', 'Debug', function Audio (extend, Debug) {
    extend(this,'$ResourceClass');


    this.type = 'Audio';


    var resolveEventFunc = null, stateFunc = null, url = null, response = null;

    this.on('init', function (_url, resolveFunc, setStateFunc) {
        resolveEventFunc = resolveFunc;
        stateFunc = setStateFunc;
        url = _url;
        createAudio();
    });

    function createAudio() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            stateFunc(1);
            response = this.response;
            resolveEventFunc('load',[response]);
        };
        xhr.onerror = function () {
            stateFunc(-2);
            resolveEventFunc('error', []);
            Debug.error({url: url}, 'Unable to load audio [{url}].');
        };
        xhr.send();

    }
    this.export = function () {
        return response;
    }
}]);
/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.part('Resource', ['@extend', 'Debug', '$$config', '@HTMLRoot', function Font(extend, Debug, config, html) {

    extend(this, '$ResourceClass');

    this.type = 'Font';
    var state = null, resolve = null, font = null,
        root = config.dir && typeof config.dir === "string" ? config.dir : './fonts',
        format = $R.fontFormats(),
        weight = null,
        style = null,
        response = null,
        fontLoaderElement = document.createElement('div');

    fontLoaderElement.style.fontFamily = 'sans-serif';
    fontLoaderElement.style.fontSize = '12px';
    fontLoaderElement.style.lineHeight = '12px';
    fontLoaderElement.style.position = 'absolute';
    fontLoaderElement.style.left = '-9999px';
    fontLoaderElement.style.top = '-9999px';
    fontLoaderElement.innerText = 'abcdefghijklmnopqrstuvwxyz 1234567890[!?,.<>"£$%^&*()~@#-=]';

    this.on('init', function (url, r, s) {
        resolve = r;
        state = s;
        font = url[0];
        weight = url[1];
        style = url[2];
        fontLoaderElement.style.fontStyle = style;
        html.element().appendChild(fontLoaderElement);
        getFont();
    });

    function getFont() {
        $R.font(root, font, weight, style);

        var checkInterval = null,
            repeatUntillError = 1000,
            repeatCount = 0,
            initial = [fontLoaderElement.offsetWidth, fontLoaderElement.offsetHeight];

        fontLoaderElement.style.fontFamily = '"' + font + '-' + weight + '", sans-serif';
        checkInterval = setInterval(function () {
            if (fontLoaderElement.offsetWidth !== initial[0] || fontLoaderElement.offsetHeight !== initial[1]) {
                html.element().removeChild(fontLoaderElement);
                clearInterval(checkInterval);
                state(1);
                resolve('load', []);
            }
            repeatCount++;
            if (repeatCount > repeatUntillError) {
                state(-2);
                resolve('error', []);
                Debug.warn({font: font + '-' + weight}, 'Unable to load font [{font}]. Font pending timed out...');
                html.element().removeChild(fontLoaderElement);
                clearInterval(checkInterval);
            }
        }, 50);
    }

    this.export = function () {
        return font;
    };
}]);
/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.part('Resource', ['@extend', 'Debug', function Image(extend, Debug) {

    extend(this, '$ResourceClass');

    var url = null, resolveEventFunc = null, stateFunc = null, image = null, width = 0, height = 0;

    this.type = 'Image';

    this.on('init', function (_url, resolveFunc, setStateFunc) {
        resolveEventFunc = resolveFunc;
        stateFunc = setStateFunc;
        url = _url;
        CreateImage();
    });

    function CreateImage() {
        image = document.createElement('img');
        image.addEventListener('load', function () {
            stateFunc(1);

            width = image.width;
            height = image.height;

            resolveEventFunc('load', []);
        });
        image.addEventListener('error', function () {
            stateFunc(-2);
            resolveEventFunc('error', []);
            Debug.error({url: url}, 'Unable to load image [{url}].');
        });

        image.setAttribute('src', url);
    }

    this.width = function () {
        return width;
    };

    this.height = function () {
        return height;
    };

    this.export = function () {
        return image;
    };

}]);
/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.part('Resource', ['@extend', 'Debug', function ResourceClass(extend, Debug) {

    var url = null,
        self = this,
        resolveFunctionPassed = false,
        status = -1; // -1 init, 0 loading, 1 loaded, -2 error

    this.loaded = function () {
        return status == 1;
    };

    this.error = function () {
        return status == -2;
    };

    this.loading = function () {
        return status == 0;
    };

    this.url = function (_url) {
        if (_url == undefined) {
            return url;
        }
        else {
            if (url == undefined) {
                url = _url;
                status = 0;
                if (resolveFunctionPassed) {
                    ResolveEvent('init', [url]);
                }
                else {
                    ResolveEvent('init', [url, ResolveEvent, setStatus]);
                    resolveFunctionPassed = true;
                }
            }

        }
        return url;
    };

    var cbContainer = {
        init: [],
        load: [],
        error: [],
        loading: []
    };

    function setStatus(val) {
        if (typeof val !== "number") {
            Debug.error({val: val}, '[{val}] is not valid value for status');
            return;
        }
        if (val > 1 || val < -2) {
            Debug.error({val: val}, '[{val}] no such status possible!');
            return;
        }
        status = val;
    }

    function ResolveEvent(event, data) {
        if (cbContainer[event]) {
            data = typeof data == "object" && data.constructor == Array ? data : [];

            for (var i = 0; i < cbContainer[event].length; i++) {
                cbContainer[event][i].apply(self, data);
            }
        }
        else {
            Debug.warn({e: event}, 'Unable to set event {e}. No such event!');
        }
    }

    this.on = function (event, func) {
        var array = cbContainer[event],
            func = typeof func == "function" ? func : false;

        if (event == 'load' && status == 1) {
            func.call(this);
        }
        if (event == 'error' && status == -2) {
            func.call(this);
        }

        if (!array || !func) {
            Debug.warn({e: event}, 'Unable to set handler for event [{e}].');
            return;
        }

        cbContainer[event].push(func);
    };

}]);
/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.part('Resource', ['@extend', 'Debug', function Sprite(extend, Debug) {

    extend(this, '$ResourceClass');

    var url = null, image = null, size = 0, frames = 0, duration = 0, width = 0, height = 0,
        frameHeight = 0, frameWidth = 0, fps = 12,
        setStausFunc = null, resolveEventFunc = null, ready = false,
        matrix = [];

    this.type = 'Sprite';

    this.on('init', function (u, eventF, statusF) {
        setStausFunc = statusF;
        resolveEventFunc = eventF;
        url = u;

        image = document.createElement('img');
        image.addEventListener('load', function () {
            setStausFunc(1);

            width = image.width;
            height = image.height;

            if (ready) {
                CreateCanvasArray();
                SetCanvasSize();
            }
            resolveEventFunc('load', []);
        });
        image.addEventListener('error', function () {
            setStausFunc(-2);
            resolveEventFunc('error', []);
        });
        image.setAttribute('src', url);
    });

    function CreateCanvasArray() {

        var elems = 0;
        for (var r = 0; r < size; r++) {
            matrix.push([]);
            for (var c = 0; c < size; c++) {
                elems++;
                if (elems < frames) {
                    matrix[r].push(document.createElement('canvas'));
                }
            }
        }
    }

    function SetCanvasSize() {
        frameHeight = Math.round(height / size);
        frameWidth = Math.round(width / size);

        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (matrix[r][c]) {
                    matrix[r][c].setAttribute('width', frameWidth);
                    matrix[r][c].setAttribute('height', frameHeight);
                    var _ctx = matrix[r][c].getContext('2d');
                    _ctx.translate(-frameWidth * c, -frameHeight * r);
                    _ctx.drawImage(image, 0, 0);
                }
            }
        }

    }

    this.ready = function () {
        return ready;
    };

    this.width = function () {
        return frameWidth;
    };
    this.height = function () {
        return frameHeight;
    };

    this.spriteWidth = function () {
        return width;
    };

    this.spriteHeight = function () {
        return height;
    };

    this.fps = function (number) {
        if (typeof number !== "number" || number <= 0) {
            Debug.warn({n: number}, '[{n}] is not a correct fps number');
            return false;
        }
        fps = number;

        duration = Math.round((frames / fps) * 1000);

    };

    var pause = false;

    this.pause = function () {
        pause = true;
    };

    this.play = function () {
        pause = false;
    };

    this.config = function (f) {
        if(ready) return;

        if (typeof f !== "number" || f <= 0) {
            Debug.warn({rows: f}, '[{rows}] is not a valid frames number');
            return;
        }

        size = Math.ceil(Math.sqrt(f));

        frames = f;

        duration = Math.round((frames / fps) * 1000);

        ready = true;

        CreateCanvasArray();
    };

    this.frames = function () {
        return frames;
    };

    var currentX = 0, currentY = 0;

    var _time = new Date().getTime();

    this.tick = function (time) {

        if(pause) return;
        
        var progress = (time - _time) / duration;

        if (progress > 1) {
            progress = 1;
            _time = new Date().getTime();
        }

        if (progress < 0) {
            progress = 0;
        }

        var frame = Math.floor((frames - 1) * progress);

        currentY = Math.floor(frame / size);
        currentX = frame - currentY * size;
    };

    this.export = function () {
        if (matrix[currentY][currentX]) {
            return matrix[currentY][currentX];
        }
    }
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', ['@inject', 'Debug', function AnimationProvider(inject, Debug) {

    var animations = [],
        animated = false,
        morphs = {};

    this.morph = function (name, ordering, setter, applier) {
        var morph = inject('$Morph');
        morph.config(name, this, ordering, setter, applier);
        if (morph.valid()) {
            morphs[name] = morph;
        }
    };

    this.extractMorph = function (name) {
        return morphs[name];
    };

    function findCompetitor(properties, animation) {
        animation.$$SELF = true;

        var competitor = null;

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].$$SELF) {
                if (animations[i].active() && !animations[i].done()) {
                    var check = false;
                    for (var n = 0; n < properties.length; n++) {
                        if (animations[i].hasProperty(properties[n])) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        if (!competitor) competitor = [];
                        competitor.push(animations[i]);
                    }
                }
            }
        }

        delete animation.$$SELF;

        return competitor;
    }

    function CheckAnimationQueue() {
        var _animations = [];

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].active()) {
                var props = animations[i].properties();
                if (animations[i].queue()) {
                    if (!findCompetitor(props, animations[i])) {
                        animations[i].start();
                    }
                }
                else {
                    var competitors = findCompetitor(props, animations[i]);
                    if(competitors) {
                        for (var n = 0; n < competitors.length; n++) {
                            for (var p = 0; p < props.length; p++) {
                                competitors[n].stop(props[p]);
                            }
                        }
                    }
                    animations[i].start();
                }
                _animations.push(animations[i]);
            }
            else {
                if (!animations[i].done()) {
                    _animations.push(animations[i]);
                }
            }
        }

        animations = _animations;
    }


    function CreateAnimationType1(property, value, duration, easing) {
        var pair = {};

        pair[property] = value;

        if (morphs[property]) {
            var stack = [
                    {
                        ordering: morphs[property].ordering(),
                        morph: morphs[property],
                        value: value
                    }
                ],
                config = {};

            if (duration && typeof duration == "number") config.duration = duration;
            if (easing && typeof easing == "string") config.easing = easing;


            var animation = inject('$Animation');

            animation.config(this, stack, config, CheckAnimationQueue);
            animations.push(animation);
        }

    }

    function CreateAnimationType2(pairs,arg2,arg3) {
        var config = {};

        if(typeof arg2 == "object") {
            config = arg2;
        }
        else if(typeof arg2 == "number") {
            config = {
                duration : arg2
            };
            if(typeof arg3 == "string") {
                config.easing = arg3
            }
        }
        else if(typeof arg2 == "string") {
            config = {
                easing : arg2
            };
        }

        var result = {};

        for (var property in pairs) {
            if (!pairs.hasOwnProperty(property)) continue;
            if (!morphs[property]) {
                Debug.warn({
                    type: this.type(),
                    property: property
                }, 'Property {property} of {type} can not be animated!');
            }
            else {
                result[property] = {
                    ordering: morphs[property].ordering(),
                    morph: morphs[property],
                    value: pairs[property]
                }
            }
        }

        var morph_stack = [];

        for (var item in result) {
            morph_stack.push(result[item]);
        }

        if (morph_stack.length) {
            morph_stack.sort(function (a, b) {
                return a.ordering - b.ordering;
            });

            var animation = inject('$Animation');
            animation.config(this, morph_stack, config, CheckAnimationQueue);
            animations.push(animation);
        }
        else {
            Debug.warn('No properties to animate!');
        }
    }

    this.animate = function (arg1, arg2, arg3, arg4) {
        if (typeof arg1 == 'string' && arg2) {
            CreateAnimationType1.apply(this, arguments);
        }
        else if (typeof arg1 == "object" && arg1.constructor !== Array) {
            CreateAnimationType2.apply(this, arguments);
        }
        else {
            Debug.warn('Unable to create animation. Wrong arguments');
        }
        CheckAnimationQueue();
    };

    this.animated = function () {
        return animated;
    };

    this.stop = function (property) {
        if(typeof property !== "string" || property.length == 0) return;
        for (var i = 0; i < animations.length; i++) {
            animations[i].stop(property);
        }
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/23/2017.
 */
$R.part('Sound', ['@inject', 'Debug', function Audio(inject, Debug) {

    var source = null,
        url = null,
        type = null,
        events = inject('$EventProvider'),
        animations = inject('$AnimationProvider'),
        self = this,
        output = null,
        nodename = '';

    events.wrap(this);

    function eventArgs() {
        return [self, output, url, type];
    }

    events.event('ready', eventArgs, true);
    events.event('load', eventArgs, true);
    events.event('error', eventArgs, true);
    events.event('play', eventArgs, false);
    events.event('connect', eventArgs, false);
    events.event('disconnect', eventArgs, false);
    events.event('end', eventArgs, false);

    function createAnimationMorph(filter, property) {
        animations.morph.apply(this, [property.name, 0,
            function (start, end, value) {
                value = property.normalizer(value);
                if (value !== undefined) {
                    end(value);
                    start(filter.get(property.name));
                }
            },
            function (value) {
                value = property.normalizer(value);
                return filter.set(property.name, value);
            }
        ]);
    }

    this.build = function (name, src) {
        if (typeof name == "string" && name.length > 0) {
            if (typeof src == "string" && src !== 'destination' && src.length > 0) {
                url = src;
                source = inject('$UserAudioSource').build(src);
                type = 'Sample';
                source.on('load', function () {
                    events.resolve('load');
                });

                this.play = function () {
                    source.play();
                    return this;
                };

                this.terminate = function () {
                    source.stop();
                    return this;
                }
            }
            else if (src === 'destination') {
                source = inject('$UserAudioMixer').build(name, src);
                this.connect = function () {
                    if (arguments[0] && typeof arguments[0] == "object" && arguments[0].$$SOURCE) {
                        return source;
                    }
                    return this;
                };

                url = '[' + name + ']' + 'AudioChannel';
                type = 'Channel';
                events.resolve('load');
            }
            else if (src === undefined) {
                source = inject('$UserAudioMixer').build(name);
                url = '[' + name + ']' + 'AudioChannel';
                type = 'Channel';
                events.resolve('load');
            }

            source.on('error', function () {
                events.resolve('error');
            });

            source.on('play', function () {
                events.resolve('play');
            });

            source.on('end', function () {
                events.resolve('end');
            });

            source.on('connect', function () {
                events.resolve('connect');
            });

            source.on('disconnect', function () {
                events.resolve('disconnect');
            });

            var filters = source.filters();

            for (var i = 0; i < filters.length; i++) {
                var props = filters[i].props();
                for (var m = 0; m < props.length; m++) {
                    if (props[m].animated) {
                        createAnimationMorph.apply(this, [filters[i], props[m]]);
                    }
                }
            }

            nodename = name;

            events.resolve('ready');

        }
        else {
            Debug.warn('Audio mixer have no name! Should be a string');
        }

        return this;
    };

    this.filter = function (name, value) {
        if (typeof name == "string" && name.length > 0) {
            var filter = null,
                filters = source.filters();

            for (var i = 0; i < filters.length; i++) {
                if (filters[i].has(name)) {
                    filter = filters[i];
                }
            }

            if (filter) {
                if (value !== undefined) {
                    filter.set(name, value);
                }
                else {
                    return filter.get(name);
                }
            }
            else {
                Debug.warn({name: name}, 'Unable to set filter property [{name}]. No filter with that param!');
            }
        }
        return this;
    };

    this.connect = function (out) {
        if (out && typeof out == "object" && out.$$SOURCE) {
            return source;
        }

        if (typeof out == "object" && out.type && typeof out.type == "function") {
            var ctype = out.type();
            if (type == 'Channel' && ctype == 'Sample') {
                Debug.error('Trying to connect Channel with Sample!');
                return this;
            }
            else if (out.connect && typeof out.connect == "function") {
                var outsource = out.connect({$$SOURCE: true});
                output = out;
                source.connect(outsource);
                return out;
            }
            else {
                Debug.error('Unknown type of  object passed as output!');
            }
        }
        else {
            Debug.error('Unknown type of  object passed as output!');
        }

        return this;
    };

    this.output = function () {
        return output;
    };

    this.animate = function () {
        animations.animate.apply(this, arguments);
        return this;
    };

    this.type = function (str) {
        if (typeof str == "string") {
            return str === type;
        }
        return type;
    };

    this.url = function () {
        return url;
    };

    this.name = function () {
        return nodename;
    };

    this.stop = function () {
        animations.stop.apply(this, arguments);
        return this;
    };
}]);
/**
 * Created by Viktor Khodosevich on 4/21/2017.
 */
$R.part('Sound', ['@inject', '$$config', 'Debug', function UserAudioMixer(inject, config, Debug) {

    var events = inject('$EventProvider'),
        filters = [],
        output = null,
        name = '';


    events.wrap(this);

    function argF() {
        return [this];
    }

    events.event('play', argF, false);
    events.event('connect', argF, false);
    events.event('ready', argF, true);
    events.event('error', argF, true);

    this.build = function (n, channel) {

        var fcfg = config.filters &&
        typeof config.filters == "object"
        && config.filters.constructor == Array
        && config.filters.length > 0 ? config.filters : ['Delay', 'Gain'];

        for (var i = 0; i < fcfg.length; i++) {
            var node = inject('$' + fcfg[i] + 'Node');
            if (filters[filters.length - 1]) {
                filters[filters.length - 1].connect(node);
            }
            filters.push(node);
        }

        if (typeof n == "string" && n.length > 0) {
            name = n;
        }
        else {
            Debug.warn({n: n}, '[{n}] is not a valid name for channel');
            events.resolve('error');
        }

        if (channel && typeof channel == "object" && channel.connect && typeof channel.connect == "function") {
            this.connect(channel);
        }
        else if (channel === 'destination') {
            var destination = inject('$DestinationNode');
            filters[filters.length - 1].connect(destination);

            this.connect = function (out) {
                if (out.$$AUDIONODE) {
                    return filters[0];
                }
            }
        }


        delete  this.build;
        return this;
    };

    this.connect = function (out) {
        if (out.$$AUDIONODE) {
            return filters[0];
        }
        else {
            var input = out.connect({$$AUDIONODE: true});
            filters[filters.length - 1].connect(input);
            output = out;
        }

        return this;
    };

    this.output = function () {
        return output;
    };

    this.filters = function () {
        return filters;
    };

    this.name = function () {
        return name;
    }

}]);
/**
 * Created by Viktor Khodosevich on 4/19/2017.
 */
$R.part('Sound', ['@extend', '@inject', 'Debug', function UserAudioSource(extend, inject, Debug) {

    var node = inject('$AudioSource'),
        events = inject('$EventProvider'),
        mixer = null,
        output = null,
        url = '';

    function cbArgs() {
        return [this];
    }

    function connectCbArgs() {
        return [this, output];
    }

    events.wrap(this);

    events.event('ready', cbArgs, true);
    events.event('load', cbArgs, true);
    events.event('error', cbArgs, true);
    events.event('connect', connectCbArgs, false);
    events.event('play', cbArgs, false);
    events.event('stop', cbArgs, false);

    node.on('ready', function () {
        events.resolve('ready');
    });

    node.on('load', function () {
        events.resolve('load');
    });

    node.on('error', function () {
        events.resolve('error');
    });

    this.build = function (src) {

        if (typeof src == "string" && src.length > 0) {
            url = src;
            node.build(src);
            mixer = inject('$UserAudioMixer').build('source-built-in-filter');
            mixer.on('connect', function () {
                events.resolve('connect');
            });
            node.connect(mixer.connect({$$AUDIONODE: true}));
            delete this.build;
            events.resolve('ready');
        }
        else {
            delete  this.build;
            events.resolve('error');
        }


        return this;
    };

    this.filters = function () {
        if(mixer) {
            return mixer.filters();
        }
        return [];
    };


    this.play = function () {
        if (!this.status('error')) {
            if (this.status('ready')) {
                if (this.status('load')) {
                    node.play();
                }
                else {
                    this.on('load', function () {
                        node.play();
                    });
                }
            }
        }

        return this;
    };

    this.stop = function () {
        node.stop();
        return this;
    };

    this.output = function () {
        return output;
    };

    this.connect = function (out) {
        if (out && out.constructor === mixer.constructor) {
            output = out;
            mixer.connect(out);
        }
        return this;
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function DelayNode(audio, extend) {

    extend(this, '$AudioNode');

    var timeCFG = 0, forceCFG = 0, killDelay = 10000,
        globalGain = audio.context().createGain(),
        delay = audio.context().createDelay(),
        feedback = audio.context().createGain(),
        bq = audio.context().createBiquadFilter();

    globalGain.gain.value = 1;
    bq.frequency.value = 2000;
    feedback.gain.value = forceCFG;
    delay.delayTime.value = timeCFG;

    delay.connect(feedback);
    feedback.connect(bq);
    bq.connect(delay);
    feedback.connect(globalGain);

    this.build('delay', [globalGain, feedback], globalGain);

    this.property('delay', [0, 0],
        function (value) {
            if (typeof value == "object" && value.constructor === Array &&
                value.length == 2 && typeof value[0] == "number" && typeof value[1] == "number") {
                var time = value[0],
                    force = value[1];

                if (time > 1) time = 1;
                if (time < 0) time = 0;
                if (force > .8) force = .8;
                if (force < 0) force = 0;
                timeCFG = time;
                forceCFG = force;
                delay.delayTime.value = timeCFG;
                feedback.gain.value = forceCFG;
                return [force, time];
            }
        },
        function (value) {
            return [value[0], value[1]];
        },
        function (value) {
            var time = value[0],
                force = value[1];

            if (time > 1) time = 1;
            if (time < 0) time = 0;
            if (force > .8) force = .8;
            if (force < 0) force = 0;

            return [force, time];
        }
    );
}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function DestinationNode(audio, extend) {

    extend(this, '$AudioNode');

    this.build('destination', audio.context().destination, false);

}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function GainNode(audio, extend) {

    extend(this, '$AudioNode');

    var volume = 1,
        gain = audio.context().createGain();

    gain.gain.value = volume;

    this.build('gain', gain, gain);

    this.property('volume', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                volume = value;
                gain.gain.value = volume;
                return value;
            }
        },
        function (value) {
            return value;
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            return value;
        }
    );

}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@extend', function LowpassNode(audio, extend) {

    extend(this, '$AudioNode');

    var bqf  = audio.context().createBiquadFilter(),

        frequency = 22050;

    bqf.type = 'lowpass';
    bqf.frequency.value = frequency;

    this.build('lowpass', bqf, bqf);

    this.property('lowpass', 22050,
        function (value) {
            if (value < 0) value = 0;
            if (value > 22050) value = 22050;
            frequency = value;
            bqf.frequency.value = value;
            return value;
        },
        function (value) {
            return value;
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 22050) value = 22050;
            return value;
        }
    );
}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@inject', 'Debug', function AudioNode(inject, Debug) {

    var output = null,
        input = null,
        nextNode = null,
        buildF = function (sound, output) {
            if(!output) {
                var input = this.input();
                for(var i = 0; i < input.length; i++) {
                    sound.connect(input[i]);
                }
            }
            return this.output();
        },
        sounds = [],
        events = inject('$EventProvider'),
        nodename = '';

    function args() {
        return [nextNode];
    }

    events.wrap(this);

    events.event('ready', args, true);
    events.event('play', args, false);
    events.event('end', args, false);
    events.event('connect', args, false);
    events.event('disconnect', args, false);
    events.event('property', args, false);

    this.disconnect = function () {
        if (nextNode && output) {
            var _inpArray = nextNode.input();
            for(var i = 0 ; i < output.length; i++) {
                for(var n = 0; n <_inpArray.length; n++) {
                    output[i].disconnect(_inpArray[n]);
                }
            }
            nextNode = null;
            events.resolve('disconnect');
        }
        return this;
    };

    this.connect = function (out) {
        this.disconnect();
        nextNode = out;
        if (nextNode && output) {
            var _inpArr = nextNode.input();
            for(var i = 0 ; i < output.length; i++) {
                for(var n = 0 ; n < _inpArr.length; n++) {
                    output[i].connect(_inpArr[i]);
                }
            }
        }
        events.resolve('connect');
        return this;
    };

    this.build = function (name, inp, out, f) {
        input = typeof inp == "object" && inp.constructor === Array ? inp : [inp];
        output = typeof out == "object" && out.constructor === Array ? out : [out];
        nodename = name;
        if (typeof f == "function") buildF = f;
        delete this.build;
        events.resolve('ready');
        return this;
    };

    this.input = function () {
        return input;
    };

    this.output = function () {
        return output;
    };

    this.name = function () {
        return nodename;
    };

    this.play = function (sound, output) {
        sounds.push(sound);
        sound.addEventListener('ended', function () {
            var result = [];
            sound.$$SEARCH = true;
            for (var i = 0; i < sounds.length; i++) {
                if (!sounds.$$SEARCH) {
                    result.push(sounds[i]);
                }
            }
            delete sound.$$SEARCH;
            sounds = result;
        });

        if (nextNode) {
            nextNode.play(sound, buildF.apply(this, arguments));
        }

    };

    var model = {};

    this.property = function (name, defVal, setter, getter, normlizer) {
        if (typeof name == "string") {
            var property = {
                name: name,
                value: null,
                getter: null,
                setter: null,
                normalizer : normlizer,
                animated : typeof normlizer == "function" ? true : false
            };

            if (typeof getter === "function") {
                property.getter = getter;
            }
            if (typeof setter === "function") {
                property.setter = setter;
            }

            property.value = defVal;

            if (defVal && typeof property.getter && property.setter) {
                if (!model[property.name]) {
                    model[property.name] = property;
                }
                else {
                    Debug.warn({property: property}, 'Duplicated property [{property}]');
                }
            }
        }
        else {
            Debug.warn({name: name}, 'Property name [{name}] is not valid!');
        }
    };

    this.set = function (name, value) {
        if (typeof name == "string" && name.length > 0) {
            var result = model[name].setter(value);
            if (result !== undefined) {
                model[name].value = result;
            }
            else {
                Debug.warn({prop: name, val: value}, '[{val}] is not a valid valuen for [{prop}].');
            }
        }
    };

    this.get = function (name) {
        if (typeof name == "string" && name.length > 0) {
            if (model[name]) {
                return model[name].value;
            }
            else {
                Debug.warn({name: name}, 'Object has no property [{name}]. Unable to get value.');
            }
        }
        else {
            Debug.warn('Property name has to be a string');
        }
    };

    this.props = function () {
        var result = [];

        for (var prop in model) {
            if (model.hasOwnProperty(prop)) {
                result.push(model[prop]);
            }
        }

        return result;
    };

    this.has = function (name) {
        return !!model[name];
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/22/2017.
 */
$R.part('Sound', function AudioNodeSoundDispatcher() {

    var sounds = [];

    this.register = function (sound) {
        sound.addEventListener('end', function () {
            sound.$$SEARCH = true;

            var result = [];

            for(var i = 0; i < sounds.length; i++) {
                if(!sounds[i].$$SEARCH) {
                    result.push(sounds[i]);
                }
            }
            sounds = result;
        });

        sounds.push(sound);
    };
    
    this.reconnect = function (destination) {
        for(var i = 0 ; i < sounds.length; i++) {
            sounds[i].disconnect();
            sounds[i].connect(destination);
        }
    };
});
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@audio', '@inject', 'Resource', 'Debug', function AudioSource(audio, inject, Resource, Debug) {

    var url = null,
        resource = null,
        buffer = null,
        output = null,
        events = inject('$EventProvider'),
        self = this,
        sounds = [];

    function args() {
        return [resource, buffer, output];
    }

    events.wrap(this);

    events.event('ready', args, true);
    events.event('load', args, true);
    events.event('error', args, true);
    events.event('connect', args, false);
    events.event('disconnect', args, false);
    events.event('play', false);
    events.event('end', false);

    this.build = function (src) {
        resource = Resource.audio(src);

        resource.on('load', function (response) {
            audio.context().decodeAudioData(
                response,
                function (result) {
                    buffer = result;
                    events.resolve('load');
                },
                function () {
                    Debug.error({src: src}, '[{src}] audio buffer can not be decoded.');
                    events.resolve('error');
                }
            )
        });

        resource.on('error', function () {
            Debug.error({src: src}, 'Unable to load audio file');
            events.resolve(error)
        });
        delete this.build;

        return this;
    };

    this.disconnect = function () {
        if (output) {
            output = null;
            events.resolve('disconnect');
        }
        return this;
    };

    this.connect = function (out) {
        this.disconnect();
        output = out;
        events.resolve('connect');
        return this;
    };

    this.play = function () {
        if (output && this.status('load')) {
            var source = audio.context().createBufferSource();
            source.buffer = buffer;
            sounds.push(source);
            output.play(source, false);
            source.start(0);
        }
        return this;
    };

    this.stop = function () {
        for (var i = 0; i < sounds.length; i++) {
            sounds[i].stop(0);
        }
        sounds = [];
        return this;
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['Debug', function Event(Debug) {

    var cb = [],
        state = false,
        name = 'default',
        stateval = false,
        self = this,
        argFunct = function () {
            return [];
        };

    this.build = function (eventName, argF, isStateEvent) {
        state = !!isStateEvent;

        if (typeof argF == "function") {
            argFunct = argF;
        }

        if (typeof eventName == "string" && eventName.length > 0) {
            name = eventName
        }

        delete this.build;
        return this;
    };

    this.name = function () {
        return name;
    };

    this.active = function () {
        return stateval;
    };

    this.resolve = function () {
        if (state) stateval = true;

        var args = argFunct();
        if(typeof args !== "object" || args.constructor !== Array) args = [];

        else {
            for (var i = 0; i < cb.length; i++) {
                cb[i].apply(this, args);
            }
        }
        return this;
    };

    this.callback = function (func) {
        if (typeof func !== "function") return this;
        if(self.active()) {
            var args = argFunct();
            if(typeof args !== "object" || args.constructor !== Array) args = [];
            func.apply(this, args);
            cb.push(arguments[0]);
            return this;
        }
        cb.push(func);
        return this;
    };

}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@inject', function EventProvider(inject) {

    var events = [];

    this.event = function (name, argF, state) {
        var event = inject('$Event');
        event.build.apply(event, arguments);
        events[name] = event;
        return this;
    };

    this.resolve = function (name) {
        if (events[name]) events[name].resolve.call(events[name]);
        return this;
    };

    this.wrap = function (object) {
        object.on = function (name, func) {
            if (events[name]) {
                events[name].callback.call(object, func);
            }
        };

        object.status = function (name) {
            if (events[name]) return events[name].active();
            return false;
        };
        return this;
    };

}]);
/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.part('State' , function Property () {

    var value = null, callbacks = [];


    this.set = function (val) {
        for (var i = 0 ; i < callbacks.length; i++) {
            callbacks[i](val,value);
        }
        value = val;
    };

    this.onset = function (func) {
        if(typeof  func !== 'function') return;
        callbacks.push(func);
    }

});
/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.part('State' , ['@inject', function State (inject) {


    var callbacks = {}, props = {};


    function GetPropertyCallback(name) {
        return function (n,o) {
            if(!callbacks[name]) return;
            for(var i = 0 ; i < callbacks.length; i++) {
                callbacks[name][i](n,o);
            }
        }
    }


    this.define = function (name,val) {
        if(props[name]) {
            props[name].set(val);
            return;
        }

        props[name] = inject('$Property');
        props[name].onset(GetPropertyCallback(name));
        props[name].set(val);

    };

    this.watch = function (property,func) {
        if(typeof property !== "string" || typeof func !== "function") return;

        if(!callbacks[property]) callbacks[property] = [];

        if(!props[property]) this.def(property,null);

        callbacks[property].push(func);
    };

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', ['@inject', 'Debug', function AnimationObjectExtension(inject, Debug) {

    var animations = [],
        animated = false,
        morphs = {};

    this.morph = function (name, ordering, setter, applier) {
        var morph = inject('$Morph');
        morph.config(name, this.object(), ordering, setter, applier);
        if (morph.valid()) {
            morphs[name] = morph;
        }
    };

    this.extractMorph = function (name) {
        return morphs[name];
    };

    function findCompetitor(properties, animation) {
        animation.$$SELF = true;

        var competitor = null;

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].$$SELF) {
                if (animations[i].active() && !animations[i].done()) {
                    var check = false;
                    for (var n = 0; n < properties.length; n++) {
                        if (animations[i].hasProperty(properties[n])) {
                            check = true;
                            break;
                        }
                    }
                    if (check) {
                        if (!competitor) competitor = [];
                        competitor.push(animations[i]);
                    }
                }
            }
        }

        delete animation.$$SELF;

        return competitor;
    }

    function CheckAnimationQueue() {
        var _animations = [];

        for (var i = 0; i < animations.length; i++) {
            if (!animations[i].active()) {
                var props = animations[i].properties();
                if (animations[i].queue()) {
                    if (!findCompetitor(props, animations[i])) {
                        animations[i].start();
                    }
                }
                else {
                    var competitors = findCompetitor(props, animations[i]);
                    if(competitors) {
                        for (var n = 0; n < competitors.length; n++) {
                            for (var p = 0; p < props.length; p++) {
                                competitors[n].stop(props[p]);
                            }
                        }
                    }
                    animations[i].start();
                }
                _animations.push(animations[i]);
            }
            else {
                if (!animations[i].done()) {
                    _animations.push(animations[i]);
                }
            }
        }

        animations = _animations;
    }


    function CreateAnimationType1(property, value, duration, easing) {
        var style = this.extension('Style');

        var pair = {};

        pair[property] = value;

        if (morphs[property]) {
            var stack = [
                    {
                        ordering: style.ordering(property),
                        morph: morphs[property],
                        value: value
                    }
                ],
                config = {};

            if (duration && typeof duration == "number") config.duration = duration;
            if (easing && typeof easing == "string") config.easing = easing;


            var animation = inject('$Animation');

            animation.config(this, stack, config, CheckAnimationQueue);
            animations.push(animation);
        }

    }

    function CreateAnimationType2(pairs,arg2,arg3) {
        var style = this.extension('Style'),
            config = {};

        if(typeof arg2 == "object") {
            config = arg2;
        }
        else if(typeof arg2 == "number") {
            config = {
                duration : arg2
            };
            if(typeof arg3 == "string") {
                config.easing = arg3
            }
        }
        else if(typeof arg2 == "string") {
            config = {
                easing : arg2
            };
        }

        var result = {};

        for (var property in pairs) {
            if (!pairs.hasOwnProperty(property)) continue;
            if (!morphs[property]) {
                Debug.warn({
                    type: this.type(),
                    property: property
                }, 'Property {property} of {type} can not be animated!');
                continue;
            }
            else {
                result[property] = {
                    ordering: style.ordering(property),
                    morph: morphs[property],
                    value: pairs[property]
                }
            }
        }

        var morph_stack = [];

        for (var item in result) {
            morph_stack.push(result[item]);
        }

        morph_stack.sort(function (a, b) {
            return a.ordering - b.ordering;
        });

        if (morph_stack.length) {
            var animation = inject('$Animation');
            animation.config(this, morph_stack, config, CheckAnimationQueue);
            animations.push(animation);
        }
        else {
            Debug.warn('No properties to animate!');
        }
    }

    this.register('animate', function (arg1, arg2, arg3, arg4) {
        if (typeof arg1 == 'string' && arg2) {
            CreateAnimationType1.apply(this, arguments);
        }
        else if (typeof arg1 == "object" && arg1.constructor !== Array) {
            CreateAnimationType2.apply(this, arguments);
        }
        else {
            Debug.warn('Unable to create animation. Wrong arguments');
        }
        CheckAnimationQueue();
    });

    this.register('animated', function () {
        return animated;
    });

    this.register('stop', function (property) {
        for (var i = 0; i < animations.length; i++) {
            animations[i].stop(property);
        }
    });

}]);
/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects', ['Debug', '@inject', function BoxObjectExtension(Debug, inject) {

    var f = null, box = inject('$GraphicsBox');

    this.f = function (func) {

        if (typeof func !== "function") {
            Debug.error('Box Extension / Box function is not a function!');
            return;
        }
        f = func;

        delete this.f;
    };

    var object = this.object();

    function BoxWrapperFunc() {
        if (!f || !object) return;
        f.call(object, box);
        return box;
    }

    this.box = function () {
        return object.extension('Cache').value('box', BoxWrapperFunc)
    };

    this.purge = function () {
        object.extension('Cache').purge('box');
        var parent = object.parent();
        if (parent) {
            parent.extension('Box').purge();
        }
    };

    this.register('box', function () {
        return this.extension('Cache').value('box', BoxWrapperFunc).get();
    });

}]);
/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects' ,['Debug' , function CacheObjectExtension (Debug) {

    var values = {};

    this.value = function (name , func) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / name is not a string!');
            return;
        }
        if(typeof func !== "function") {
            Debug.error('Object Value Cache / func is not a function');
            return;
        }

        if(!values[name]) {
            values[name] = {
                value : func(),
                func : func,
                relevant : true
            }
        }

        return this.get(name);
    };

    this.purge = function (name) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / Can not purge cache of non string name');
            return;
        }
        if(values[name]) {
            values[name].relevant = false;
        }
    };

    this.get = function (name) {
        if(typeof name !== "string") {
            Debug.error('Object Value Cache / Can not get value of non-string name');
            return;
        }
        if(values[name]) {
            if(!values[name].relevant) {
                values[name].value = values[name].func();
                values[name].relevant = true;
            }

            return values[name].value;
        }
    }

}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', function DrawerObjectExtension(Debug) {

    var f = null, matrix = null,
        cb = {
            before: [],
            after: []
        },
        object = this.object();

    function resolve(event, args) {
        for (var i = 0; i < cb[event].length; i++) {
            cb[event].apply(object, args);
        }
    }

    this.f = function (func) {
        if (typeof func !== "function") {
            Debug.error({}, 'ObjectDrawer / func is not a function!');
            delete this.f;
            return;
        }
        f = func;
        delete this.f;
    };

    this.register('before', function (func) {
        if(typeof func == "function"){
            cb.before.push(func);
        }
        else {
            Debug.warn('Unable to set event [before Render]. func is not a Function')
        }
    });

    this.register('after', function (func) {
        if(typeof func == "function") {
            cb.after.push(func);
        }
        else {
            Debug.warn('Unable to set event [after Render]. func is not a Function')
        }
    });

    this.matrix = function () {
        return matrix;
    };

    this.draw = function () {
        resolve('before', arguments);
        if (f) f.apply(this, arguments);
        resolve('after', arguments);
    };

}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects' ,['Debug', function LayersObjectExtension(Debug) {
    var layers = {
            0 : []
        },
        layer = 0;

    this.register('layer' , function (val) {
        if(val === undefined) return layer;
        else if(typeof val !== "number" || val < 0) {
            Debug.warn({n : val}, 'Value {n} is not a number or less than 0');
            return this;
        }

        var parent = this.parent();

        if(parent) {
            var parent_layer_ext = parent.extension('Layers');
            layer = val;
            parent_layer_ext.place(val, this);
        }
        else {
            Debug.warn({}, 'You try to set layer of root group!');
        }

        return this;

    });

    this.place = function(val,object) {
        object.$$LAYERSEARCHVALUE = true;

        for(var layer in layers) {

            if(layers.hasOwnProperty(layer)) {
                var done = false;
                for(var i = 0 ; i < layers[layer].length; i++) {
                    if(layers[layer][i].$$LAYERSEARCHVALUE) {
                        layers[layer].splice(i,1);
                        done = true;
                        break;
                    }
                }
                if(done) break;
            }

        }

        delete object.$$LAYERSEARCHVALUE;

        if(!layers[val]) layers[val] = [];
        layers[val].push(object);

    };

    this.remove = function (object) {

        object.$$LAYERSEARCHVALUE = true;

        for(var layer in layers) {
            if(layers.hasOwnProperty(layer)) {
                var done = false;
                for(var i = 0 ; i < layers[layer].length; i++) {
                    if(layers[layer][i].$$LAYERSEARCHVALUE) {
                        done = true;
                        layers[layer].splice(i,1);
                        break;
                    }
                }
                if(done) break;
            }
        }
    };

    this.forEach = function (func) {
        for(var layer in layers) {
            for(var i = 0 ; i < layers[layer].length; i++) {
                func.apply(layers[layer][i],[i,layer]);
            }
        }
    };

    this.layers = function () {
        return layers;
    }

}]);
/**
 * Created by Viktor Khodosevich on 2/6/2017.
 */
$R.part('Objects', ['Debug', function MatrixObjectExtension(Debug) {

    var f = null, object = this.object();

    this.f = function (func) {
        if (typeof func == "function") {
            f = func;
            delete this.f;
        }
    };

    function MatrixWrapper() {
        return f.call(object);
    }

    this.register('matrix', function () {
        return this.extension('Cache').value('transformMatrix', MatrixWrapper);
    });

    this.purge = function () {
        object.extension('Cache').purge('transformMatrix');
        if(object.type() == 'Group') {
            var layers = object.extension('Layers');
            layers.forEach(function () {
                this.extension('Cache').purge('transformMatrix');
            });
        }
    };
}]);
/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.part('Objects', ['$MouseHelper', '$MouseEventDispatcher', '$MouseObjectFinder', '$Tree', 'Debug',
    function MouseObjectExtension(MouseHelper, Dispatcher, Finder, Tree, Debug) {

        var callbacks = {
                drag: [],
                dragstart: [],
                dragend: [],
                mousemove: [],
                mouseup: [],
                mousedown: [],
                mouseenter: [],
                mouseleave: []
            },
            disabled = false,
            mouseCheckFunction = function () {
                return false;
            };


        function GetEventArray(event) {
            return callbacks[event];
        }

        this.register('on', function (event, func) {
            if (typeof event == undefined && typeof func == undefined) {
                for (var i in callbacks) {
                    callbacks[i].$OFF = false;
                }
                return this;
            }
            if (typeof event == "string" && func == undefined) {
                var array = GetEventArray(event);

                if (array) {
                    array[i].$OFF = false;
                }

                return this;
            }
            if (typeof event == "string" && typeof func == "function") {
                var array = GetEventArray(event);
                if (array) {
                    array.push(func);
                }
                else {
                    Debug.warn({e: event}, 'There is no event [{e}]')
                }

                return this;
            }

            if (!GetEventArray(event)) {
                Debug.warn({e: event}, 'Unable to set event handler for {[e]}. No such event found!');
                return this;
            }

            if (typeof  func !== "function") {
                Debug.warn({e: event, f: func}, 'Unable to set event handler for {[e]}. {[f]} is not a function!');
                return this;
            }
            return this;
        });

        this.register('off', function (event, func) {
            if (event === undefined && func === undefined) {
                for (var i in callbacks) {
                    callbacks[i].$$OFF = true;
                }
                return this;
            }
            if (typeof event == "string" && func === undefined) {
                var array = GetEventArray(event);
                if (array) {
                    array.$$OFF = true;
                }
                return this;
            }
            if (typeof event == "string" && typeof func == "function") {
                var array = GetEventArray(event);
                func.$$MOUSEFUNCSEARCH = true;
                if (array) {
                    var index = null;
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].$$MOUSEFUNCSEARCH) {
                            index = i;
                            break;
                        }
                    }
                    if (index !== null) {
                        array.splice(index, 1);
                    }
                    return this;
                }
            }

            if (!GetEventArray(event)) {
                Debug.warn({e: event}, 'Unable to uset event handler for {[e]}. no such event');
            }
            if (typeof func !== "function") {
                Debug.warn({e: event, f: func}, 'Unable to unset function {[f]} from event {[e]}. Not a function!');
            }
            return this;
        });

        this.register('mouseCheckFunction', function (func) {
            if (typeof func == "string") {
                if (MouseHelper[func + 'CheckFunction']) {
                    mouseCheckFunction = MouseHelper[func + 'UserCheckFunction'];
                }
                return this;
            }
            if (typeof func !== "function") {
                Debug.warn({f: func}, 'Unable to set check function! {[f]} is not a function!');
                return this;
            }
            mouseCheckFunction = func;
            return this;
        });

        this.register('disable', function () {
            disabled = true;
            return this;
        });

        this.register('enable', function () {
            disabled = false;
            return this;
        });
        this.register('disabled', function () {
            return disabled;
        });

        this.check = function (target, cursor) {
            if (disabled) return false;
            return mouseCheckFunction.call(target, [cursor[0], cursor[1]]);
        };

        var cursorTransformFunction = null;

        this.cursorTransformFunction = function (func) {
            if (typeof func == "function") cursorTransformFunction = func;
        };

        this.applyCursorTransform = function (cursor) {
            if (cursorTransformFunction) {
                return cursorTransformFunction.call(this, cursor);
            }
            else {
                return cursor;
            }
        };

        this.hasEvent = function (event) {
            return callbacks[event] && callbacks[event].length && !callbacks[event].$$OFF;
        };

        this.propagate = function (target, eventObj) {
            var parent = target.parent();
            if (parent) {
                var mouse = parent.extension('Mouse');
                if (mouse.hasEvent(eventObj.type())) {
                    var type = eventObj.type(),
                        _eventObj = eventObj.originalTarget.call({$$MOUSEPROPAGATIONSETTER: parent});

                    mouse.resolve(parent, type, _eventObj);
                }
            }
        };

        this.resolve = function (target, event, eventObj) {

            if (disabled) return;

            var array = GetEventArray(event);

            if (array) {
                if (array.$OFF) return;

                for (var i = 0; i < array.length; i++) {
                    array[i].call(target, eventObj);
                }

                if (eventObj.propagate()) {
                    this.propagate(target, eventObj);
                }
            }
            else {
                Debug.warn({e: event}, 'Unable to resolve event [{e}]. No such event!');
            }
        };

        for (var i in callbacks) {
            callbacks[i].$$OFF = false;
        }

    }]);
/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects' , ['Debug', function OffsetObjectExtension( Debug) {
    var object = this.object(),
        style = null,
        cache = null;

    function ObjectOffsetFunction() {
        var position = style.get('position'),
            result = [position[0],position[1]];

        var parent = object.parent();

        if(parent) {
            var parent_offset = parent.offset();

            result[0] += parent_offset[0];
            result[1] += parent_offset[1];
        }

        return result;
    }

    this.purge = function () {
        if(!style || !cache) {
            style = object.extension('Style');
            cache = object.extension('Cache');
        }

        cache.purge('offset');

        if(object.type() == 'Group') {
            var layers = object.extension('Layers');
            layers.forEach(function () {
                this.extension('Offset').purge();
            });
        }
    };

    this.register('offset' , function () {
        if(!style) {
            style = this.extension('Style');
            cache = this.extension('Cache');
        }
        return cache.value('offset' , ObjectOffsetFunction);
    });
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', ['Debug', function StyleObjectExtension(Debug) {

    var properties = {},
        callbacks = [],
        setters = {},
        getters = {};

    function GetSetterFunction(name, setter) {
        return function (value) {
            var result = setter.apply(this, [value, properties[name].value]),
                old = properties[name].value;

            if (!result && typeof result == "boolean") {
                Debug.warn('Unable to set property [' + name + ']. Invalid value!');
            }
            else {
                var args = [old, result];

                properties[name].value = result;

                if (!callbacks[name]) callbacks[name] = [];

                for (var i = 0; i < callbacks[name].length; i++) {
                    callbacks[name][i].apply(this, args);
                }
            }

        }
    }

    function GetGetterFunction(name, getter) {
        return function () {
            return getter.call(null, properties[name].value);
        }
    }

    function StyleType1(a, b) {

        var target = this;

        if (!setters[a]) {
            Debug.warn({property: a, type: target.type()}, 'Style / Object type {type} has no property {property}');
        }
        else {
            setters[a].apply(target, [b]);
        }
    }

    function StyleType2(object) {
        var target = this;

        var setterstack = [];

        for (var property in object) {
            if (!object.hasOwnProperty(property) || !setters[property]) continue;

            if (!setters[property]) {
                Debug.warn({
                    property: property,
                    type: target.type()
                }, 'Style / Object type {type} has no property {property}');
                continue;
            }
            else {
                setterstack.push({
                    ordering: properties[property].ordering,
                    property: property,
                    setter: setters[property]
                });
            }
        }
        if (setterstack.length) {
            setterstack.sort(function (a, b) {
                return a.ordering - b.ordering;
            });
            for (var i = 0; i < setterstack.length; i++) {
                setterstack[i].setter.apply(target, [object[setterstack[i].property]]);
            }
        }
        else {
            Debug.warn('Style / No properties to be applied!');
        }
    }

    function StyleType3(name) {
        var target = this;

        if (!getters[name]) {
            Debug.warn({
                property: property,
                type: target.type()
            }, 'Style / Object type {type} has no property {property}');
            return this;
        }
        else {
            return getters[name].apply(target, [properties[name].value]);
        }

    }

    this.register('style', function (a, b) {
        if (typeof a == "string" && b !== undefined) StyleType1.apply(this, [a, b]);
        else if (typeof a == "object") StyleType2.apply(this, [a]);
        else if (typeof a == 'string' && b == undefined) return StyleType3.apply(this, [a]);
        else {
            Debug.error('Style / Invalid style function arguments!');
        }
        return this;
    });

    this.register('watch', function (property, callback) {

        if (typeof property !== "string") {
            if (typeof property !== "object" || property.constructor !== Array) {
                Debug.error('Style / Property is not an array or string');
                return;
            }
        }
        else if (typeof callback !== "function") {
            Debug.error('Style / Callback is not a function!');
            return;
        }

        if (property.constructor == Array) {

            for (var i = 0; i < property.length; i++) {
                if (typeof property[i] !== "string") {
                    Debug.error({i: i}, 'Style / Property {i} is not a string!');
                    continue;
                }
                else {
                    if (!callbacks[property[i]] || typeof callbacks[property[i]] !== "object" || callbacks[property[i]].constructor !== Array) callbacks[property[i]] = [];

                    callbacks[property[i]].push(callback);
                }
            }
        }
        else if (typeof property == "string") {
            if (!callbacks[property] || callbacks[property].constructor !== Array) callbacks[property] = [];
            callbacks[property].push(callback);
        }
        else {
            Debug.error('Style / Property is not an array or string');
        }

    });

    this.define = function (ordering, name, value, setter, getter) {
        if (properties[name]) {
            Debug.error({name: name}, 'Style / Duplicated Property [{name}]');
            return;
        }

        if (typeof name !== "string" || name.length == 0) {
            Debug.error('Style / Property name is not a string!');
            return;
        }

        if (typeof getter !== "function" || typeof setter !== "function") {
            Debug.error('Style / Unable to define property. Getter or setter is undefined!');
            return;
        }

        if (typeof  ordering !== "number") {
            Debug.error('Style / Unable to define property setter ordering!');
        }

        properties[name] = {ordering: ordering, value: value};

        setters[name] = GetSetterFunction(name, setter);

        getters[name] = GetGetterFunction(name, getter);
    };

    this.get = function (name) {
        if (properties[name]) return properties[name].value;

        Debug.warn('Getting value of property that does not exist!');

        return false;
    };

    this.ordering = function (name) {
        if (properties[name]) return properties[name].ordering;

        Debug.warn('Getting ordering of property that does not exist!');

        return false;
    }

}]);
/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['Debug', '$ModelHelper', '@inject', '$DrawerHelper', function TextObjectExtension(Debug, ModelHelper, inject, DrawerHelper) {

    this.applyTo('Text');

    var object = this.object();

    if (object.type() !== 'Text') return;

    var lines = [],
        wordByWordRegExp = /((\S+\s+)|(\S+$))/g,
        style = object.extension('Style'),
        string = '',
        update = false,
        limits = [Infinity, Infinity],
        width = 0,
        height = 0;

    this.register('lines', function () {
        this.update();
        var array = [];
        for (var i = 0; i < lines.length; i++) {
            array.push(lines[i].string());
        }
    });

    this.register('words', function () {
        this.update();
        var words = [];
        for (var l = 0; l < lines.length; l++) {
            var _w = lines[i].words();
            for (var w = 0; w < _w.length; w++) {
                words.push(_w.string());
            }
        }
        return words;
    });

    this.limits = function (w, h) {
        limits[0] = w;
        limits[1] = h;
        update = true;
    };

    object.watch('str', function (o, n) {
        if (n !== string) {
            string = n;
        }
    });

    object.watch(['str', 'fontSize', 'lineHeight', 'color', 'weight', 'style'], function () {
        update = true;
    });

    this.update = function (forced) {
        if (update || forced) {
            var pieces = string.match(wordByWordRegExp),
                lineWidth = 0,
                l = 0,
                limits = style.get('size'),
                w = 0,
                h = 0;


            var font = style.get('font'),
                fontSize = style.get('fontSize'),
                lineHeight = style.get('lineHeight'),
                fontWeight = style.get('weight'),
                color = style.get('color'),
                fontStyle = style.get('style');

            lines = [];


            for (var i = 0; i < pieces.length; i++) {

                var usernewline = pieces[i].match(/\n/g),
                    str = pieces[i].match(/\S+/g),
                    word = inject('$TextWordClass').string(str[0]);

                if (!lines[l]) lines[l] = inject('$TextLineClass')
                    .font(font)
                    .size(fontSize)
                    .height(lineHeight)
                    .color(color)
                    .style(fontStyle)
                    .weight(fontWeight);

                lines[l].push(word);
                lineWidth = lines[l].width();

                if (lineWidth >= limits[0] || usernewline) {
                    l++;
                }
                if (lineWidth > w) w = lineWidth + 4;
            }
            height = lines.length * style.get('lineHeight');
            if(fontSize > lineHeight) {
                height += fontSize - lineHeight;
            }
            else if( fontSize < lineHeight) {
                height -= lineHeight-fontSize;
            }
            width = w;
            update = false;
        }
        return this;
    };

    this.textBlockHeight = function () {
        this.update();
        return height;
    };

    this.textBlockWidth = function () {
        this.update();
        return width;
    };

    this.forEachLine = function (func) {
        this.update();
        for (var i = 0; i < lines.length; i++) {
            func.apply(lines[i], [i, lines[i]]);
        }
    };

}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', function TreeObjectExtension(Debug) {

    var parent = null;

    function checkTree (object) {
        if (object.$$TREESEARCHVALUE) {
            return true;
        }
        else {
            if (object.parent()) {
                if(checkTree(object.parent())) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return false;
    }

    function treeViolation (target,object) {
        if(target.type() == 'Group') {

            object.$$TREESEARCHVALUE = true;

            if(!checkTree(target)) {
                delete object.$$TREESEARCHVALUE;
                return false;
            }
            else {
                if(target.$$TREESEARCHVALUE) {
                    if(target.parent()) {
                        Debug.warn({},'You try to append group parent into itself.');
                    }
                }
                else {
                    Debug.warn({},'You try to append group parent into it\'s children.');
                }
                delete object.$$TREESEARCHVALUE;
                return true;
            }
        }
        else {
            if(target.type() != 'Group') {
                Debug.warn({target : target.type(), object : object.type()},'Yoy try to append [{object}] into [{target}].');
                return true;
            }
        }
    }

    var layers = null;

    this.register('append' , function (object) {
        if(this.type() !== 'Group') {
            Debug.watch({type : this.type()}, ' Can not append. type[{type}] of parent is not allowed!');
        }
        else if(!treeViolation(this,object)) {

            if(!layers) layers = this.extension('Layers');

            var object_old_parent = object.parent(),
                object_tree_ext = object.extension('Tree');

            if(object_old_parent) {
                var old_object_parent_layers = object_old_parent.extension('Layers'),
                    object_layer = object.layer();

                old_object_parent_layers.remove(object);

                layers.place(object_layer,object);

                object_tree_ext.parent(this);

            }
            else {

                var object_layer = object.layer();

                layers.place(object_layer,object);

                object_tree_ext.parent(this);
            }

            var box = this.extension('Box');
            box.purge();
        }
        return this;
    });

    this.register('appendTo' , function (object) {
        object.append(this);
        return this;
    });

    this.register('parent' , function () {
        return parent;
    });


    this.parent = function (group) {
        if(!group.type || group.type() !== 'Group') {
            Debug.error('Object Tree Extension / Unable to set object as parent. Not a group!');
        }
        if(group) {
            parent = group;
        }
        else {
            return parent;
        }
    };

}]);
/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper', '$PathHelper', '$ModelHelper', function AreaObjectDrawer(inject, DrawerHelper, PathHelper, ModelHelper) {

    var assembler = inject('$GraphicsAssembler'),
        box = this.extension('Box'),
        style = this.extension('Style'),
        matrix = this.extension('Matrix'),
        drawer = this.extension('Drawer'),
        interpolated = false,
        strokefix = 1, interpolationfix = 0,
        xshift = 0, yshift = 0;


    //TODO : Apply interpolation to path!

    assembler.layer(0, 'fill', UpdateFill.bind(this));
    assembler.layer(1, 'bg', UpdateBg.bind(this));
    assembler.layer(2, 'stroke', UpdateStroke.bind(this));
    assembler.box(box);

    function UpdateFill(context) {
        var sprite = this.extension('Box').box().sprite(),
            style = this.extension('Style'),
            path = style.get('path');

        context.save();
        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        var interpolation = style.get('interpolation');

        if (!interpolated) {
            PathHelper.interpolate(path, interpolation, true);
            interpolated = true;
        }

        if (interpolation) DrawerHelper.drawBezierPathFill(context, path, style);
        else DrawerHelper.drawLinePathFill(context, path, style);

        context.restore();
    }

    function UpdateStroke(context) {
        var sprite = this.extension('Box').box().sprite(),
            style = this.extension('Style'),
            path = ModelHelper.cloneArray(style.get('path')),
            interpolation = style.get('interpolation');


        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        if (!interpolated) {
            PathHelper.interpolate(path, interpolation, true);
            interpolated = true;
        }

        if (interpolation) DrawerHelper.drawLinePath(context, path, style);
        DrawerHelper.drawBezierPath(context, path, style);
    }

    function UpdateBg(context) {
        var style = this.extension('Style'),
            sprite = this.extension('Box').box().sprite(),
            path = ModelHelper.cloneArray(style.get('path')),
            interpolation = style.get('interpolation');


        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        if (!interpolated) {
            PathHelper.interpolate(path, interpolation, true);
            interpolated = true;
        }

        if (interpolation) DrawerHelper.drawLineBgClipPath(context, path, style, assembler, sprite);
        else DrawerHelper.drawBezierBgClipPath(context, path, style, assembler, sprite);
    }


    this.watch('path', function () {
        var interpolation = style.get('interpolation');
        interpolated = false;
        box.purge();
        matrix.purge();
        assembler.resize();
        assembler.update('fill');
        assembler.update('stroke');
        assembler.update('bg');
    });

    this.watch('interpolation', function (o, n) {
        interpolated = false;
        interpolationfix = Math.round(40 * n);
        assembler.update('fill');
        assembler.update('stroke');
        assembler.update('bg');
        assembler.resize();
    });

    this.watch('position', function () {
        box.purge();
        matrix.purge();
    });

    this.watch(['strokeStyle', 'strokeColor'], function () {
        assembler.update('stroke');
        assembler.resize();
    });

    this.watch('fill', function () {
        assembler.update('fill');
    });

    this.watch(['bg', 'bgSize', 'bgPosition'], function () {
        assembler.update('bg');
    });

    this.watch('strokeWidth', function (o, n) {
        var fix = 0;

        for (var i = 0; i < n.length; i++) {
            if (n[i] > fix) fix = n[i];
        }

        strokefix = fix / 2;
        assembler.update('stroke');
        box.purge();
        matrix.purge();
        assembler.resize();

    });

    box.f(function (boxContainer) {
        var position = style.get('position'),
            path = style.get('path'),
            anchor = style.get('anchor'),
            x = position[0],
            y = position[1],
            minx = Infinity,
            miny = Infinity,
            maxx = -Infinity,
            maxy = -Infinity;

        for (var i = 0; i < path.length; i++) {
            if (path[i][0] < minx) {
                minx = path[i][0]
            }
            if (path[i][2] < minx) {
                minx = path[i][2]
            }
            if (path[i][1] < miny) {
                miny = path[i][1]
            }
            if (path[i][3] < miny) {
                miny = path[i][3]
            }
            if (path[i][0] > maxx) {
                maxx = path[i][0]
            }
            if (path[i][2] > maxx) {
                maxx = path[i][2]
            }
            if (path[i][1] > maxy) {
                maxy = path[i][1]
            }
            if (path[i][3] > maxy) {
                maxy = path[i][3]
            }
        }

        if (minx == Infinity) minx = 0;
        if (miny == Infinity) miny = 0;
        if (maxx == -Infinity) maxx = 0;
        if (maxy == -Infinity) maxx = 0;

        xshift = minx;
        yshift = miny;

        var fix = strokefix + interpolationfix,
            width = Math.abs(maxx - minx),
            height = Math.abs(maxy - miny);

        if (anchor[0] == 'center') {
            x -= width ? width / 2 : 0;
        }
        if (anchor[0] == 'right') {
            x -= width ? width : 0;
        }
        if (anchor[1] == 'middle') {
            y -= height ? height / 2 : 0;
        }
        if (anchor[1] == 'bottom') {
            y -= height ? height : 0
        }
        boxContainer.set(
            x + xshift,
            y + yshift,
            width,
            height,
            fix,
            fix,
            fix,
            fix
        );

    });

    drawer.f(function (context) {
        DrawerHelper.transform(this, context);
        assembler.draw(context);
    });
}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$DrawerHelper', 'Debug', '@inject', function CircleObjectDrawer(DrawerHelper, Debug, inject) {

    var assembler = inject('$GraphicsAssembler'),
        drawer = this.extension('Drawer'),
        boxExt = this.extension('Box'),
        style = this.extension('Style'),
        matrix = this.extension('Matrix'),
        strokefix = 1;

    assembler.layer(0, 'fill', UpdateFill.bind(this));
    assembler.layer(1, 'bg', UpdateBg.bind(this));
    assembler.layer(2, 'stroke', UpdateStroke.bind(this));
    assembler.box(boxExt);

    function UpdateStroke(context) {
        var sprite = boxExt.box().sprite();

        context.beginPath();
        context.strokeStyle = style.get('strokeColor');
        context.lineWidth = style.get('strokeWidth');
        context.setLineDash(style.get('strokeStyle'));

        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI * 2);
        context.stroke();

    }

    function UpdateFill(context) {
        var sprite = boxExt.box().sprite();

        context.beginPath();
        context.fillStyle = style.get('fill');
        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI * 2);
        context.fill();
    }

    function UpdateBg(context){
        var sprite = boxExt.box().sprite(),
            box = boxExt.box().value();

        context.beginPath();
        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI / 2);
        context.clip();

        var bgposition = style.get('bgPosition'),
            bgsize = style.get('bgSize'),
            bg = style.get('bg');

        for (var i = 0; i < bg.length; i++) {

            if (!bg[i].loaded()) {
                bg[i].on('load', function () {assembler.update('bg')});
            }
            else {
                context.save();

                var bgwidth = box.size[0] * bgsize[i][0],
                    bgheight = box.size[1] * bgsize[i][1],
                    bgpositionx = box.size[0] * bgposition[i][0],
                    bgpositiony = box.size[1] * bgposition[i][1];

                context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                context.restore();
            }
        }
    }

    boxExt.f(function (boxContainer) {
        var radius = style.get('radius'),
            position = style.get('position'),
            anchor = style.get('anchor'),
            d = radius * 2;

        var x = position[0],
            y = position[1];

        if (anchor[0] == 'center') {
            x -= radius
        }
        if (anchor[0] == 'right') {
            x -= d
        }
        if (anchor[1] == 'middle') {
            y -= radius
        }
        if (anchor[1] == 'bottom') {
            y -= d;
        }

        boxContainer.set(x, y, d, d, strokefix, strokefix, strokefix, strokefix);
    });

    this.watch('radius', function () {
        assembler.update('stroke');
        assembler.update('bg');
        assembler.update('fill');
        boxExt.purge();
        matrix.purge();
        assembler.resize();
    });

    this.watch('fill', function () {
        assembler.update('fill');
    });

    this.watch('position', function () {
        boxExt.purge();
    });

    this.watch('strokeWidth', function (o, n) {
        if (n !== o) {
            strokefix = n;
            boxExt.purge();
            assembler.update('stroke');
            matrix.purge();
            assembler.resize();
        }
    });

    this.watch(['strokeStyle', 'strokeColor'], function () {
        assembler.update('stoke');
    });

    this.watch(['bg', 'bgPosition', 'bgSize'], function () {
        assembler.update('bg');
    });

    drawer.f(function (context) {
        DrawerHelper.transform(this, context);
        assembler.draw(context);
    });
}]);
/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.part('Objects' , ['Debug' , '$MatrixHelper', function DefaultObjectDrawer (Debug,Matrix) {
    var matrix = this.extension('Matrix');

    matrix.f(function () {
        return Matrix.objectMatrix(this);
    });

    this.watch(['position', 'rotate', 'translate', 'scale', 'skew'], function () {
        matrix.purge();
    });
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['$DrawerHelper', function GroupObjectDrawer(DrawerHelper) {
    var drawer = this.extension('Drawer'),
        layers = this.extension('Layers'),
        box = this.extension('Box'),
        style = this.extension('Style');

    box.f(function (boxContainer) {

        var minx = Infinity,
            miny = Infinity,
            maxx = -Infinity,
            maxy = -Infinity;


        layers.forEach(function () {


            var obox = this.extension('Box').box().value();

            if (obox.position[0] < minx) {
                minx = obox.position[0];
            }
            if (obox.position[1] < miny) {
                miny = obox.position[1]
            }
            if (obox.position[0] + obox.size[0] > maxx) {
                maxx = obox.position[0] + obox.size[0];
            }
            if (obox.position[1] + obox.size[1] > maxy) {
                maxy = obox.position[1] + obox.size[1];
            }

        });

        var position = style.get('position');

        if (minx === Infinity) minx = 0;
        if (maxx === -Infinity) maxx = 0;
        if (miny === Infinity) miny = 0;
        if (maxy === -Infinity) maxy = 0;

        boxContainer.set(
            minx + position[0],
            miny + position[1],
            maxx - minx,
            maxy - miny,
            0, 0, 0, 0
        );
    });

    var position = [0, 0];

    this.watch('position', function (o, n) {
        position = n;
        box.purge();
    });

    drawer.f(function (context) {

        context.save();

        context.globalAlpha *= style.get('opacity');

        DrawerHelper.transform(this, context);

        layers.forEach(function () {

            var odrawer = this.extension('Drawer'),
                type = this.type();

            if (type == 'Group') {
                odrawer.draw.call(this, context);
            }
            else {
                var ostyle = this.extension('Style');

                context.save();
                context.globalCompositeOperation = ostyle.get('blending');
                context.globalAlpha *= ostyle.get('opacity');
                odrawer.draw.call(this, context);
                context.restore();
            }

        });

        context.restore();

    });

}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$DrawerHelper', 'Resource', function ImageObjectDrawer(DrawerHelper, Resource) {

    var style = this.extension('Style'),
        box = this.extension('Box'),
        drawer = this.extension('Drawer'),
        matrix = this.extension('Matrix');

    var width = null, height = null,
        image = null;


    this.watch('src', function (o, n) {
        if (o !== n) {
            image = Resource.image(n);
            image.on('load', function () {
                if(width == null) {
                    width = image.width();
                }
                if(height == null) {
                    height = image.height();
                }
                matrix.purge();
                box.purge();
            });
        }
    });

    this.watch('size', function (o, n) {
        if (o[0] !== n[0] || o[1] !== n[1]) {
            width = n[0];
            height = n[1];
            box.purge();
        }
    });

    this.watch('position', function (o, n) {
        if (o[0] !== n[0] || o[1] !== n[1]) {
            box.purge();
        }
    });

    box.f(function (boxContainer) {
        var position = style.get('position'),
            anchor = style.get('anchor');

        var x = position[0],
            y = position[1];

        if (anchor[0] == 'center') {
            x -= width ? width /2 : 0;
        }
        if (anchor[0] == 'right') {
            x -= width ? width : 0;
        }
        if (anchor[1] == 'middle') {
            y -= height ? height /2 : 0;
        }
        if (anchor[1] == 'bottom') {
            y -= height ? height : 0
        }
        boxContainer.set(x, y, width ? width : 0, height ? height : 0, 0, 0, 0, 0);
    });

    drawer.f(function (context) {
        if (image && image.loaded() && !image.error() &&
            width !== null &&
            height !== null && width > 0 && height > 0) {
            DrawerHelper.transform(this, context);
            context.drawImage(image.export(), 0, 0, width, height);
        }
    });

}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['@inject', 'Debug', '$DrawerHelper', '$PathHelper',
    function LineObjectDrawer(inject, Debug, DrawerHelper, PathHelper) {

        var box = this.extension('Box'),
            style = this.extension('Style'),
            canvas = inject('$Canvas'),
            matrix = this.extension('Matrix'),
            require_update = false, interpolated = false,
            strokefix = 1, interpolationfix = 0;

        var drawer = this.extension('Drawer');

        var xshift = 0, yshift = 0;

        box.f(function (boxContainer) {
            var position = style.get('position'),
                path = style.get('path'),
                anchor = style.get('anchor'),
                x = position[0],
                y = position[1],
                minx = Infinity,
                miny = Infinity,
                maxx = -Infinity,
                maxy = -Infinity;

            for (var i = 0; i < path.length; i++) {
                if (path[i][0] < minx) {
                    minx = path[i][0]
                }
                if (path[i][2] < minx) {
                    minx = path[i][2]
                }
                if (path[i][1] < miny) {
                    miny = path[i][1]
                }
                if (path[i][3] < miny) {
                    miny = path[i][3]
                }
                if (path[i][0] > maxx) {
                    maxx = path[i][0]
                }
                if (path[i][2] > maxx) {
                    maxx = path[i][2]
                }
                if (path[i][1] > maxy) {
                    maxy = path[i][1]
                }
                if (path[i][3] > maxy) {
                    maxy = path[i][3]
                }
            }

            if (minx == Infinity) minx = 0;
            if (miny == Infinity) miny = 0;
            if (maxx == -Infinity) maxx = 0;
            if (maxy == -Infinity) maxx = 0;

            xshift = minx;
            yshift = miny;

            var fix = strokefix + interpolationfix,
                width = Math.abs(maxx - minx),
                height = Math.abs(maxy - miny);

            if (anchor[0] == 'center') {
                x -= width ? width / 2 : 0;
            }
            if (anchor[0] == 'right') {
                x -= width ? width : 0;
            }
            if (anchor[1] == 'middle') {
                y -= height ? height / 2 : 0;
            }
            if (anchor[1] == 'bottom') {
                y -= height ? height : 0
            }
            boxContainer.set(
                x + xshift,
                y + yshift,
                width,
                height,
                fix,
                fix,
                fix,
                fix
            );

        });

        this.watch('path', function () {
            var interpolation = style.get('interpolation');
            if (interpolation !== 0) interpolated = false;
            box.purge();
            matrix.purge();
            require_update = true;
        });
        this.watch('position', function () {
            box.purge();
        });

        this.watch('strokeWidth', function (o, n) {
            var fix = 0;

            for (var i = 0; i < n.length; i++) {
                if (n[i] > fix) fix = n[i];
            }

            strokefix = fix / 2;

            require_update = true;

            box.purge();
            matrix.purge();

        });

        this.watch('interpolation', function (o, n) {
            if (o !== n) interpolated = false;

            interpolationfix = Math.round(20 * n);
            box.purge();
            matrix.purge();
            require_update = true;

        });

        this.watch(['strokeStyle', 'strokeColor'], function () {
            require_update = true;
        });


        var ctx = canvas.context();

        function UpdateCanvas() {
            var sprite = box.box().sprite(),
                path = style.get('path'),
                interpolation = style.get('interpolation');

            if (canvas.width() !== sprite.size[0] || canvas.height() !== sprite.size[1]) {

                var width = sprite.size[0],
                    height = sprite.size[1];

                canvas.width(width);
                canvas.height(height);
            }

            ctx.clearRect(0, 0, sprite.size[0], sprite.size[1]);
            ctx.save();
            ctx.fillStyle = 'rgba(255,0,0,.5)';
            ctx.beginPath();
            ctx.rect(0, 0, sprite.size[0], sprite.size[1]);
            ctx.fill();
            ctx.restore();

            if (!interpolated) {
                PathHelper.interpolate(path, interpolation);
                interpolated = true;
            }

            ctx.save();

            ctx.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

            if (interpolation > 0) {
                if (path.length > 0) {
                    DrawerHelper.drawBezierPath(ctx, path, style);
                }
            }
            else {
                if (path.length > 0) {
                    DrawerHelper.drawLinePath(ctx, path, style);
                }
            }

            ctx.restore();

            require_update = false;
        }

        drawer.f(function (context) {
            if (require_update) UpdateCanvas.call(this);
            DrawerHelper.transform(this, context);
            context.drawImage(canvas.export(), 0, 0);
        });

    }]);
/**
 * Created by bx7kv_000 on 1/11/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper',
    function RectangleObjectDrawer(inject, DrawerHelper) {

        var assembler = inject('$GraphicsAssembler'),
            style = this.extension('Style'),
            drawer = this.extension('Drawer'),
            boxExtension = this.extension('Box'),
            matrix = this.extension('Matrix'),
            strokefix = [2, 2, 2, 2];

        assembler.layer(0, 'fill', UpdateFill.bind(this));
        assembler.layer(1, 'bg', UpdateBg.bind(this));
        assembler.layer(2, 'stroke', UpdateStroke.bind(this));
        assembler.box(boxExtension);

        boxExtension.f(function (boxContainer) {

            var position = style.get('position'),
                size = style.get('size'),
                anchor = style.get('anchor');

            var x = position[0],
                y = position[1];

            if (anchor[0] == 'center') {
                x -= size[0]/2;
            }
            if (anchor[0] == 'right') {
                x -= size[0];
            }
            if (anchor[1] == 'middle') {
                y -= size[1]/2;
            }
            if (anchor[1] == 'bottom') {
                y -= size[1]
            }

            boxContainer.set(
                x, y,
                size[0], size[1],
                strokefix[0], strokefix[1], strokefix[2], strokefix[3]
            );
        });

        drawer.f(function (context) {
            DrawerHelper.transform(this, context);
            assembler.draw(context);
        });

        this.watch('size', function (o, n) {
            assembler.update('fill');
            assembler.update('stroke');
            assembler.update('bg');
            assembler.resize();
            matrix.purge();
        });

        this.watch('strokeWidth', function (o, n) {
            strokefix[0] = n[0];
            strokefix[1] = n[1];
            strokefix[2] = n[2];
            strokefix[3] = n[3];
            boxExtension.purge();
            assembler.resize();
            assembler.update('stroke');
            matrix.purge();
        });

        this.watch(['position', 'size'], function () {
            boxExtension.purge();
            matrix.purge();
        });

        this.watch(['bg', 'bgSize', 'bgPosition'], function () {
            assembler.update('bg');
        });

        this.watch(['strokeStyle', 'strokeColor'], function () {
            assembler.update('stroke');
        });

        this.watch(['fill'], function () {
            assembler.update('fill');
        });

        function UpdateBg(context) {
            var boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.moveTo(sprite.margin[3], sprite.margin[0]);
            context.beginPath();
            context.lineTo(box.size[0] + sprite.margin[3], sprite.margin[0]);
            context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.lineTo(sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.lineTo(sprite.margin[3], sprite.margin[0]);
            context.clip();

            var bgposition = style.get('bgPosition'),
                bgsize = style.get('bgSize'),
                bg = style.get('bg');

            for (var i = 0; i < bg.length; i++) {

                if (!bg[i].loaded()) {
                    bg[i].on('load', function () {
                        assembler.update('bg');
                    });
                }
                else {
                    context.save();
                    var bgwidth = box.size[0] * bgsize[i][0],
                        bgheight = box.size[1] * bgsize[i][1],
                        bgpositionx = box.size[0] * bgposition[i][0],
                        bgpositiony = box.size[1] * bgposition[i][1];

                    context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                    context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                    context.restore();
                }
            }
        }

        function UpdateStroke(context) {
            var strokeColor = style.get('strokeColor'),
                strokeWidth = style.get('strokeWidth'),
                strokeStyle = style.get('strokeStyle'),
                cap = style.get('cap'),
                boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.moveTo(sprite.margin[3], sprite.margin[0]);
            context.lineCap = cap;
            context.strokeStyle = strokeColor[0];
            context.lineWidth = strokeWidth[0];
            context.setLineDash(strokeStyle[0]);
            context.lineTo(box.size[0] + sprite.margin[3], sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[1];
            context.lineWidth = strokeWidth[1];
            context.setLineDash(strokeStyle[1]);
            context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[2];
            context.lineWidth = strokeWidth[2];
            context.setLineDash(strokeStyle[2]);
            context.lineTo(sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[3];
            context.lineWidth = strokeWidth[3];
            context.setLineDash(strokeStyle[3]);
            context.lineTo(sprite.margin[3], sprite.margin[0]);
            context.stroke();
        }

        function UpdateFill(context) {
            var fill = style.get('fill'),
                boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.rect(sprite.margin[3], sprite.margin[0], box.size[0], box.size[1]);
            context.fillStyle = fill;
            context.fill();
        }
    }
]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$DrawerHelper', '$ModelHelper', 'Resource',
    function SpriteObjectDrawer(DrawerHelper, ModelHelper, Resource) {

        var style = this.extension('Style'),
            box = this.extension('Box'),
            drawer = this.extension('Drawer'),
            matrix = this.extension('Matrix'),
            width = null, height = null, image = null;

        box.f(function (boxContainer) {
            var position = style.get('position'),
                anchor = style.get('anchor');

            var x = position[0],
                y = position[1];

            if (anchor[0] == 'center') {
                x -= width ? width / 2 : 0;
            }
            if (anchor[0] == 'right') {
                x -= width ? width : 0;
            }
            if (anchor[1] == 'middle') {
                y -= height ? height / 2 : 0;
            }
            if (anchor[1] == 'bottom') {
                y -= height ? height : 0
            }
            boxContainer.set(
                x,
                y,
                width ? width : 0,
                height ? height : 0,
                0,
                0,
                0,
                0
            );
        });

        drawer.f(function (context) {
            if (image && image.loaded() && !image.error()
                && image.ready()
                && width !== null && height !== null
                && width > 0 && height > 0) {
                DrawerHelper.transform(this, context);
                context.drawImage(image.export(), 0, 0, width, height);
            }
        });

        this.watch('src', function (o, n) {
            if (n !== o) {
                var data = ModelHelper.readSpriteString(n);
                image = Resource.sprite(data.url);
                image.config(data.frames);
                image.on('load', function () {
                    if (width == null) {
                        width = image.width();
                    }
                    if (height == null) {
                        height = image.height();
                    }
                    matrix.purge();
                    box.purge();
                });
            }
        });

        this.watch('size', function (o, n) {
            if (o[0] !== n[0] || o[1] !== n[1]) {
                width = n[0];
                height = n[1];
                box.purge();
            }
        });
        this.watch('position', function (o, n) {
            if (o[0] !== n[0] || o[1] !== n[1]) {
                box.purge();
            }
        });
    }
]);
/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper', 'Resource',
        function TextObjectDrawer(inject, DrawerHelper, Resource) {
            var text = this.extension('Text'),
                style = this.extension('Style'),
                box = this.extension('Box'),
                drawer = this.extension('Drawer'),
                matrix = this.extension('Matrix'),
                require_update = false,
                font = style.get('font'),
                weight = style.get('weight'),
                fstyle = style.get('style'),
                assembler = inject('$GraphicsAssembler'),
                object = this;

            assembler.layer(0, 'text', UpdateTextLayer);

            function UpdateTextLayer(context) {
                text.update();

                var lineHeight = style.get('lineHeight'),
                    color = style.get('color'),
                    fontSize = style.get('fontSize'),
                    align = style.get('align');

                context.beginPath();

                var topSpan = lineHeight - (fontSize / 5);

                if (fontSize < lineHeight) {
                    topSpan = topSpan - (lineHeight - fontSize);
                }
                else {
                    topSpan = topSpan + (fontSize - lineHeight);
                }
                text.forEachLine(function (i) {
                    context.beginPath();
                    var y = topSpan + i * lineHeight;

                    context.font = this.extractFontString();
                    context.fillStyle = this.color();
                    if (align == 'center') {
                        context.fillText(this.string(), (text.textBlockWidth() - this.width()) / 2, y);
                    }
                    else if (align == 'right') {
                        context.fillText(this.string(), text.textBlockWidth() - this.width() - 2, y);
                    }
                    else {
                        context.fillText(this.string(), 2, y);
                    }
                });
            }

            function getFontFile() {
                var _style = fstyle === 'oblique' ? 'normal' : fstyle;
                var f = Resource.font(font, weight, _style);
                f.on('load', function () {
                    require_update = true;
                    box.purge();
                    matrix.purge();
                    text.update(true);
                });

                f.on('error', function () {
                    require_update = true;
                    box.purge();
                    matrix.purge();
                    text.update(true);
                })
            }

            function drawText(context) {
                if (require_update) {
                    assembler.size(text.textBlockWidth(), text.textBlockHeight());
                    assembler.update('text');
                    require_update = false;
                }
                DrawerHelper.transform(this, context);
                assembler.draw(context);
            }

            this.watch(['str', 'style', 'font', 'weight', 'size', 'color', 'fontSize', 'lineHeight'], function () {
                require_update = true;
                box.purge();
                matrix.purge();
            });

            this.watch('font', function (o, n) {
                font = n;
                getFontFile();
            });
            this.watch('style', function (o, n) {
                fstyle = n;
                getFontFile();
            });
            this.watch('weight', function (o, n) {
                weight = n;
                getFontFile();
            });

            this.watch('anchor', function () {
                box.purge();
                matrix.purge();
            });

            box.f(function (boxContainer) {
                var position = style.get('position'),
                    anchor = style.get('anchor'),
                    x = position[0],
                    y = position[1];

                if (anchor[0] == 'center') {
                    x -= text.textBlockWidth() / 2
                }
                if (anchor[0] == 'right') {
                    x -= text.textBlockWidth();
                }
                if (anchor[1] == 'middle') {
                    y -= text.textBlockHeight() / 2
                }
                if (anchor[1] == 'bottom') {
                    y -= text.textBlockHeight();
                }
                boxContainer.set(x, y, text.textBlockWidth(), text.textBlockHeight(), 0, 0, 0, 0);
            });

            drawer.f(drawText);

        }
    ]
);
/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.part('Objects',
    ['@extend', '$ModelHelper', '$PathHelper', 'Debug',
        function AreaObjectModel(extend, ModelHelper, PathHelper, Debug) {
            extend(this, '$DefaultObjectModel');
            extend(this, '$GlobalBackgroundModel');
            extend(this, '$DefaultFreeStrokeModel');

            var style = this.extension('Style'),
                animation = this.extension('Animation');

            function SyncPathProperty(path, property) {
                for (var i = 0; i < path.length; i++) {
                    if (!property[i]) {
                        property.push(property[property.length - 1]);
                    }
                }

                if (path.length < property.length) {
                    property.splice(path.length - 1, property.length - path.length);
                }

            }

            style.define(0, 'path', [[0, 0, 0, 0, 0, 0, 0, 0]],
                function (value) {
                    if (PathHelper.checkSimplePath(value)) {
                        var old = style.get('path'),
                            result = PathHelper.convertSimplePath(value);
                        if (result[0][0] !== result[result.length - 1][2] || result[0][1] !== result[result.length - 1][3]) {
                            result.push([
                                result[result.length - 1][2],
                                result[result.length - 1][3],
                                result[0][0],
                                result[0][1],
                                result[result.length - 1][2],
                                result[result.length - 1][3],
                                result[0][0],
                                result[0][1]
                            ]);
                        }

                        if (old.length !== result.length) {
                            SyncPathProperty(result, style.get('strokeStyle'));
                            SyncPathProperty(result, style.get('strokeWidth'));
                            SyncPathProperty(result, style.get('strokeColor'));
                        }

                        return result;
                    }
                    else {
                        Debug.warn('Area Model / Invalid value for area path!');
                        return false;
                    }
                },
                function (value) {
                    return PathHelper.convertComplexPath(value);
                }
            );
        }
    ]
);

/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['@extend', '$ColorHelper', '$ModelHelper', 'Debug', function CircleObjectModel(extend, ColorHelper, ModelHelper, Debug) {
    extend(this, '$DefaultObjectModel');
    extend(this, '$GlobalBackgroundModel');

    var style = this.extension('Style'),
        animation = this.extension('Animation');

    style.define(0, 'radius', 0,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;

                return value;
            }
        },
        function (value) {
            return value;
        }
    );
    animation.morph('radius', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                start(this.style('radius'));
                end(value);
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid radius value')
            }
        },
        function (value) {
            if (value < 0) value = 0;
            return value;
        }
    );

    style.define(0, 'strokeWidth', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;

                return value;
            }
        },
        function (value) {
            return value;
        }
    );

    animation.morph('strokeWidth', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                start(this.style('strokeWidth'));
                end(value);
            }
        },
        function (value) {
            if (value < 0) value = 0;
            return value;
        }
    );

    style.define(0, 'strokeColor', 'rgba(0,0,0,1)',
        function (value) {
            if (typeof value == "string") {
                if (ColorHelper.colorToArray(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeColor value');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    return ColorHelper.arrayToColor(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeColor value');
                    return false;
                }
            }
        },
        function (value) {
            return ColorHelper.colorToArray(value);
        }
    );

    animation.morph('strokeColor', 0,
        function (start, end, value) {
            if (typeof value == "string") {
                var color = ColorHelper.colorToArray(value);
                if (color) {
                    start(this.style('strokeColor'));
                    end(color);
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    start(this.style('strokeColor'));
                    end(ModelHelper.cloneArray(value));
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
            }
        },
        function (value) {
            ColorHelper.normalize(value);
            return value;
        }
    );

    style.define(0, 'strokeStyle', [1, 0],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericValue(value)) {
                    if (value.length == 2) {
                        for (var i = 0; i < value.length; i++) {
                            if (value[i] < 0) {
                                value[i] = 0;
                            }
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value.');
                        return false;
                    }
                    return ModelHelper.cloneArray(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value.');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );
    animation.morph('strokeStyle', 0,
        function (start, end, value) {
            if (typeof value == "object" && value.constructor === Array) {
                if (ModelHelper.validNumericArray(value)) {
                    if (value.length == 2) {
                        start(this.style('strokeStyle'));
                        end(ModelHelper.cloneArray(value))
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                    }
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
            }
        },
        function (value) {
            if (value[0] < 0) value[0] = 0;
            if (value[1] < 0) value[1] = 0;
            return value;
        }
    )
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['$ModelHelper', '$PathHelper', 'Debug', function DefaultObjectModel(ModelHelper, PathHelper, Debug) {

    var style = this.extension('Style'),
        animation = this.extension('Animation');

    style.define(2, 'position', [0, 0],
        function (value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Invalid numeric array for position!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('position', 2,
        function (start, end, value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('position'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for position');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'rotate', 0,
        function (value) {
            if (typeof value == "number") {
                if (value < -360) {
                    value = value + 360;
                }
                if (value > 360) {
                    value = value - 360;
                    value = value * Math.PI / 180;
                    return value;
                }
                else {
                    return value * Math.PI / 180;
                }
            }
        },
        function (value) {
            return value * (180 / Math.PI);
        });

    animation.morph('rotate', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                start(this.style('rotate'));
                end(value);
            }
            else {
                Debug.warn({v: value}, 'Is not a valid value to animate rotate');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'translate', [0, 0],
        function (value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Invalid numeric array for translate!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value)
        }
    );

    animation.morph('translate', 0,
        function (start, end, value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('translate'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for translate');
            }
        },
        function (value) {
            return value;
        }
    );


    style.define(0, 'opacity', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) {
                    value = 0;
                }
                if (value > 1) {
                    value = 1;
                }
                return value;
            }
            else {
                Debug.warn('Opacity value is not a number');
                return false;
            }
        },
        function (value) {
            return value;
        }
    );
    animation.morph('opacity', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                start(this.style('opacity'));
                end(value);
            }
            else {
                Debug.warn({v: value}, 'Invalid value for translate');
            }
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            return value;
        }
    );

    style.define(0, 'scale', [1, 1],
        function (value) {
            if (typeof value == "number") {
                if (value > 0) {
                    return [value, value];
                }
                else {
                    return [0, 0];
                }
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Unknown type of value for scale!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('scale', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                start(this.style('scale'));
                end([value, value]);
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('scale'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for scale');
            }
        },
        function (value) {
            if (value[0] < 0) value[0] = 0;
            if (value[1] < 0) value[1] = 0;
            return value;
        }
    );

    style.define(0, 'skew', [0, 0],
        function (value) {
            if (typeof value == "number") {
                if (value > 360) {
                    value = value - 360;
                }
                if (value < -360) {
                    value = value + 360;
                }
                var rad = value * Math.PI / 180;

                console.log(value, rad);

                return [rad, rad];
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                if (value[0] > 360) {
                    value[0] = value[1] - 360;
                }
                if (value[1] < -360) {
                    value[1] = value[1] + 360;
                }
                var rad1 = value[0] * Math.PI / 180,
                    rad2 = value[1] * Math.PI / 180;

                return [rad1, rad2];
            }
            else {
                Debug.warn({v: value}, 'Ubknown value format for skew. [{v}]');
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('skew', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                start(this.style('skew'));
                end([value, value]);
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('skew'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for skew');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'origin', [.5, .5],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericArray(value) && value.length == 2) {
                    return [value[0], value[1]]
                }
                else {
                    Debug.warn('Unknown format of value for origin. Invalid Array!');
                    return false;
                }
            }
            else {
                Debug.warn('Unknown type of value for origin');
                return false;
            }
        },
        function (value) {
            ModelHelper.cloneArray(value);
        }
    );

    animation.morph('origin', 0,
        function (start, end, value) {
           if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('origin'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for origin');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(2, 'cap', 'round',
        function (value) {
            if (typeof value == "string") {
                if (value == 'round' || value == 'butt' || value == 'square') {
                    return value;
                }
                else {
                    Debug.error({val: value}, '{val} is incorrect value for line cap property!');
                    return false;
                }
            }
            else {
                Debug.error('Cap property is a string!');
            }
        },
        function (value) {
            return value;
        }
    );

    if (this.type() !== 'Group') {
        style.define(0, 'blending', 'source-over',
            function (value) {
                if (ModelHelper.validBlending(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not a valid blending!');
                    return false;
                }
            },
            function (value) {
                return value;
            }
        );
        style.define(1, 'anchor', ['left','top'],
            function (value) {
                if(typeof value === "object" && value.constructor == Array && value.length == 2) {
                    if(
                        (value[0] == 'left' || value[0] == 'center' || value[0] == 'right') &&
                        (value[1] == 'top' || value[1] == 'middle' || value[1] == 'bottom')
                    ) {
                        return [value[0],value[1]];
                    }
                    else {
                        Debug.warn({v:value}, '[{v}] is not a valid value. Array ["left" || "center" || "right" , "top" || "middle" || "bottom" ] is required format.')
                        return false;
                    }
                }
                else {
                    Debug.warn({v:value},'[{v}] is not a valid anchor value for text element');
                    return false;
                }
            },
            function (value) {
                return [value[0],value[1]];
            }
        );
    }
}]);
/**
 * Created by Viktor Khodosevich on 5/3/2017.
 */
$R.part('Objects', ['$ModelHelper', '$ColorHelper', 'Debug', function DefaultFreeStrokeModel(ModelHelper, ColorHelper, Debug) {

    var style = this.extension('Style');

    style.define(1, 'interpolation', 0,
        function (value) {
            if (value > .4) value = .4;

            if (value < 0) value = 0;

            return value;
        },
        function (value) {
            return value;
        }
    );

    style.define(2, 'strokeColor', ['rgba(0,0,0,1)'],
        function (value) {

            if (typeof value == "string") {

                if (ColorHelper.colorToArray(value)) {
                    var path = style.get('path'),
                        result = [];

                    for (var i = 0; i < path.length; i++) {
                        result[i] = value;
                    }

                    return result
                }
                else {
                    Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                var path = style.get('path'),
                    old = style.get('strokeColor'),
                    result = [];

                for (var i = 0; i < path.length; i++) {
                    if (value[i]) {
                        if (typeof value[i] == "string") {
                            if (ColorHelper.colorToArray(value[i])) {
                                result.push(value[i])
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }

                            }
                        }
                        else if (typeof value[i] == "object" || value[i].constructor == Array) {
                            if (ColorHelper.isColor(value[i])) {
                                result.push(ColorHelper.arrayToColor(value[i]))
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }
                            }
                        }
                        else {
                            if (old[i]) {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                            }
                            else {
                                result.push(old[old.length - 1]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                            }
                        }
                    }
                    else {
                        if (old[i]) {
                            result.push(old[i]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                        }
                        else {
                            result.push(old[old.length - 1]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                        }
                    }
                }

                if (result.length) {
                    return result;
                }
                else {
                    Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                    return false;
                }
            }
            else if (typeof value == "object") {
                var path = style.get('path'),
                    old = style.get('strokeColor'),
                    result = [];

                for (var i = 0; i < path.length; i++) {
                    if (value[i]) {
                        if (typeof value[i] == "string") {
                            if (ColorHelper.colorToArray(value[i])) {
                                result.push(value[i])
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }

                            }
                        }
                        else if (typeof value[i] == "object" || value[i].constructor == Array) {
                            if (ColorHelper.isColor(value[i])) {
                                result.push(ColorHelper.arrayToColor(value[i]))
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }
                            }
                        }
                        else {
                            if (old[i]) {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                            }
                            else {
                                result.push(old[old.length - 1]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                            }
                        }
                    }
                    else {
                        if (old[i]) {
                            result.push(old[i]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                        }
                        else {
                            result.push(old[old.length - 1]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                        }
                    }
                }

                if (result.length) {
                    return result;
                }
                else {
                    Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                    return false;
                }
            }
            else {
                Debug.warn('Line Model / Wrong type of value');
                return false
            }

            return false;
        },
        function (value) {
            var result = [];

            for (var i = 0; i < value.length; i++) {
                result.push(ColorHelper.colorToArray(value[i]));
            }

            return result;
        }
    );

    style.define(2, 'strokeWidth', [1],
        function (value) {
            if (typeof value == "number") {
                var path = style.get('path'),
                    result = [];

                for (var i = 0; i < path.length; i++) {
                    result.push(value);
                }

                return result;
            }
            else if (typeof  value == "object" && value.constructor == Array) {
                var path = style.get('path'),
                    old = style.get('strokeWidth'),
                    result = [];

                for (var i = 0; i < path.length; i++) {
                    if (typeof value[i] == "number") {
                        result.push(value[i]);
                    }
                    else {
                        if (old[i]) {
                            result.push(old[i]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                        }
                        else {
                            result.push(old[old.length - 1]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                        }
                    }
                }
                return result;
            }
            else if (typeof value == "object") {
                var path = style.get('path'),
                    old = style.get('strokeWidth'),
                    result = [];
                for (var i = 0; i < path.length; i++) {
                    if (value[i]) {
                        if (typeof value[i] == "number") {
                            result.push(value[i]);
                        }
                        else {
                            if (old[i]) {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                            }
                            else {
                                result.push(old[old.length - 1]);
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                            }
                        }
                    }
                    else {
                        if (old[i]) {
                            result.push(old[i]);
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                        }
                        else {
                            result.push(old[old.length - 1]);
                        }
                    }
                }
                return result;
            }
            else {
                Debug.warn({val: value}, 'Line Model / {val} is not valid value for strokeWidth!');
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    style.define(2, 'strokeStyle', [[1, 0]],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericArray(value)) {
                    var result = [],
                        path = style.get('path');

                    for (var i = 0; i < path.length; i++) {
                        result.push(ModelHelper.cloneArray(value));
                    }

                    return result;
                }
                else {
                    var result = [],
                        path = style.get('path'),
                        old = style.get('strokeStyle');

                    for (var i = 0; i < path.length; i++) {
                        if (value[i]) {
                            if (ModelHelper.validNumericArray(value[i])) {
                                result.push(value[i]);
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                }
                                Debug.warn({val: value[i]}, 'Line Model / {val} is not a valid value for strokeStyle!');
                            }
                        }
                        else {
                            if (old[i]) {
                                result.push(old[i]);
                            }
                            else {
                                result.push(old[old.length - 1]);
                            }
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var result = [],
                    old = style.get('strokeStyle'),
                    path = style.get('path');

                for (var i = 0; i < path.length; i++) {
                    if (value[i]) {
                        if (ModelHelper.validNumericArray(value[i])) {
                            result.push(value[i]);
                        }
                        else {
                            if (old[i]) {
                                result.push(old[i]);
                            }
                            else {
                                result.push(old[old.length - 1]);
                            }
                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a valid value for strokeStyle!');
                        }
                    }
                    else {
                        if (old[i]) {
                            result.push(old[i]);
                        }
                        else {
                            result.push(old[old.length - 1]);
                        }
                    }
                }

                return result;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );
}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$ModelHelper', '$ColorHelper', 'Debug', 'Resource', function GlobalBackgroundModel(ModelHelper, ColorHelper, Debug, Resource) {
    var style = this.extension('Style'),
        animation = this.extension('Animation');

    function SyncBgProperty(bg, property, def) {
        for (var i = 0; i < bg.length; i++) {
            if (!property[i]) {
                property.push(ModelHelper.cloneArray(def));
            }
        }

        if (bg.length < property.length) {
            property.splice(bg.length - 1, property.length - path.length);
        }

    }

    style.define(0, 'fill', 'rgba(0,0,0,1)',
        function (value) {
            if (typeof value == "string") {
                if (ColorHelper.colorToArray(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid color!');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    return ColorHelper.arrayToColor(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid color');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid color!');
                return false;
            }
        },
        function (value) {
            return ColorHelper.colorToArray(value);
        }
    );

    animation.morph('fill', 0,
        function (start,end,value) {
            if(typeof value == 'string') {
                var color = ColorHelper.colorToArray(value);
                if(color) {
                    start(this.style('fill'));
                    end(color);
                }
                else {
                    Debug.warn({v:value}, '[{v}] is not avalid color!');
                }
            }
            else if (typeof value == "object" && value.constructor === Array) {
                if(ColorHelper.isColor(value)) {
                    start(this.style('fill'));
                    end(ModelHelper.cloneArray(value));
                }
            }
            else {
                Debug.warn({v : value}, '[{v}] is not a valid color!');
            }
        },
        function (value) {
            ColorHelper.normalize(value);
            return value;
        }
    );

    style.define(0, 'bg', [],
        function (value) {
            if (typeof value == "string") {
                if (ModelHelper.isSpriteString(value)) {
                    var data = ModelHelper.readSpriteString(value),
                        resource = Resource.sprite(data.url);

                    resource.config(data.frames);

                    return [resource];
                }
                else {
                    return [Resource.image(value)];
                }
            }
            else if (typeof value == "object" || value.constructor == Array) {
                if (value.length == 2 && typeof value[0] == "string" && typeof value[1] == "number") {
                    if (value[1] > 0) {
                        var resource = Resource.sprite(value[0]);
                        resource.config(value[1]);
                        return [resource];
                    }
                    else {
                        return false;
                    }
                }
                else {
                    var result = [];

                    for (var i = 0; i < value.length; i++) {
                        if (typeof value[i] == "string") {
                            if (ModelHelper.isSpriteString(value[i])) {
                                var data = ModelHelper.readSpriteString(value[i]),
                                    resource = Resource.sprite(data.url);

                                resource.config(data.frames);

                                result.push(value);
                            }
                            else {
                                result.push(Resource.image(value[i]));
                            }
                        }
                        else if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (value[i].length == 2 && typeof value[i][0] == "string" && typeof value[i][1] == "number") {
                                if (value[i][1] > 0) {
                                    var resource = Resource.sprite(value[i][0]);
                                    resource.config(value[i][1]);
                                    result.push(resource)
                                }
                                else {
                                    Debug.warn({
                                        val: value[i],
                                        i: i
                                    }, '[{i}][{val}] is not a valid bg value. Skipped.');
                                }
                            }
                        }
                        else {
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bg value. Skipped')
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var old = style.get('bg'),
                    result = [];

                for (var i = 0; i < old.length; i++) {
                    if (value[i]) {
                        if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (typeof value[i][0] == "string" && typeof value[i][1] == "number") {
                                var resource = Resource.sprite(value[i][0]);

                                resource.config(value[i][1]);

                                result.push(resource);
                            }
                            else {
                                Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bg array value.')
                            }
                        }
                        else if (typeof value[i] == "string") {
                            if (ModelHelper.isSpriteString(value[i])) {
                                var data = ModelHelper.readSpriteString(value[i]),
                                    resource = Resource.sprite(data.url);

                                resource.config(data.frames);

                                result.push(value);
                            }
                            else {
                                result.push(Resource.image(value[i]));
                            }
                        }
                        else {
                            result.push(old[i]);
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid value for bg.');
                        }
                    }
                    else {
                        result.push(old[i]);
                    }
                }

                return result;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not valid value for bg');
                return false;
            }

        },
        function (value) {
            var result = [];

            for (var i = 0; i < value.length; i++) {
                if (value[i].type == 'Image') {
                    result.push(value[i].url());
                }
                else if (value[i].type == 'Sprite') {
                    result.push(value[i].url() + '[' + value[i].frames() + ']');
                }
                else {
                    Debug.error({
                            val: value[i],
                            i: i
                        } + '[{i}][{val}] Unknown type of the background object container. Critical error.');
                }
            }

            return result;
        }
    );

    var defBgPosval = [0, 0];

    style.define(2, 'bgPosition', [defBgPosval],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericArray(value) && value.length == 2) {
                    var bg = style.get('bg'),
                        result = [];

                    var _res = [value[0], value[1]];

                    for (var i = 0; i < bg.length; i++) {
                        result.push(_res);
                    }

                    return result;
                }
                else {
                    var result = [],
                        bg = style.get('bg'),
                        bgposition = style.get('bgPosition');

                    for (var i = 0; i < bg.length; i++) {
                        if (value[i]) {
                            if (ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                result.push([value[0], value[1]]);
                            }
                            else {
                                if (bgposition[i]) {
                                    result.push(bgposition[i]);
                                }
                                else {
                                    result.push(ModelHelper.cloneArray(defBgPosval));
                                }

                                Debug.warn({i: i, val: value[i]}, '[{i}][{val}] is not a valid bgposition value');
                            }
                        }
                        else {
                            if (bgposition[i]) {
                                result.push(bgposition[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgPosval));
                            }
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var result = [],
                    bg = style.get('bg'),
                    bgposition = style.get('bgPosition');

                for (var i = 0; i < bg.length; i++) {
                    if (value.hasOwnProperty(i)) {
                        if (bgposition[i]) {
                            if (ModelHelper.validNumericValue() && value[i].length == 2) {
                                result.push([value[0], value[1]]);
                            }
                            else {
                                result.push(bgposition[i]);
                                Debug.warn({i: i, val: value[i]}, '[{i}][{val}] is not a valid bgposition value');
                            }
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgPosval));
                        }
                    }
                    else {
                        if (bgposition[i]) {
                            result.push(bgposition[i]);
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgPosval));
                        }
                    }
                }

                return result;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid bgposition value');
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    var defBgSizeVal = [1, 1];

    style.define(1, 'bgSize', [defBgSizeVal],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (value.length == 2 && ModelHelper.validNumericArray(value)) {
                    var bg = style.get('bg'),
                        result = [],
                        _res = [value[0], value[1]];

                    for (var i = 0; i < bg.length; i++) {
                        result.push(_res)
                    }

                    return result;
                }
                else {
                    var bg = style.get('bg'),
                        bgsize = style.get('bgSize'),
                        result = [];

                    for (var i = 0; i < bg.length; i++) {
                        if (value[i].length == 2 && ModelHelper.validNumericArray(value[i])) {
                            result.push(value[i][0], value[i][1]);
                        }
                        else {
                            if (bgsize[i]) {
                                result.push(bgsize[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgSizeVal));
                            }
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value');
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var bg = style.get('bg'),
                    bgsize = style.get('bgSize'),
                    result = [];

                for (var i = 0; i < bg.length; i++) {
                    if (value.hasOwnProperty(i)) {
                        if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (value[i].length == 2 && ModelHelper.validNumericArray(value[i])) {
                                result.push([value[i][0], value[i][1]]);
                            }
                            else {
                                if (bgsize[i]) {
                                    result.push(bgsize[i]);
                                }
                                else {
                                    result.push(ModelHelper.cloneArray(defBgSizeVal));
                                }
                                Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value.');
                            }
                        }
                        else {
                            if (bgsize[i]) {
                                result.push(bgsize[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgSizeVal));
                            }
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value.');
                        }
                    }
                    else {
                        if (bgsize[i]) {
                            result.push(bgsize[i]);
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgSizeVal));
                        }
                    }
                }

                return result;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );
    
    this.watch('bg' , function (o,n) {
        if(o.length !== n.length) {
            SyncBgProperty(n, style.get('bgPosition'), defBgPosval);
            SyncBgProperty(n, style.get('bgSize'), defBgSizeVal);
        }
    });
}]);
/**
 * Created by Viktor Khodosevich on 2/8/2017.
 */
$R.part('Objects',['$ModelHelper', function GlobalSizeModel(ModelHelper) {

    var animation = this.extension('Animation'),
        style = this.extension('Style');

    animation.morph('size' , 1 ,
        function (start,end,value) {
            if(typeof value == "number") {
                if(value < 0) value = 0;

                start(this.style('size'));
                end([value,value]);
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if(ModelHelper.validNumericArray(value) && value.length == 2) {
                    if(value[0] < 0) value[0] = 0;
                    if(value[1] < 0) value[1] = 0;

                    start(this.style('size'));
                    end(ModelHelper.cloneArray(value));
                }
                else {
                    Debug.warn({v:value}, '[{v}] is not valid value for size');
                }
            }
            else {
                Debug.warn({v:value}, '[{v}] is not valid value for size');
            }
        },
        function (value) {
            if(value[0] < 0) value[0] = 0;
            if(value[1] < 0) value[1] = 0;
            return value;
        }
    );

    style.define(1, 'size', [0, 0],
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                return [value, value];
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (value.length == 2 && ModelHelper.validNumericArray(value)) {
                    if (value[0] < 0) value[0] = 0;
                    if (value[1] < 0) value[1] = 0;

                    return [value[0], value[1]];
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not valid value for size!');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not valid value for size!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    )
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */

$R.part('Objects', ['@extend', function GroupObjectModel(extend) {

    extend(this,'$DefaultObjectModel');

}]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['@extend', 'Debug', function ImageObjectModel(extend, Debug) {

    extend(this, '$DefaultObjectModel');
    extend(this, '$GlobalSizeModel');

    var style = this.extension('Style');

    style.define(0, 'src', null,
        function (value) {
            if (typeof value == "string") {
                return value;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid src value');
                return false;
            }
        },
        function (value) {
            return value;
        }
    );
}]);
/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$PathHelper', '$ColorHelper', 'Debug',
    function LineObjectModel(extend, ModelHelper, PathHelper, ColorHelper, Debug) {

        extend(this, '$DefaultObjectModel');
        extend(this, '$DefaultFreeStrokeModel');

        //TODO: Add animation morphs!!

        var style = this.extension('Style');

        function SyncPathProperty(path, property) {
            for (var i = 0; i < path.length; i++) {
                if (!property[i]) {
                    property.push(property[property.length - 1]);
                }
            }

        }

        style.define(0, 'path', [[0, 0, 0, 0, 0, 0, 0, 0]],
            function (value) {
                if (PathHelper.checkSimplePath(value)) {
                    var old = style.get('path'),
                        result = PathHelper.convertSimplePath(value);

                    if (old.length !== result.length) {
                        SyncPathProperty(result, style.get('strokeStyle'));
                        SyncPathProperty(result, style.get('strokeWidth'));
                        SyncPathProperty(result, style.get('strokeColor'));
                    }

                    return result;
                }
                else {
                    Debug.warn('Line Model / Invalid value for path!');
                    return false;
                }
            },
            function (value) {
                return PathHelper.convertComplexPath(value);
            }
        );
    }]);
/**
 * Created by bx7kv_000 on 1/11/2017.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$ColorHelper', 'Debug',
    function RectangleObjectModel(extend, ModelHelper, ColorHelper, Debug) {

        extend(this, '$DefaultObjectModel');
        extend(this, '$GlobalBackgroundModel');
        extend(this, '$GlobalSizeModel');

        var style = this.extension('Style'),
            animation = this.extension('Animation');

        style.define(0, 'strokeColor', ['rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)'],
            function (value) {
                if (typeof value == "string") {
                    if (ColorHelper.colorToArray(value)) {
                        return [value, value, value, value];
                    }
                    else {
                        Debug.warn({value: val}, ' [{val} is not a valid stroke string');
                        return false;
                    }
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var old = style.get('strokeColor'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value[i]) {
                            if (typeof value[i] == "string") {
                                if (ColorHelper.colorToArray(value[i])) {
                                    result.push(value[i])
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid stroke color value!');
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor == Array) {
                                if (ColorHelper.isColor(value[i])) {
                                    result.push(ColorHelper.arrayToColor(value[i]));
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid stroke color value');
                                }
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                            }
                        }
                        else {
                            result.push(old[i]);
                        }
                    }

                    return result;
                }
                else if (typeof value == "object") {
                    var old = style.get('strokeColor'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value.hasOwnProperty(i)) {
                            if (typeof value[i] == "string") {
                                if (ColorHelper.colorToArray(value[i])) {
                                    result.push(value[i]);
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor === Array) {
                                if (ColorHelper.isColor(value[i])) {
                                    result.push(ColorHelper.arrayToColor(value[i]));
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid color value')
                                }
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                            }
                        }
                        else {
                            result.push(old[i])
                        }
                    }

                    return result;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid value for strokeColor!');
                    return false;
                }
            },
            function (value) {
                var result = [];
                for (var i = 0; i < value.length; i++) {
                    result.push(ColorHelper.colorToArray(value[i]));
                }
                return result;
            }
        );

        animation.morph('strokeColor', 0,
            function (start, end, value) {
                if (typeof value == "string") {
                    var color = ColorHelper.colorToArray(value[i]);
                    if (color) {
                        end([ModelHelper.cloneArray(color), ModelHelper.cloneArray(color), ModelHelper.cloneArray(color), ModelHelper.cloneArray(color)]);
                        start(this.style('strokeColor'));
                    }
                    else {
                        Debug.warn({v: value}, '{v} is not a valid color!');
                    }
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    if (ColorHelper.isColor(value)) {
                        end([ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value)]);

                        start(this.style('strokeColor'));
                    }
                    else {
                        var cuurent = this.style('strokeColor'),
                            result = [],
                            valid = false;

                        for (var i = 0; i < cuurent.length; i++) {
                            if (typeof value[i] == "string") {
                                var color = ColorHelper.colorToArray(value[i]);
                                if (color) {
                                    result.push(color);
                                    valid = true;
                                }
                                else {
                                    result.push(current[i])
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor == Array) {
                                if (value[i] && ColorHelper.isColor(value[i])) {
                                    result.push(ModelHelper.cloneArray(value[i]));
                                    valid = true;
                                }
                                else {
                                    result.push(current[i]);
                                }
                            }
                            else {
                                result.push(current[i])
                            }
                        }

                        if (valid) {
                            start(cuurent);
                            end(result);
                        }
                        else {
                            Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                        }
                    }
                }
                else if (typeof value == "object") {
                    var current = this.style('strokeColor'),
                        result = [],
                        valid = false;

                    for (var i = 0; i < current.length; i++) {
                        if (typeof value[i] == "string") {
                            var color = ColorHelper.colorToArray(value[i]);
                            if (color) {
                                result.push(color);
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        else if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (ColorHelper.isColor(value[i])) {
                                result.push(ModelHelper.cloneArray(value[i]));
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        else {
                            result.push(current[i])
                        }
                    }
                    if (valid) {
                        start(current);
                        end(result);
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor!');
                    }
                }
            },
            function (value) {
                for (var i = 0; i < value.length; i++) {
                    ColorHelper.normalize(value[i]);
                }
                return value;
            }
        );

        style.define(0, 'strokeWidth', [1, 1, 1, 1],
            function (value) {
                if (typeof value == "number") {
                    return [value, value, value, value];
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var old = style.get('strokeWidth'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value[i]) {
                            if (typeof value[i] == "number") {
                                result.push(value[i]);
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value}, ' [{val}] is not a valid stroke width value');
                            }
                        }
                        else {
                            result.push(old[i])
                        }
                    }

                    return result;
                }
                else if (typeof value == "object") {
                    var result = [],
                        old = style.get('strokeWidth');

                    for (var i = 0; i < old.length; i++) {
                        if (value.hasOwnProperty(i)) {
                            if (typeof value[i] == "number") {
                                result.push(value[i]);
                            }
                            else {
                                Debug.warn({val: value}, '[{val}] is not a valid value for strokeWidth');
                                result.push(old[i]);
                            }
                        }
                        else {
                            result.push(old[i]);
                        }
                    }

                    return result;
                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not a valid strokeWidth value');
                    return false;
                }
            },
            function (value) {
                return ModelHelper.cloneArray(value);
            }
        );

        animation.morph('strokeWidth', 0,
            function (start, end, value) {
                if (typeof value == "number") {
                    end([value, value, value, value]);
                    start(this.style('strokeWidth'));
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var current = this.style('strokeWidth'),
                        result = [];

                    for (var i = 0; i < current.length; i++) {
                        if (value[i] && typeof value[i] == "number") {
                            result.push(value[i]);
                        }
                        else {
                            result.push(current[i]);
                        }
                    }
                    end(result);
                    start(current);
                }
                else if (typeof value == "object") {
                    var current = this.style('strokeWidth'),
                        result = [],
                        valid = false;

                    for (var i = 0; i < current.length; i++) {
                        if (value[i] && typeof value[i] == "number") {
                            result.push(value);
                            valid = true;
                        }
                        else {
                            result.push(current[i]);
                        }
                    }
                    if (valid) {
                        end(result);
                        start(current);
                    }
                    else {
                        Debug.warn({v: value}, ' [{v}] is not a valid strokeWidth object');
                    }
                }
                else {
                    Debug.warn({v: value}, ' [{v}] is not a valid value for strokeWidth')
                }
            },
            function (value) {
                return value;
            }
        );

        style.define(0, 'strokeStyle', [[1, 0], [1, 0], [1, 0], [1, 0]],
            function (value) {
                if (typeof value == "object") {
                    if (value.constructor == Array) {
                        if (ModelHelper.validNumericArray(value)) {
                            if (value.length == 2) {
                                return [value, value, value, value];
                            }
                            else {
                                Debug.warn({v: value}, ' [{v}] is not a valid value for stroke width!');
                            }
                        }
                        else {
                            var result = [],
                                old = style.get('strokeStyle');

                            for (var i = 0; i < old.length; i++) {
                                if (value[i]) {
                                    if (ModelHelper.validNumericArray(value[i]) && value.length == 2) {
                                        result.push(ModelHelper.cloneArray(value[i]))
                                    }
                                    else {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, ' [{val}] is not a valid stroke style value');
                                    }
                                }
                                else {
                                    result.push(old[i]);
                                }
                            }
                            return result;
                        }
                    }
                    else {
                        var result = [],
                            old = style.get('strokeStyle');

                        for (var i = 0; i < old.length; i++) {
                            if (value.hasOwnProperty(i)) {
                                if (typeof value[i] == "object" && value[i].constructor == Array) {
                                    if (ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                        result.push(ModelHelper.cloneArray(value[i]));
                                    }
                                    else {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, '[{val}] is not a valid strokeStyle value');
                                    }
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.watch({val: value[i]}, ' [{val}] is not a valid strokeStyle value');
                                }
                            }
                            else {
                                result.push(old[i]);
                            }
                        }
                        return result;
                    }

                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not valid strokeStyle value');
                    return false;
                }
            },
            function (value) {
                return ModelHelper.cloneArray(value);
            }
        );

        animation.morph('strokeStyle', 0,
            function (start, end, value) {
                if(typeof value == "object") {
                    if(value.constructor == Array) {
                        if(ModelHelper.validNumericArray(value)) {
                            if(value.length == 2) {
                                start(this.style('strokeStyle'));
                                end(ModelHelper.cloneArray(value),ModelHelper.cloneArray(value),ModelHelper.cloneArray(value),ModelHelper.cloneArray(value));
                            }
                            else {
                                Debug.warn({v:value}, ' [{v}] is not a valid strokeStyle value!');
                            }
                        }
                        else {
                            var current = this.style('strokeStylr'),
                                result = [],
                                valid = false;

                            for(var i = 0 ; i < current.length ; i++) {
                                if(value[i] && ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                    result.push(ModelHelper.cloneArray(value[i]))
                                    valid = true;
                                }
                                else {
                                    result.push(current[i]);
                                }
                            }

                            if(valid) {
                                start(current);
                                end(result);
                            }
                            else {
                                Debug.warn({v:value}, '[{v}] is not a valid strokeStyle value');
                            }
                        }
                    }
                    else {
                        var current = this.style('strokeStyle'),
                            result = [],
                            valid = false;

                        for(var i = 0 ; i < current.length; i++) {
                            if(value[i] && ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                result.push(ModelHelper.cloneArray(value[o]));
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        if(valid) {
                            start(current);
                            end(result);
                        }
                        else {
                            Debug.warn({v:value}, '[{v}] is not a valid strokeStyleValue');
                        }
                    }
                }
                else {
                    Debug.warn({v:value}, '[{v}] is not a valid strokeStyleValue');
                }
            },
            function (value) {
                return value;
            }
        )


    }]);
/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['@extend', '$ModelHelper', 'Debug', function SpriteObjectModel(extend, ModelHelper, Debug) {

    extend(this, '$DefaultObjectModel');
    extend(this, '$GlobalSizeModel');

    var style = this.extension('Style');

    style.define(0, 'src', null,
        function (value) {
            if (typeof value == "string") {

                if (ModelHelper.isSpriteString(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid value for sprite src');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (typeof value[0] == "string" && typeof value[1] == "number" && value[1] > 0) {
                    return value[0] + '[' + value[1] + ']';
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid sprite src');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid sprite src');
            }
        },
        function (value) {
            return value;
        }
    );
}]);
/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$ColorHelper', 'Debug',
        function TextObjectModel(extend, ModelHelper, ColorHelper, Debug) {
            extend(this, '$DefaultObjectModel');

            var style = this.extension('Style'),
                text = this.extension('Text'),
                animation = this.extension('Animation');

            style.define(1, 'size', ['auto', 'auto'],
                function (value) {
                    if (typeof value == "string" && value == 'auto') {
                        text.limits(Infinity, Infinity);
                        return [value, value]
                    }
                    if (typeof value == "number") {
                        text.limits(value, value);
                        return [value, value];
                    }
                    else if (typeof value == "object" && value.constructor === Array && value.length == 2) {
                        var valid = true;

                        for (var i = 0; i < value.length; i++) {
                            if (
                                (typeof value[i] !== "string" && typeof value[i] !== "number") ||
                                (typeof value[i] == "string" && value[i] !== 'auto')) {
                                valid = false;
                                break;
                            }
                        }

                        if (valid) {
                            if (typeof value[0] == "number" && value[0] < 0) value[0] = 0;
                            if (typeof value[1] == "number" && value[1] < 0) value[1] = 0;

                            text.limits(value[0] === 'auto' ? Infinity : value[0], value[1] === 'auto' ? Infinity : value[1]);

                            return [value[0], value[1]]
                        }
                        Debug.warn({v: value}, '[{v}] is not a valid size array');
                        return false;
                    }
                    Debug.warn({v: value}, '[{v}] is not a valid value for size');
                    return false;
                },
                function (value) {
                    return [value[0], value[1]];
                }
            );

            style.define(1, 'str', '',
                function (value) {
                    if (typeof value == "string") {
                        return value
                    }
                    return false;
                },
                function (value) {
                    return value
                }
            );

            style.define(1, 'font', 'sans-serif',
                function (value) {
                    if (typeof value == "string") {
                        return value;
                    }
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'weight', 400,
                function (value) {
                    if (typeof value === "number") {
                        if (value < 100) value = 100;
                        if (value > 900) value = 900;

                        if (value % 100 !== 0) value = value - (value % 100);

                        return value
                    }
                    return false;
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'style', 'normal',
                function (value) {
                    if (typeof value == "string" && (value == 'normal' || value == 'italic' || value == 'oblique')) {
                        return value
                    }
                    return false;
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'lineHeight', 14,
                function (value) {
                    if (typeof value == "number") {
                        if (value < 0) value = 0;

                        return value;
                    }
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'fontSize', 14,
                function (value) {
                    if (typeof value == "number") {
                        if (value < 0) value = 0;
                        return value;
                    }
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'color', 'rgba(0,0,0,1)',
                function (value) {
                    if (typeof value == "string") {
                        if (ColorHelper.colorToArray(value)) {
                            return value;
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid color!');
                            return false;
                        }
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        if (ColorHelper.isColor(value)) {
                            return ColorHelper.arrayToColor(value);
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid color');
                            return false;
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not a valid color!');
                        return false;
                    }
                },
                function (value) {
                    return ColorHelper.colorToArray(value);
                }
            );

            style.define(1, 'align', 'left',
                function (value) {
                    if(value === 'center' || value === 'left' || value === 'right') {
                        return value;
                    }
                    else {
                        Debug.warn({v:value},'[{v}] is not a proper value for aling text property');
                        return false;
                    }
                },
                function (value) {
                    return value;
                }
            );

            animation.morph('color', 1,
                function (start,end,value) {
                    if(typeof value == 'string') {
                        var color = ColorHelper.colorToArray(value);
                        if(color) {
                            start(this.style('fill'));
                            end(color);
                        }
                        else {
                            Debug.warn({v:value}, '[{v}] is not avalid color!');
                        }
                    }
                    else if (typeof value == "object" && value.constructor === Array) {
                        if(ColorHelper.isColor(value)) {
                            start(this.style('fill'));
                            end(ModelHelper.cloneArray(value));
                        }
                    }
                    else {
                        Debug.warn({v : value}, '[{v}] is not a valid color!');
                    }
                },
                function (value) {
                    ColorHelper.normalize(value);
                    return value;
                }
            );
        }
    ]
);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', ['$AnimationHelper', 'Morphine', function Animation(AnimationHelper, Morphine) {

    var progress = 0,
        duration = null,
        easing = null,
        done = false,
        stack = null,
        morphine = null,
        target = null,
        stepsCb = null,
        queue = false,
        active = false,
        clear = null,
        stepTypeStr = 'type',
        completeTypeStr = 'complete',
        config = null;

    function Resolve(type) {
        if (type == stepTypeStr) {
            for (var i = 0; i < stack.length; i++) {
                if (stepsCb.hasOwnProperty(stack[i].morph.property())) {
                    stepsCb[stack[i].morph.property()].apply(target, [progress, stack[i].result]);
                }
            }
        }
        else if (type == completeTypeStr) {
            done = true;
            var results = {};
            for (var i = 0; i < stack.length; i++) {
                results[stack[i].morph.property()] = stack[i].result;
            }
            config.done(1, results);
            clear();
        }
    }

    this.target = function () {
        return target
    };

    this.queue = function () {
        return queue;
    };

    this.active = function () {
        return active;
    };

    this.done = function () {
        return done;
    };

    this.hasProperty = function (property) {
        var result = 0;
        for (var i = 0; i < stack.length; i++) {
            if (stack[i].morph.property() == property) {
                result = i + 1;
                break;
            }
        }
        return result;
    };

    this.properties = function () {
        var array = [];
        for (var i = 0; i < stack.length; i++) {
            array.push(stack[i].morph.property());
        }
        return array;
    };

    this.stop = function (property) {
        if (property) {
            var index = this.hasProperty(property);
            if (index) {
                index = index - 1;
                stack.splice(index, 1)
            }
        }
        else {
            stack = [];
        }
    };

    this.start = function () {

        active = true;

        var _stack = [];

        for (var i = 0; i < stack.length; i++) {
            var morph = stack[i].morph.get(stack[i].value);

            if (morph !== undefined && morph.start() !== false && morph.end() !== false) {
                _stack.push(stack[i]);
            }
        }

        stack = _stack;

        var tick_function = AnimationHelper.getTickFunction();

        morphine = Morphine.create(0, 1, function (complete, value) {
            if (stack.length == 0) {
                Resolve(completeTypeStr);
                morphine.stop();
            }
            else {
                for (var i = 0; i < stack.length; i++) {
                    stack[i].result = tick_function(value, stack[i].morph.start(), stack[i].morph.end());
                    stack[i].morph.apply(complete, stack[i].result);
                }

                Resolve(stepTypeStr);

                if (complete == 1) {
                    Resolve(completeTypeStr);
                }

            }
        }, easing, duration, 0);
    };

    this.config = function (t, m, cfg, f) {
        AnimationHelper.normalizeConfig(cfg);

        duration = cfg.duration;

        easing = cfg.easing;

        stepsCb = cfg.step;

        queue = cfg.queue;

        clear = f;

        stack = m;

        target = t;

        config = cfg;
    }
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', function AnimationHelper () {

    function TickVal(complete, start, end) {
        var locs = false, loce = false;
        if (typeof start == "function") locs = start();
        if (typeof end == "function") loce = end();

        if (start.constructor === Array) {
            var result = [];
            for (var i = 0; i < start.length; i++) {
                result.push(TickVal(complete, start[i], end[i]));
            }
        }
        else if (typeof start == 'object') {
            var result = {};
            for (var prop in start) {
                result[prop] = TickVal(complete, start[prop], end[prop]);
            }
        }
        else if (typeof start == 'number' || typeof start == 'function') {
            var endval     = loce === false ? end : loce;
            var startval   = locs === false ? start : locs;
            var difference = endval - startval;
            if (complete >= 1) {
                var value = endval;
            }
            else {

                var value = startval + (difference * complete);
            }
            var result = value;
        }
        return result;
    }

    this.normalizeConfig = function(config) {
        config.duration = typeof config.duration == "number" && config.duration > 0 ? config.duration : 1000;
        config.queue    = !!config.queue;
        config.step     = typeof config.step == "object" ? config.step : {};
        config.easing   = typeof config.easing == 'string' ? config.easing : 'linear';
        config.done     = typeof config.done === "function" ? config.done : function () {};
    };

    this.getTickFunction = function () {
        return TickVal;
    };

});
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Sound', ['Debug', function Morph(Debug) {

    var property = null,
        setter = null,
        getter = null,
        applier = null,
        start, end,
        object = null,
        valid = false,
        ordering = 0;

    function SetStartValue(val) {
        start = val;
    }

    function SetEndValue(val) {
        end = val;
    }

    this.start = function () {
        return start;
    };

    this.end = function () {
        return end;
    };

    this.property = function () {
        return property;
    };

    this.ordering = function () {
        return ordering;
    };

    this.get = function (value) {
        setter.apply(object, [SetStartValue, SetEndValue, value]);
        return this;
    };

    this.valid = function () {
        return valid;
    };

    this.apply = function (progress, value) {
        object.filter(property, applier.apply(object, [value, progress]));
    };

    this.config = function (name, obj, ord , set, apl) {
        if (typeof name !== "string") {
            Debug.error({name: name}, 'Unable to config Morph. arg1 [{name}] is not a string!');
            return;
        }
        if (typeof obj !== "object") {
            Debug.error({name: name}, 'Unable to config Morph. arg3 is not an object!');
            return;
        }
        if (typeof set !== "function") {
            Debug.error({name: name}, 'Unable to config Morph. arg4 is not a function!');
            return;
        }
        if (typeof ord !== "number") {
            Debug.error({name: name}, 'Unable to config Morph. arg2 is not a number!');
            return;
        }
        if (typeof apl !== "function") {
            Debug.error({name: name}, 'Unable to config Morph. arg5 is not a function!');
            return;
        }

        property = name;
        setter = set;
        applier = apl;
        ordering = ord;
        object = obj;

        valid = true;
    }

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', ['$AnimationHelper', 'Morphine', function Animation(AnimationHelper, Morphine) {

    var progress = 0,
        duration = null,
        easing = null,
        done = false,
        stack = null,
        morphine = null,
        target = null,
        stepsCb = null,
        queue = false,
        active = false,
        clear = null,
        stepTypeStr = 'type',
        completeTypeStr = 'complete',
        config = null;

    function Resolve(type) {
        if (type == stepTypeStr) {
            for (var i = 0; i < stack.length; i++) {
                if (stepsCb.hasOwnProperty(stack[i].morph.property())) {
                    stepsCb[stack[i].morph.property()].apply(target, [progress, stack[i].result]);
                }
            }
        }
        else if (type == completeTypeStr) {
            done = true;
            var results = {};
            for (var i = 0; i < stack.length; i++) {
                results[stack[i].morph.property()] = stack[i].result;
            }
            config.done(1, results);
            clear();
        }
    }

    this.target = function () {
        return target
    };

    this.queue = function () {
        return queue;
    };

    this.active = function () {
        return active;
    };

    this.done = function () {
        return done;
    };

    this.hasProperty = function (property) {
        var result = 0;
        for (var i = 0; i < stack.length; i++) {
            if (stack[i].morph.property() == property) {
                result = i + 1;
                break;
            }
        }
        return result;
    };

    this.properties = function () {
        var array = [];
        for (var i = 0; i < stack.length; i++) {
            array.push(stack[i].morph.property());
        }
        return array;
    };

    this.stop = function (property) {
        if (property) {
            var index = this.hasProperty(property);
            if (index) {
                index = index - 1;
                stack.splice(index, 1)
            }
        }
        else {
            stack = [];
        }
    };

    this.start = function () {

        active = true;

        var _stack = [];

        for (var i = 0; i < stack.length; i++) {
            var morph = stack[i].morph.get(stack[i].value);

            if (morph !== undefined && morph.start() !== false && morph.end() !== false) {
                _stack.push(stack[i]);
            }
        }

        stack = _stack;

        var tick_function = AnimationHelper.getTickFunction();

        morphine = Morphine.create(0, 1, function (complete, value) {
            if (stack.length == 0) {
                Resolve(completeTypeStr);
                morphine.stop();
            }
            else {
                for (var i = 0; i < stack.length; i++) {
                    stack[i].result = tick_function(value, stack[i].morph.start(), stack[i].morph.end());
                    stack[i].morph.apply(complete, stack[i].result);
                }

                Resolve(stepTypeStr);

                if (complete == 1) {
                    Resolve(completeTypeStr);
                }

            }
        }, easing, duration, 0);
    };

    this.config = function (t, m, cfg, f) {
        AnimationHelper.normalizeConfig(cfg);

        duration = cfg.duration;

        easing = cfg.easing;

        stepsCb = cfg.step;

        queue = cfg.queue;

        clear = f;

        stack = m;

        target = t;

        config = cfg;
    }
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', function AnimationHelper () {

    function TickVal(complete, start, end) {
        var locs = false, loce = false;
        if (typeof start == "function") locs = start();
        if (typeof end == "function") loce = end();

        if (start.constructor === Array) {
            var result = [];
            for (var i = 0; i < start.length; i++) {
                result.push(TickVal(complete, start[i], end[i]));
            }
        }
        else if (typeof start == 'object') {
            var result = {};
            for (var prop in start) {
                result[prop] = TickVal(complete, start[prop], end[prop]);
            }
        }
        else if (typeof start == 'number' || typeof start == 'function') {
            var endval     = loce === false ? end : loce;
            var startval   = locs === false ? start : locs;
            var difference = endval - startval;
            if (complete >= 1) {
                var value = endval;
            }
            else {

                var value = startval + (difference * complete);
            }
            var result = value;
        }
        return result;
    }

    this.normalizeConfig = function(config) {
        config.duration = typeof config.duration == "number" && config.duration > 0 ? config.duration : 1000;
        config.queue    = !!config.queue;
        config.step     = typeof config.step == "object" ? config.step : {};
        config.easing   = typeof config.easing == 'string' ? config.easing : 'linear';
        config.done     = typeof config.done === "function" ? config.done : function () {};
    };

    this.getTickFunction = function () {
        return TickVal;
    };

});
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', ['Debug', function Morph(Debug) {

    var property = null,
        setter = null,
        getter = null,
        applier = null,
        start, end,
        object = null,
        valid = false,
        ordering = 0;

    function SetStartValue(val) {
        start = val;
    }

    function SetEndValue(val) {
        end = val;
    }

    this.start = function () {
        return start;
    };

    this.end = function () {
        return end;
    };

    this.property = function () {
        return property;
    };

    this.ordering = function () {
        return ordering;
    };

    this.get = function (value) {
        setter.apply(object, [SetStartValue, SetEndValue, value]);
        return this;
    };

    this.valid = function () {
        return valid;
    };

    this.apply = function (progress, value) {
        object.style(property, applier.apply(object, [value, progress]));
    };

    this.config = function (name, obj, ord , set, apl) {
        if (typeof name !== "string") {
            Debug.error({name: name}, 'Unable to config Morph. arg1 [{name}] is not a string!');
            return;
        }
        if (typeof obj !== "object") {
            Debug.error({name: name}, 'Unable to config Morph. arg3 is not an object!');
            return;
        }
        if (typeof set !== "function") {
            Debug.error({name: name}, 'Unable to config Morph. arg4 is not a function!');
            return;
        }
        if (typeof ord !== "number") {
            Debug.error({name: name}, 'Unable to config Morph. arg2 is not a number!');
            return;
        }
        if (typeof apl !== "function") {
            Debug.error({name: name}, 'Unable to config Morph. arg5 is not a function!');
            return;
        }

        property = name;
        setter = set;
        applier = apl;
        ordering = ord;
        object = obj;

        valid = true;
    }

}]);
/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.part('Objects', function GraphicsBox() {

    var container = {
            size: [0, 0],
            position: [0, 0]
        },
        sprite = {
            margin: [0, 0, 0, 0],
            position: [0, 0],
            size: [0, 0]
        };

    this.get = function () {
        return {
            size: [container.size[0], container.size[1]],
            position: [container.position[0], container.position[1]]
        }
    };

    this.set = function (x, y, width, height, top, right, bottom, left) {
        container.size[0] = width;
        container.size[1] = height;
        container.position[0] = x;
        container.position[1] = y;
        sprite.margin[0] = top;
        sprite.margin[1] = right;
        sprite.margin[2] = bottom;
        sprite.margin[3] = left;
        sprite.size[0] = left + width + right;
        sprite.size[1] = top + height + bottom;
        sprite.position[0] = x - left;
        sprite.position[1] = y - top;
    };

    this.value = function () {
        return container;
    };
    this.sprite = function () {
        return sprite;
    };

});
/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.part('Objects', ['Canvas', '@app', '$MouseObjectFinder', function MouseEventDispatcher(Canvas, app, Finder) {
    var target = {
            current: null,
            previous: null
        },
        mousedown = {
            current: false,
            previous: false
        },
        cursor = {
            old: [0, 0],
            current: [0, 0]
        },
        drag = {
            start: [0, 0],
            current: [0, 0],
            delta: [0, 0]
        },
        checked = true,
        active = false,
        focused = false;

    Canvas.on('mousedown', function () {
        if (!active || !focused) return;
        mousedown.previous = mousedown.current;
        mousedown.current = true;
        checked = false;
    });
    Canvas.on('mouseup', function () {
        if (!active || !focused) return;
        mousedown.previous = mousedown.current;
        mousedown.current = false;
        checked = false;
    });
    Canvas.on('mousemove', function (e) {
        if (!active || !focused) return;
        cursor.current[0] = e.mouse.position[0];
        cursor.current[1] = e.mouse.position[1];
        checked = false;
    });

    Canvas.on('mouseleave', function () {
        focused = false;
    });

    Canvas.on('mouseenter', function () {
        focused = true;
    });

    function DefaultREvent(type, target) {
        var _type = type, propagate = true, _target = target, _originalTarget = target;
        this.type = function () {
            return _type;
        };

        this.date = new Date();

        this.stopPropagation = function () {
            propagate = false;
        };
        this.propagate = function () {
            return propagate;
        };
        this.target = function () {
            return _target;
        };
        this.propagated = function () {
            _target.$$PROPAGATIONSEARCH = true;
            var result = _originalTarget.$$PROPAGATIONSEARCH;
            delete _target.$$PROPAGATIONSEARCH;
            return result ? result : false;
        };
        this.originalTarget = function () {
            if (this.$$MOUSEPROPAGATIONSETTER) {
                var event = getEventByType(_type, _target);
                event.originalTarget.call({$$RESETTARGET: this.$$MOUSEPROPAGATIONSETTER});
                return event;
            }
            if (this.$$RESETTARGET) {
                _target = this.$$RESETTARGET;
            }
            return _originalTarget;
        }
    }

    function MouseEvent(type, target) {
        DefaultREvent.apply(this, [type, target]);
        this.cursor = [cursor.current[0], cursor.current[1]];
    }

    function DragEvent(type, target) {
        DefaultREvent.apply(this, [type, target]);
        this.drag = {
            start: [drag.start[0], drag.start[1]],
            current: [drag.current[0], drag.current[1]],
            delta: [drag.delta[0], drag.delta[1]]
        };
    }

    function getEventByType(type, target) {
        if (type == 'mousemove' || type == 'mouseleave'
            || type == 'mouseenter' || type == 'mousedown'
            || type == 'mouseup') {
            return new MouseEvent(type, target);
        }
        if (type == 'dragstart' || type == 'dragend' || type == 'dragmove') {
            return new DragEvent(type, target);
        }
    }

    function Dispatch(event, target) {

        var targetMouse = target.extension('Mouse');

        if (!targetMouse) return;

        if (targetMouse.hasEvent(event)) {
            targetMouse.resolve(target, event, getEventByType(event));
        }
    }

    function resolveEventByType(type) {
        if ((type == 'mouseenter' || type == 'drastart' || type == 'dragend' || type == 'dragmove' ||
            type == 'mousemove' || type == 'mouseup' || type == 'mousedown') && target.current) {
            Dispatch(type, target.current);
        }
        if (type == 'mouseleave' && target.previous) {
            Dispatch(type, target.previous);
        }
    }

    function DispatchEvents() {
        if (mousedown.current !== mousedown.old && mousedown.current) {
            resolveEventByType('mousedown');
        }

        if (cursor.old[0] !== cursor.current[0] || cursor.old[1] !== cursor.current[1]) {

            if (target.current && !target.previous) {
                resolveEventByType('mouseenter');
            }
            else if (!target.current && target.previous) {
                resolveEventByType('mouseleave');
            }
            else if (target.current && target.previous) {
                target.current.$$MOUSESEARCH = true;
                var result = false;

                if (!target.previous.$$MOUSESEARCH) result = true;
                delete target.current.$$MOUSESEARCH;

                if (result) {
                    resolveEventByType('mouseleave');
                    resolveEventByType('mouseenter');
                }
            }

            if (mousedown.current && mousedown.current !== mousedown.old) {
                drag.start[0] = cursor[0];
                drag.start[1] = cursor[1];
                resolveEventByType('dragstart');
            }
            else if (mousedown.current && mousedown.current == mousedown.old) {
                drag.current[0] = cursor[0];
                drag.current[1] = cursor[1];
                drag.delta[0] = drag.start[0] - drag.current[0];
                drag.delta[1] = drag.start[1] - drag.current[1];
                resolveEventByType('dragmove');
            }
            else if (!mousedown.current && mousedown.current !== mousedown.old) {
                drag.current[0] = cursor[0];
                drag.current[1] = cursor[1];
                drag.delta[0] = drag.start[0] - drag.current[0];
                drag.delta[1] = drag.start[1] - drag.current[1];
                resolveEventByType('dragend');
            }
            else if (!mousedown.current && mousedown.current == mousedown.old) {
                resolveEventByType('mousemove');
            }
        }

        if (mousedown.current !== mousedown.old && !mousedown.current) {
            resolveEventByType('mouseup');
        }

        target.previous = target.current;
        mousedown.old = mousedown.current;
        cursor.old[0] = cursor.current[0];
        cursor.old[1] = cursor.current[1];
    }

    function UpdateTargets() {
        target.previous = target.current;
        target.current = Finder.check(cursor.current);
    }

    var tick = false;

    function onAppTick() {
        tick = !tick;
        if (tick) {
            if (checked) return;
            UpdateTargets();
            DispatchEvents();
        }
    }

    app.$('tick', onAppTick);

    app.$on('start' , function () {
        active = true;
    });
    app.$on('stop', function () {
        active = false;
    });
    app.$on('error', function () {
        active = false;
    });
}]);
/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.part('Objects', ['$Tree', 'Debug', function MouseObjectFinder(Tree, Debug) {

    function CheckElement(e, cursor) {
        if (e.type() == 'Group') {
            var result = null,
                layers = e.extension('Layers');

            layers.forEach(function () {
                if (!this.disabled()) {
                    if (this.type() == 'Group') {
                        var _result = CheckElement(this, cursor);
                        if (_result) result = _result;
                    }
                    else {
                        var mouseext = this.extension('Mouse'),
                            _result = mouseext.check(this, cursor);

                        if (_result) {result = _result}
                    }
                }
            });
            return result;
        }
    }

    this.check = function (cursor) {
        var root = Tree.root();
        if (!root) return null;
        if (typeof cursor !== "object" || cursor.constructor !== Array || cursor.length !== 2 || typeof cursor[0] !== "number" || typeof cursor[1] !== "number") {
            Debug.warn({c: cursor}, 'ObjectFinder ; {[c]} is not a valid cursor value.');
            return null;
        }
        return CheckElement(root, cursor);
    }
}]);
/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.part('Objects', ['@extend', '@inject', '$DrawerHelper', function TextLineClass(extend, inject,DrawerHelper) {
    extend(this, '$TextElementClass');

    var width = 0,
        words = [],
        space = inject('$TextSpaceClass'),
        length = 0,
        widthUpdated = false;

    function getWidth() {
        if(widthUpdated) {
            width = 0;
            for (var i = 0; i < words.length; i++) {
                width += words[i].width();
            }
            widthUpdated = false;
            return width;
        }
        return width;
    }

    this.width = function () {
        return DrawerHelper.measureText(getWidth)
    };

    this.length = function () {
        return length;
    };

    this.words = function (array) {
        if (array && typeof array == "object" && array.constructor == Array) {
            for (var i = 0; i < array.length; i++) {
                words.push(array[i]
                    .size(this.size())
                    .height(this.height())
                    .style(this.style())
                    .weight(this.weight())
                    .color(this.color())
                    .font(this.font()));
            }
            length = words.length;
            var _arr = [];
            for (var i = 0; i < words.length; i++) {
                _arr.push(words[i]);
            }
            this.propertyChanged('string', _arr);
            return this;
        }
        widthUpdated = true;
        return words;
    };

    this.push = function (word) {
        if(words.length > 0) words.push(space);
        words.push(
            word.size(this.size())
            .height(this.height())
            .style(this.style())
            .weight(this.weight())
            .color(this.color())
            .font(this.font())
        );
        widthUpdated = true;
        return this;
    };

    this.string = function () {
        var string = '';

        for (var i = 0; i < words.length; i++) {
            string += words[i].string();
        }
        return string;
    };

    this.onPropertyChange(function (property, val) {
        if(property !== 'string') {
            space[property](val);
        }
    });

}]);
/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.part('Objects', ['@extend', '$DrawerHelper', function TextSpaceClass(extend, DrawerHelper) {
    extend(this,'$TextElementClass');

    var string = ' ',
        width = 0,
        self = this;

    function getWidth(context) {
        context.font = self.extractFontString();
        return context.measureText(string).width;
    }

    this.string = function () {
        return string;
    };

    this.width = function (context) {
        return DrawerHelper.measureText(getWidth);
    }
}]);
/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.part('Objects', ['$ColorHelper', function TextElementClass(ColorHelper) {
    var color = 'rgba(0,0,0,1)',
        font = 'sans-serif',
        fontWeight = 400,
        fontSize = 14,
        lineHeight = 14,
        fontStyle = 'normal',
        cb = [],
        self = this;

    function resolve(property, val) {
        for (var i = 0; i < cb.length; i++) {
            cb[i].apply(self, [property, val]);
        }
    }

    this.size = function (val) {
        if (typeof val == "number") {
            if (val < 0) val = 0;
            fontSize = val;
            resolve('size', fontSize);
            return this;
        }
        else {
            return fontSize;
        }
    };

    this.height = function (val) {
        if (typeof val == "number") {
            if (val < 0) val = 0;
            lineHeight = val;
            resolve('height', lineHeight);
            return this;
        }
        else {
            return lineHeight;
        }
    };

    this.weight = function (val) {
        if (typeof val == "number") {
            if (val < 100) val = 100;
            if (val > 900) val = 900;
            if (val % 100 !== 0) val = val - (val % 100);
            fontWeight = val;
            resolve('weight', fontWeight);
            return this;
        }
        return fontWeight;
    };

    this.font = function (val) {
        if (typeof val == "string" && val.length > 0) {
            font = val;
            resolve('font', font);
            return this;
        }
        return font;
    };

    this.color = function (val) {
        if (typeof val == "string") {
            if (ColorHelper.colorToArray(val)) {
                color = val;
                resolve('color', color);
            }
            return this;
        }
        return color;
    };

    this.style = function (val) {
        if (val === 'normal' || val === 'italic' || val === 'oblique') {
            fontStyle = val;
            resolve('style', fontStyle);
            return this;
        }
        return fontStyle;
    };

    this.extractFontString = function () {
        return fontStyle + ' ' + fontSize + 'px "' + font + '-' + fontWeight + '"';
    };

    this.onPropertyChange = function (func) {
        if (typeof func == "function") {
            cb.push(func);
        }
    };

    this.propertyChanged = function (name, val) {
        resolve(name, val);
    }

}]);
/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.part('Objects', ['$ColorHelper', '@extend', '$DrawerHelper', function TextWordClass(ColorHelper, extend, DrawerHelper) {

    extend(this, '$TextElementClass');

    var string = '',
        self = this;

    this.string = function (val) {
        if (typeof val === "string") {
            string = val;
            this.propertyChanged('string',val);
            return this;
        }
        return string;
    };

    function getWidth(context) {
        context.font = self.extractFontString();
        return context.measureText(string).width;
    }

    this.width = function () {
        return DrawerHelper.measureText(getWidth);
    };


    this.draw = function (context, x, y) {
        if (typeof x !== "number") x = 0;
        if (typeof y !== "number") y = 0;
        context.save();
        context.fillStyle = this.color();
        context.font = this.extractFontString();
        context.fillText(string, x, y);
        context.restore();

        return this;
    };

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@Canvas', '@HTMLRoot', '$$config', 'Debug', 'Container', function Canvas(canvas, html, config, Debug, Container) {

    var callbacks = [], width = 0, height = 0, xunits = 'px', yunits = 'px',
        offset = [0, 0], scroll = [0, 0];

    if (config) {
        var size = [config.width ? config.width : 1000, config.height ? config.height : 800];
        if (typeof size[0] == "number") {
            width = size[0];
        }
        else if (typeof size[0] == "string") {
            if (size[0].match(/^[\d]+%$/)) {
                width = parseInt(size[0]);
                xunits = '%';
            }
            else {
                width = 1000;
                xunits = 'px';
                Debug.warn({width: size[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
            }
        }
        else {
            width = 1000;
            Debug.warn({width: size[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
        }

        if (typeof size[1] == "number") {
            height = size[1];
        }
        else if (typeof size[1] == "string") {
            if (size[1].match(/^[\d]+%$/)) {
                height = parseInt(size[1]);
                yunits = '%';
            }
            else {
                height = 800;
                Debug.warn({height: size[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
            }
        }
        else {
            height = 800;
            Debug.warn({height: size[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
        }
    }

    var pW = 0, pH = 0;

    function GetParentSize() {
        canvas.element().setAttribute('width', 0);
        canvas.element().setAttribute('height', 0);
        var style = window.getComputedStyle(html.element(), null);
        pH = parseInt(style.getPropertyValue("height"));
        pW = parseInt(style.getPropertyValue("width"));
    }

    function CompareOnResize() {
        if (xunits == '%' || yunits == '%') {
            var _pW = pW, _pH = pH,
                change = false;

            GetParentSize();

            if (xunits == '%') {
                canvas.element().setAttribute('width', Math.floor(pW * (width / 100)));
                change = true;
            }
            if (yunits == '%') {
                canvas.element().setAttribute('height', Math.floor(pH * (height / 100)));
                change = true;
            }
            if (xunits == 'px') {
                canvas.element().setAttribute('width', width);
            }
            if (yunits == 'px') {
                canvas.element().setAttribute('height', height);
            }
            return change;

        }
        else {
            canvas.element().setAttribute('width', width);
            canvas.element().setAttribute('height', height);
            return false;
        }
    }

    function GetCanvasOffset(x) {
        var offsetProp = x ? 'offsetLeft' : 'offsetTop';

        var result = 0, element = canvas.element();

        do {
            if (!isNaN(element[offsetProp])) {
                result += element[offsetProp];
            }
        } while (element = element.offsetParent);

        return result;
    }

    function WindowResizeCallback() {
        if (CompareOnResize()) {
            offset[0] = GetCanvasOffset(0);
            offset[1] = GetCanvasOffset(1);
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](width, height);
            }
            ResolveCanvasEventArray('canvasresize', [new RCanvasResizeEvent()]);
        }

    }

    this.resize = function (func) {
        if (typeof func !== "function") return;

        callbacks.push(func);
    };

    this.width = function () {
        if (xunits == '%') {
            return pW * (width / 100);
        }
        else {
            return width;
        }

    };

    this.height = function () {
        if (xunits == '%') {
            return pH * (height / 100);
        }
        else {
            return height;
        }
    };

    var canvasEventCallbacks = {
        mousemove: [],
        mousedown: [],
        mouseup: [],
        mouseleave: [],
        mouseenter: [],
        canvasresize: []
    };

    function GetCanvasEventArray(event) {
        return canvasEventCallbacks[event];
    }

    function ResolveCanvasEventArray(event, data) {
        if (typeof data !== "object" || data.constructor !== Array) {
            Debug.warn({e: event}, 'Canvas : unable to resolve event array [{e}]. Data is not an array!');
            return;
        }

        var array = GetCanvasEventArray(event);

        if (!array) {
            Debug.warn({e: event}, 'Unable to resolve event [{e}] no such event!');
            return;
        }
        for (var i = 0; i < array.length; i++) {
            array[i].apply(canvas.element(), data);
        }
    }

    this.on = function (event, func) {
        var array = GetCanvasEventArray(event);
        if (!array) {
            Debug.warn({e: event}, 'Canvas : Unable to set event handler for event [{e}]');
            return;
        }
        if (typeof func !== "function") {
            Debug.warn({f: event}, 'Canvas : Unable to set event handler [{f}]');
        }
        array.push(func);
    };

    function GetMouseRelativePosition(e) {
        return [e.pageX - offset[0] - scroll[0], e.pageY - offset[1] - scroll[1]];
    }

    function RCanvasMouse(e) {
        this.page = [e.pageX, e.pageY];
        this.sceen = [e.pageX - scroll[0], e.pageY - scroll[1]];
        this.position = GetMouseRelativePosition(e);
    }

    function RCanvasMouseEvent(e) {
        this.original = e;
        this.type = e.type;
        this.mouse = new RCanvasMouse(e);
        this.canvas = canvas.element();
    }

    function RCanvasResizeEvent() {
        this.type = 'canvasresize';
        this.canvas = canvas.element();
        this.offset = [offset[0], offset[1]];
        this.size = [width, height];
        this.original = [width, height];
        this.units = [xunits, yunits];
        if (xunits == '%') {
            this.size[0] = pW * (width / 100);
        }
        if (yunits == '%') {
            this.size[1] = pH * (height / 100);
        }
    }

    canvas.element().addEventListener('mousemove', function (e) {
        ResolveCanvasEventArray('mousemove', [new RCanvasMouseEvent(e)]);
    });
    canvas.element().addEventListener('mousedown', function (e) {
        ResolveCanvasEventArray('mousedown', [new RCanvasMouseEvent(e)]);
    });
    canvas.element().addEventListener('mouseup', function (e) {
        ResolveCanvasEventArray('mouseup', [new RCanvasMouseEvent(e)]);
    });
    canvas.element().addEventListener('mouseleave', function (e) {
        ResolveCanvasEventArray('mouseleave', [new RCanvasMouseEvent(e)]);
    });
    canvas.element().addEventListener('mouseenter', function (e) {
        ResolveCanvasEventArray('mouseenter', [new RCanvasMouseEvent(e)]);
    });


    window.addEventListener('scroll', function () {
        scroll[1] = window.pageXOffset || document.documentElement.scrollLeft;
        scroll[0] = window.pageYOffset || document.documentElement.scrollTop;
    });

    window.addEventListener('resize', WindowResizeCallback);
    Container.on('hide', WindowResizeCallback);
    Container.on('show', WindowResizeCallback);

    WindowResizeCallback();
}

]);
/**
 * Created by Viktor Khodosevich on 5/31/2017.
 */
$R.ext(['@HTMLRoot', '$$config', 'Debug', function Container(html, config, Debug) {
    var element = html.element(),
        visible = false,
        blur = false,
        speed = 1000,
        easing = 'ease',
        cb = {
            show: [],
            hide: [],
            blurout: [],
            blurin: []
        },
        zindex = config.z && typeof config.z == "number" && config.z > 0 ? config.z : 0,
        container = this,
        displayTo = null;

    function resolve(event) {
        if (cb[event]) {
            for (var i = 0; i < cb[event].length; i++) {
                cb[event][i].call(container);
            }
        }
    }

    function hide() {
        style({display: false});
        displayTo = null;
    }

    element.style.transition = 'opacity ' + speed + 's ' + easing + ',' +
        'filter ' + speed + 's';

    element.style.zIndex = zindex;

    style({display: 'none', blur: 0, opacity: 0});

    function style(source) {
        if (source.display) {
            if (source.display === true) {
                html.show();
            }
            if (source.display === false) {
                html.hide();
            }
        }
        if (source.blur || source.opacity !== undefined) {
            setTimeout(function () {
                if (source.blur !== undefined) {
                    element.style.filter = 'blur(' + source.blur + 'px)';
                }
                if (source.opacity !== undefined) {
                    element.style.opacity = source.opacity;
                }
            }, 1);
        }
    }

    this.on = function (event, func) {
        if (typeof event == "string" && event.length > 0) {
            if (typeof cb[event] == "object" && cb[event].constructor === Array) {
                if (typeof func === "function") {
                    cb[event].push(func);
                }
                else {
                    Debug.warn({event: event}, 'Unable to set callback for [{event}]. Func is not a function');
                }
            }
            else {
                Debug.warn({event: event}, 'Unable to set callback for event [{event}]. No such event');
            }
        }
        else {
            Debug.warn('Unable to set event. Event identifier is not a string or empty');
        }
    };

    this.show = function () {
        if (!this.visible()) {
            if (displayTo) clearTimeout(displayTo);
            style({
                display: true,
                opacity: 1
            });
            visible = true;
            resolve('show');
        }
    };

    this.hide = function () {
        if (this.visible()) {
            if (displayTo) clearTimeout(displayTo);
            style({
                display: true,
                opacity: 0
            });
            displayTo = setTimeout(hide, speed * 1000);
            visible = false;
            resolve('hide');
        }
    };

    this.blur = function () {
        if (!this.blurred()) {
            style({blur: 5});
            blur = true;
        }
    };

    this.focus = function () {
        if (this.blurred()) {
            style({blur: 0});
            blur = false;
        }
    };

    this.visible = function () {
        return visible;
    };

    this.blurred = function () {
        return blur;
    };

    this.background = function (string) {
        if (typeof string === "string" && string.length) {
            element.style.background = string;
        }
    };

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['$$config', function Debug(config) {

    var string = '$R [Debug] : ',
        regexp = /{[a-zA-Z]+}/g,
        regexpname = /[a-zA-Z]+/g,
        warnings = config.warnings == undefined ? true : !!config.warnings;


    var errorCb = [], messageCb = [];

    function ResolveEvent(type, data) {
        var array = null;

        if (type == 'error') array = errorCb;
        if (type == 'message') array = messageCb;

        for (var i = 0; i < array.length; i++) {
            array[i](data);
        }
    }

    this.on = function (event, func) {
        if (typeof func !== "function") return;
        if (event == 'error') errorCb.push(func);
        if (event == 'message') messageCb.push(func);
    };


    function GetMessage(data, message) {
        message = message.toString();

        var matches = message.match(regexp);
        var props = {};

        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                var matchname = matches[i].match(regexpname)[0];
                if (matchname) props[matchname] = {
                    replace: matches[i],
                    data: data[matchname].toString()
                }
            }
        }
        for (var prop in props) {

            if (!props.hasOwnProperty(prop)) continue;

            message = message.replace(props[prop].replace, props[prop].data);
        }

        message = string + message;

        return message;
    }

    this.error = function (data, message) {
        if (typeof data == "string") {
            message = data;
            data = {};
        }

        message = GetMessage(data, message);

        ResolveEvent('error', message);

        throw new Error(message);
    };

    this.warn = function (data, message) {

        if (!warnings) return;

        if (typeof data == "string") {
            message = data;
            data = {};
        }
        message = GetMessage(data, message);

        ResolveEvent('message', message);

        console.warn(message)
    }
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['Debug', function Easings(Debug) {

    var easings = {
        '_': function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        linear: function (t, b, c, d) {
            t /= d;
            return b + c * (t);
        },
        linearSoft: function (t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (4 * tc * ts + -10 * ts * ts + 8 * tc + -2 * ts + t);
        },
        linearSoftOut: function (t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (-3 * tc * ts + 11 * ts * ts + -14 * tc + 6 * ts + t);
        },
        linearSoftIn: function (t, b, c, d) {
            var ts = (t /= d) * t;
            var tc = ts * t;
            return b + c * (-1 * tc * ts + 2 * tc);
        },
        easeInQuad: function (t, b, c, d) {
            var result = c * (t /= d) * t + b;
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }
    };

    this.get = function (name) {
        if (easings[name]) return easings[name];

        Debug.error({name: name}, 'Easings / Unable to get undefined easing [{name}]. Linear easing function provided.');
        return easings['linear'];
    };
}]);
/**
 * Created by Viktor Khodosevich on 5/11/2017.
 */
$R.ext(['@app', '@Canvas', '@inject', 'Debug',
        function Keyboard(app, canvas, inject, Debug) {

            var callbacks = {},
                active = false,
                enabled = true,
                focused = true,
                queue = [];

            this.keydown = function (code, func) {
                return this.on(code, 'keydown', func);
            };

            this.keyup = function (code, func) {
                return this.on(code, 'keyup', func);
            };

            this.disable = function () {
                enabled = false;
                return this;
            };

            this.enable = function () {
                enabled = true;
                return this;
            };

            this.on = function (code, event, func) {
                if (typeof code == "number" && typeof event == "string") {
                    if (event === 'keyup' || event === 'keydown') {
                        if (typeof func === "function") {
                            if (!callbacks[code]) callbacks[code] = {};
                            if (!callbacks[event]) callbacks[code][event] = [];
                            callbacks[code][event].push(func);
                        }
                        else {
                            Debug.warn('Event callback is not a function');
                        }
                    }
                    else {
                        Debug.warn({e: event}, 'No such type of event as [{e}]');
                    }
                }
                else {
                    Debug.warn({c: code}, 'Wrong key code [{c}]');
                }
                return this;
            };

            function OnAppTick() {
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
                queue = [];
            }

            function getQueueFunc(e) {
                return function () {
                    var keycode = e.keyCode;
                    if (callbacks[keycode] && callbacks[keycode][e.type]) {
                        for (var i = 0; i < callbacks[keycode][e.type].length; i++) {
                            var event = inject('$KeyboardEvent').build(e);
                            callbacks[keycode][e.type][i].apply(event, [keycode, e.type]);
                        }
                    }
                }
            }

            var canvasClicked = false;

            canvas.element().addEventListener('mousedown', function () {
                canvasClicked = true;
            });

            window.addEventListener('mousedown', function () {
                if (canvasClicked) {
                    focused = true;
                }
                else {
                    focused = false;
                }
                canvasClicked = false;
            });

            window.addEventListener('keydown', function (e) {
                if (!active || !enabled || !focused) return;
                queue.push(getQueueFunc(e));
            });
            window.addEventListener('keyup', function (e) {
                if (!active || !enabled || !focused) return;
                queue.push(getQueueFunc(e));
            });

            app.$on('start', function () {
                active = true;
            });
            app.$on('stop', function () {
                active = false;
            });
            app.$('tick', OnAppTick);
        }
    ]
);
/**
 * Created by Viktor Khodosevich on 5/11/2017.
 */
$R.part('Keyboard', [function KeyboardEvent() {

    var keycode = null,
        ctrlPressed = false,
        altPressed = false,
        shiftPressed = false,
        event = false,
        type = null;

    this.build = function (e) {
        keycode = e.keyCode;
        ctrlPressed = e.ctrlKey;
        altPressed = e.altKey;
        shiftPressed = e.shiftKey;
        event = e;
        type = e.type;
        delete this.build;
        return this;
    };

    this.type = function (string) {
        if(typeof string == "string") {
            return type === string;
        }
        else  return type;
    };

    this.code = function () {
        return keycode;
    };

    this.shift = function () {
        return shiftPressed;
    };
    this.alt = function () {
        return altPressed;
    };
    this.ctrl = function () {
        return ctrlPressed;
    };
    this.original = function () {
        return event;
    };
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@inject', 'Easings', '@app', 'Debug', function Morphine(inject, Easings, app, Debug) {

    var morphines = [];

    this.create = function (start, end, func, easing, duration, rpt) {

        if (typeof start !== "number" || typeof end !== "number") {
            Debug.error({}, 'Morphine / Unable to create. Start value is wrong!');
            return;
        }

        if (typeof func !== "function") {
            Debug.error({}, 'Morphine / Unable to create. End value is wrong!');
            return;
        }

        if (typeof easing !== "string") {
            Debug.error({}, 'Morphine / Unable to create. Easing is not a string!');
            return;
        }

        if (typeof  duration !== "number" || duration <= 0) {
            Debug.error({}, 'Morphine / Unable to create. Duration is less than 0 or not a number');
        }

        var efunc = Easings.get(easing);

        if (!efunc) {
            Debug.error({easing: easing}, ' Morphine / Unable to create. No such easing {easing}');
        }


        var morphine = inject('$Morphine');

        var tickF = morphine.config(start, end, func, duration, efunc, rpt);

        if (!tickF || typeof tickF !== "function") {
            Debug.error({}, 'Morphine / Unable to config morphine. Due to some error.');
            return;
        }

        tickF.$m = morphine;

        morphines.push(tickF);

        return morphine;

    };

    app.$('tick', function (date) {
        var date = date.getTime(),
            _morphines = [];

        for (var i = 0; i < morphines.length; i++) {
            if (!morphines[i].$m.done()) {
                morphines[i](date);
                _morphines.push(morphines[i]);
            }
        }
        morphines = _morphines;
    });
}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */

$R.part('Objects', ['@extend', '@inject', function Graphics(extend, inject) {

    var type = null,
        extensions = ['Cache', 'Style', 'Box', 'Animation', 'Matrix', 'Drawer', 'Layers', 'Tree', 'Mouse', 'Text'],
        resolved_extensions = {};

    this.extension = function (name) {
        return resolved_extensions[name];
    };

    this.type = function () {
        return type;
    };

    this.defineType = function (t) {
        if (typeof t !== "string") return;

        delete this.defineType;

        type = t;
        for (var i = 0; i < extensions.length; i++) {
            resolved_extensions[extensions[i]] = inject('$Extension');
            resolved_extensions[extensions[i]].defineObject(this);
            extend(resolved_extensions[extensions[i]], '$' + extensions[i] + 'ObjectExtension');
            if (resolved_extensions[extensions[i]].matchType(type)) {
                resolved_extensions[extensions[i]].wrap(this);
            }
            else {
                delete resolved_extensions[extensions[i]];
            }
        }
        extend(this, '$' + t + 'ObjectModel');
        extend(this, '$DefaultObjectDrawer');
        extend(this, '$' + t + 'ObjectDrawer');
        extend(this, '$DefaultObjectType');
        extend(this, '$' + t + 'ObjectClass');

    };

}]);
/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@inject', '$Tree', '@app', function Objects(inject, Tree, app) {

    function InjectByType(type) {
        var result = inject('$Graphics');

        result.defineType(type);

        return result;
    }

    this.group = function () {
        return InjectByType('Group');
    };

    this.line = function () {
        return InjectByType('Line');
    };

    this.rect = function () {
        return InjectByType('Rectangle');
    };

    this.circle = function () {
        return InjectByType('Circle');
    };

    this.image = function () {
        return InjectByType('Image');
    };

    this.sprite = function () {
        return InjectByType('Sprite');
    };

    this.text = function () {
        return InjectByType('Text');
    };

    this.area = function () {
        return InjectByType('Area');
    };

    this.group();

}]);
/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.ext(['@app', '@inject', 'Debug', function Resource(app, inject, Debug) {

    var all = [],
        container = {
            images: [],
            sprites: [],
            fonts: [],
            audios: []
        },
        loadCounter = 0,
        self = this,
        request = null;

    function GetResourceByURL(type, search) {
        if (type === 'font') search = search[0];

        var result = null,
            array = container[type + 's'];

        if (!array) return result;

        for (var i = 0; i < array.length; i++) {
            if (array[i].url() === search) {
                result = array[i];
                break;
            }
        }

        return result;
    }

    function InjectByType(type, src) {
        var existed = GetResourceByURL(type, src);
        if (existed) {
            return existed;
        }
        else {
            var _type = type;

            var result = inject('$' + type.charAt(0).toUpperCase() + type.slice(1));

            result.on('load', function () {
                loadCounter--;
                ResolveEvent('load', [this, loadCounter, all.length]);
            });

            result.on('error', function () {
                loadCounter--;
                ResolveEvent('error', [this, loadCounter, all.length]);
            });

            result.url(src);


            container[_type + 's'].push(result);

            all.push(result);

            loadCounter++;

            ResolveEvent('add', [result, loadCounter, all.length]);

            return result;
        }
    }

    this.image = function (src) {
        return InjectByType('image', src);
    };

    this.sprite = function (src) {
        return InjectByType('sprite', src);
    };

    this.audio = function (src) {
        return InjectByType('audio', src);
    };

    function preloadRequest(data) {
        if (data.images && data.images.constructor == Array) {
            for (var i = 0; i < data.images.length; i++) {
                if (typeof data.images[i] == "string") {
                    if (/^([./_\da-zA-Z]+)(\[(\d+)\])$/.test(data.images[i])) {
                        self.sprite(data.images[i]);
                    }
                    else {
                        self.image(data.images[i]);
                    }
                }

            }
        }
        if (data.audio && data.constructor == Array) {
            for (var i = 0; i < data.audio.length; i++) {
                if (typeof data.audio[i] == "string") {
                    self.audio(data.audio[i]);
                }
            }
        }
        if (data.fonts && data.fonts.constructor == Array) {
            for (var i = 0; i < data.fonts.length; i++) {
                if (data.fonts[i] && typeof data.fonts[i] == "object"
                    && typeof data.fonts[i].name == "string" && data.fonts[i].name.length) {

                    var weight = data.fonts[i].weight && typeof data.fonts[i].weight == "number" ?
                            data.fonts[i].weight : 400,
                        style = data.fonts[i].style == 'italic' ? data.fonts[i].style : 'normal';

                    self.font(data.fonts[i].name, weight, style);
                }
            }
        }
    }

    this.preload = function (config) {
        preloadRequest(config);
    };

    this.preloadByUrl = function (url) {
        if (request) request.abort();
        if (typeof url == "string" && url.length > 0) {
            request = new XMLHttpRequest();
            request.addEventListener('load', function () {
                var result = {};

                try {
                    result = JSON.parse(response.responseText);
                }
                catch (e) {
                    Debug.error({url: url}, 'Unable to parse JSON from [{url}]. Unknown response format.');
                }
                preloadRequest(result);
            });
            request.addEventListener('error', function () {
                Debug.error({url: url}, 'Unable to get resources from [{url}] to preload. Server error.');
                preloadRequest({});
            });
            request.addEventListener('abort', function () {
                Debug.warn({url: url}, 'Unable to get resources from [{url}] to preload. Request aborted.');
                preloadRequest({});
            });

            request.open('GET', url, true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send();
        }
    };

    this.font = function (src, weight, style) {
        return InjectByType('font', [src, weight, style]);
    };

    var cBContainer = {
        load: [],
        error: [],
        add: []
    };

    this.on = function (event, func) {
        if (typeof event == "string") {
            var array = cBContainer[event];
            if (array) {
                if (typeof func == "function") {
                    array.push(func);
                }
                else {
                    Debug.warn({event: event}, 'Unable to set event [{event}] callback. func is not a function!');
                }
            }
            else {
                Debug.warn({event: event}, 'Unable to set event [{event}]. No such event');
            }
        }
        else {
            Debug.warn('Unable to set event callback. Event name is not a string');
        }
    };

    this.off = function (event, func) {
        if (typeof event === "string") {
            var array = cBContainer[event];
            if (array) {
                if (typeof func == "function") {
                    var narray = [];
                    func.$$SEARCH = true;
                    for (var i = 0; i < array.length; i++) {
                        if (!array[i].$$SEARCH) {
                            narray.push(array[i])
                        }
                    }
                    delete func.$$SEARCH;
                    cBContainer[event] = narray;
                }
            }
            else {
                Debug.warn({event: event}, 'Unable to unset callback for event [{event}]. No such event');
            }
        }
        else {
            Debug.warn('Unable to unset event. Event is not a string');
        }
    };

    this.list = function () {
        return [].concat(container.images).concat(container.audios).concat(container.fonts).concat(container.sprites);
    };

    function ResolveEvent(type, data) {
        var array = cBContainer[type];
        if (!array) return;

        for (var i = 0; i < array.length; i++) {
            array[i].apply(self, data);
        }
    }

    app.$('tick', function (time) {
        time = time.getTime();
        for (var i = 0; i < container.sprites.length; i++) {
            if (container.sprites[i].ready() && container.sprites[i].loaded() == 1) {
                container.sprites[i].tick(time);
            }
        }
    });
}]);
/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.ext(['@audio', '@inject', 'Debug', function Sound(context, inject, Debug) {

    var destination = inject('$Audio').build('$$DESTINATION', 'destination'),
        sounds = {},
        soundcount = 0,
        channelcount = 0,
        channels = {
            $$DESTINATION: destination
        };

    this.sample = function (url, channel, name) {
        if (typeof url == "string" && url.length > 0) {
            if (sounds[url]) return sounds[url];
            if (typeof name !== "string" || name.length == 0) name = 'UserSound[' + soundcount + ']';
            soundcount++;
            var result = inject('$Audio').build(name, url);
            if (typeof channel !== "string" || channel.length == 0) channel = '$$DESTINATION';
            var out = this.channel(channel);
            result.connect(out);
            sounds[result.url()] = result;
            return result;
        }
        else {
            Debug.warn({url: url}, '[{url}] is not valid audio url or empty.');
        }
    };

    this.channel = function (name) {
        if (typeof name == "string" && name.length > 0) {
            if (channels[name]) return channels[name];

            var result = inject('$Audio').build(name);

            result.connect(destination);
            channels[name] = result;
            channelcount ++;
            return result;
        }
    };

    this.channels = function (byurl) {
        var list = {},
            byurl = !!byurl;

        for (var channel in channels) {
            if (channels.hasOwnProperty(channel)) {
                if (channel !== '$$DESTINATION') {
                    if (byurl) {
                        list[channel.url()] = channel[channel];
                    }
                    else {
                        list[channel] = channels[channel];
                    }

                }
            }
        }

        return list;
    };

    this.sounds = function (byurl) {
        var list = {},
            byurl = !!byurl;

        for (var prop in sounds) {
            if (sounds.hasOwnProperty(prop)) {
                if (byurl) {
                    list[prop] = sounds[prop];
                }
                else {
                    list[sounds[prop].name()] = sounds[prop];
                }
            }
        }

        return list;
    };

    this.destination = function () {
        return channels.$$DESTINATION;
    };


}]);
/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.ext(['@inject', function State(inject) {

    var states = {};


    function ParseAddress(address) {
        var result = address.match(/^([a-zA-Z]+).([a-zA-Z]+)$/),
            state = result[0],
            prop = result[1];

        if(state && prop) return {state : state, prop : prop};

    }


    this.watch = function (address, func) {

        if (typeof func !== "function") return;

        address = ParseAddress(address);

        if(!address) return;

        if(!states[address.state]) states[address.state] = inject('$State');

        states[address.prop].when(address.prop, func);

    };

    this.define = function (address, value) {

        address = ParseAddress(address);

        if(!address) return;

        if(!states[address.state]) states[address.state] = inject('$State');

        states[address.state].define(address.prop, value);
    };

}]); module.exports = $R;