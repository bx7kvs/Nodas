/**
 * Created by bx7kv_000 on 12/15/2016.
 */
(function () {
    function $R() {

        var registered = {
                apps: {},
                exts: {},
                parts: {},
                mods: {}
            },
            resolved = {
                apps: {},
                exts: {},
                parts: {},
                mods: {}
            },

            ready_apps = {},

            canvas = null,
            audio = new AudioContext(),
            renderer = null,
            framereset = true,
            fps = null,
            ext_config = null,
            htmlroot = null;

        function error(message) {
            throw new Error('[$R] Core Panic! ' + message);
        }


        function Injection(type, contr, app, ext) {
            var dependancies = null,
                constructor = null,
                name = null,
                valid = false,
                _type = null;

            this.create = function (args, app_name, direct) {

                if (!valid) {
                    error('Corrupted injection!');
                    return false;
                }


                args.unshift(null);

                var result = new (Function.prototype.bind.apply(constructor, args));

                if (direct) return result;


                if (_type == 'app') {
                    resolved[_type + 's'][name] = result;
                }
                else if (_type == 'part') {
                    if (!resolved[_type + 's'][app_name]) resolved[_type + 's'][app_name] = {};
                    if (!resolved[_type + 's'][app_name][ext]) resolved[_type + 's'][app_name][ext] = {};
                    resolved[_type + 's'][app_name][ext][name] = result;
                }
                else {
                    if (!resolved[_type + 's'][app_name]) resolved[_type + 's'][app_name] = {};
                    resolved[_type + 's'][app_name][name] = result;
                }

                return result;
            };

            this.valid = function () {
                return valid;
            };

            this.app = function () {
                if (!valid) return false;
                return app;
            };

            this.ext = function () {
                return ext;
            };

            this.resolved = function (appname) {

                if (!valid) return false;

                if (_type == 'app') {
                    return resolved[_type + 's'][appname];
                }
                if (_type == 'part') {
                    if (
                        !resolved[_type + 's'][appname] || !resolved[_type + 's'][appname][ext]
                    ) return;

                    return resolved[_type + 's'][appname][ext][name]
                }
                if (_type == 'mod') {
                    if (!resolved[_type + 's'][app]) return;

                    return resolved[_type + 's'][app][name];
                }
                else {
                    if (!resolved[_type + 's'][appname]) return;

                    return resolved[_type + 's'][appname][name];
                }
            };

            this.name = function () {
                if (!valid) return false;
                return name;
            };

            this.type = function () {
                if (!valid) return false;
                return _type;
            };

            this.dependancies = function () {
                if (!valid) return false;
                return dependancies
            };

            this.inject = function (injection, app) {

                var container = null;

                if (this.type() == 'part') container = registered.parts[ext];
                if (this.type() == 'ext') container = registered.parts[name];
                if (this.type() == 'mod') container = registered.mods[app];

                if (!container) {
                    error('Unable to inject! parts and modules can only inject directly and only parts and modules accordingly!');
                    return;
                }

                if (!container[injection]) {
                    error('Unable to find ' + this.type() + '[' + injection + ']');
                    return;
                }

                return ResolveInjection(container[injection], app, true, '$$direct_injection');

            };

            this.extend = function (object, injection, app) {
                var container = null;

                if (this.type() == 'part') container = registered.parts[ext];
                if (this.type() == 'mod') container = registered.mods[app];

                if (!container) {
                    error('Unable to inject! parts and modules can only extend directly and only parts and modules accordingly!');
                    return;
                }

                if (!container[injection]) {
                    error('Unable to find ' + this.type() + '[' + injection + ']');
                    return;
                }

                var extension = container[injection].extract(app);

                extension.const.apply(object, extension.deps);

            };

            this.extract = function (app) {
                return {
                    deps: ResolveInjection(this, app, false, true),
                    const: constructor
                }
            };

            this.$constructor = function () {
                return constructor;
            };

            this.is = function (type, name, object) {
                if (typeof type !== "string" || typeof name !== "string") return false;

                var result = null;

                if (type == 'part') result = registered[type + 's'][ext][name];
                if (type == 'ext') result = registered[type + 's'][name];
                if (type == 'mod') result = registered[type + 's'][app][name];

                if (result) {
                    return result.$constructor === object.constructor;
                }
                else {
                    return false;
                }

            };


            if (typeof contr == "function") {
                dependancies = [];
                constructor = contr;
                name = constructor.name;
            }

            else if (contr.constructor == Array) {
                for (var i = 0; i < contr.length; i++) {
                    if (typeof contr[i] == "function") {
                        if (!constructor) {
                            constructor = contr[i];
                            name = constructor.name;
                        }
                        else {
                            error('constructor function already defined!');
                        }
                    }
                    else if (typeof  contr[i] == "string") {
                        if (!dependancies) dependancies = [];

                        dependancies.push(contr[i]);
                    }
                    else {
                        error('Unknown type of injection!');
                    }
                }
            }

            if (constructor && !dependancies) dependancies = [];

            if (type == 'app' || type == 'mod' || type == 'part' || type == 'ext') {
                _type = type;
            }
            else {
                error('Unknown Type of injection [' + _type + ']');
            }
            if (constructor && name && _type && dependancies) {

                if (_type == 'app') {
                    app = name;
                    valid = true;
                }
                else if (typeof app == "string" && app.length !== 0) {
                    valid = true;
                }
                else if (_type == 'part') {
                    if (typeof ext == "string" && ext.length > 0) {
                        valid = true
                    }
                    else {
                        valid = false;
                    }
                }
                else if (_type == 'ext') {
                    valid = true
                }
                else {
                    valid = false;
                }


                if (valid) {
                    if (type == 'app' || type == 'ext') {
                        registered[_type + 's'][name] = this;
                    }
                    else if (type == 'part') {
                        if (!registered[_type + 's'][ext]) registered[_type + 's'][ext] = {};
                        registered[_type + 's'][ext][name] = this;
                    }
                    else {
                        if (app && typeof app == 'string') {
                            registered[_type + 's'][app][name] = this;
                        }
                    }
                }
                else {
                    error('Invalid injection ' + type + '[' + name + ']');
                }


            }
            else {
                error('Unable to register injection ' + _type + '[' + name + ']');
            }

        }

        function Renderer() {

            var apps = {}, fps = null, ticktime = null, ticker = null, ctx = null,
                tickargs = [0, canvas];

            function TickFunction() {

                if (framereset) ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                tickargs[0] = new Date();

                for (var order in apps) {
                    if (!apps.hasOwnProperty(order)) continue;

                    for (var i = 0; i < apps[order].length; i++) {
                        apps[order][i].tick.apply(apps[order][i], tickargs)
                    }
                }
            }

            this.enqueue = function (app, ordering) {
                if (app.constructor == App) {
                    if (!apps[ordering]) apps[ordering] = [];
                    apps[ordering].push(app);
                }
            };

            this.dequeue = function (app) {
                var _apps = [];

                for (var order in apps) {
                    if (!apps.hasOwnProperty(order)) continue;

                    if (!_apps[order]) _apps[order] = [];

                    for (var running = 0; running < apps[order].length; running++) {
                        if (apps[order][running].name() !== app.name()) {
                            _apps[order].push(apps[order][running]);
                        }
                        else {
                            console.log('app ' + app.name() + ' dequeued!');
                        }
                    }
                }
                apps = _apps;
            };

            this.fps = function (number) {
                if (typeof number == "number" && number > 0) {
                    fps = number;
                    ticktime = 1000 / fps;
                }
                if (ticker) {
                    this.restart();
                }

            };

            this.restart = function () {
                this.stop();
                this.run();
            };

            this.stop = function () {
                if (ticker) {
                    clearInterval(ticker);
                    ticker = null;
                }
            };

            this.run = function () {
                if (!ctx) ctx = canvas.getContext('2d');

                if (ticktime && typeof ticktime == "number" && ticktime > 16) {
                    if (!ticker) ticker = setInterval(TickFunction, ticktime);
                }
            }
        }


        function App(dependancies) {

            var active = false, _resolved = false, _error = false, _ordering = 0,
                _ontick = [], _onstop = [], _onrun = [],
                _app = new Injection('app', dependancies),
                _name = _app.name(), appRootHTML = null;


            function ResolveEventArray(type, data) {

                var array = getEventArray(type);

                if (!array) return;

                for (var i = 0; i < array.length; i++) {

                    array[i].apply(resolved.apps[_name], data);
                }
            }

            function getEventArray(event) {

                if (event == 'tick') return _ontick;
                if (event == 'stop') return _onstop;
                if (event == 'run') return _onrun;

                if (!event) {
                    error('Wrong Event type!');
                }
            }

            this.name = function () {
                return _app.name();
            };

            this.run = function (ordering) {
                if (_error) return;
                if (active) return;
                this.resolve();
                active = true;
                ResolveEventArray('run', []);
                _ordering = ((!ordering && ordering !== 0) || typeof ordering !== "number") ? _ordering : ordering;
                renderer.enqueue(this, _ordering);
            };

            this.resolve = function () {
                if (!_resolved) {
                    appRootHTML = document.createElement('div');

                    appRootHTML.setAttribute('style', 'user-select:none; -webkit-userselect:none; -moz-userselect:none;position:absolute;width:100%;height:100%;left:0;top :0;');

                    htmlroot.appendChild(appRootHTML);

                    _resolved = true;

                    for (var ext in registered.exts) {
                        ResolveInjection(registered.exts[ext], this);
                    }

                    return ResolveInjection(_app, this);
                }
            };

            this.stop = function () {
                if (!active || _error) return;
                active = false;
                renderer.dequeue(this);
                ResolveEventArray('stop', []);
            };

            this.active = function () {
                return _error ? false : active;
            };

            var tickargs = [null, null];

            this.tick = function (date, canvas) {
                if (!active || _error) return;

                tickargs[0] = date;
                tickargs[1] = canvas;
                ResolveEventArray('tick', tickargs);
            };

            this.on = function (event, func) {

                var array = getEventArray(event);

                if (!array) {
                    error('No such event to be bent to!');
                    return;
                }

                array.push(func);

            };

            this.html = function (element) {
                appRootHTML.appendChild(element);
            };

            if (!_name) {
                error('Can not resolve application name!');
            }
            else {
                if (!ready_apps[_name]) ready_apps[_name] = this;
            }
        }

        function TrimFirstChar(str) {
            return str.slice(0, 0) + str.slice(1);
        }

        function ResolveInjection(injection, app, ondemand, extraction) {
            if (!injection) {
                error('Can not resolve undefined Injection!');
            }

            if (!injection.valid()) {
                error('Can not resolve invalid injection!');
                return;
            }

            var already_resolved = (ondemand || extraction) ? false : injection.resolved(app.name());

            if (already_resolved) return already_resolved;

            if (ondemand && extraction == '$$direct_injection') ondemand = false;

            var dependancies = injection.dependancies(), type = injection.type(), _result = [];

            for (var i = 0; i < dependancies.length; i++) {

                var _target = null, modname = null;

                if (dependancies[i].charAt(0) == '$') {
                    if (type == 'ext') {
                        _target = registered.parts[injection.name()];
                        modname = TrimFirstChar(dependancies[i]);
                    }
                    else if (type == 'mod' || type == 'app') {
                        _target = registered.mods;
                        modname = TrimFirstChar(dependancies[i]);
                    }
                    else if (type == 'part') {

                        if (registered.parts[injection.ext()]) {
                            _target = registered.parts[injection.ext()];
                            modname = TrimFirstChar(dependancies[i]);
                        }
                        else {
                            error('Unable to inject part[' + dependancies[i] + '] into part[' + injection.name() + ']');
                        }

                    }
                    else {
                        error('Unknown type of injection');
                        _result.push(undefined);
                        continue;
                    }
                }
                else if (dependancies[i] == '@inject') {
                    if (type == 'mod' || type == 'part' || type == 'ext') {
                        _result.push(function (name) {
                            return injection.inject(name, app);
                        });
                        continue;
                    }
                    else {
                        _result.push(undefined);
                        error('Unable to inject Injector function! Impossible for [' + injection.type() + ']!');
                        continue;
                    }
                }
                else if(dependancies[i] == '@audio') {
                    _result.push(audio);
                    continue;
                }
                else if (dependancies[i] == '@extend') {
                    if (type == 'mod' || type == 'part' || type == 'ext') {
                        _result.push(function (object, name) {
                            return injection.extend(object, name, app);
                        });
                        continue;
                    }
                    else {
                        _result.push(undefined);
                        error('Unable to inject Injector function! Impossible for [' + injection.type() + ']!');
                    }
                }
                else if (dependancies[i] == '@is') {
                    _result.push(function () {
                        return injection.is.apply(injection, arguments)
                    });
                }
                else if (dependancies[i] == '@app') {
                    if (type !== 'mod') {
                        _result.push(app);
                    }
                    else {
                        _result.push(undefined);
                        error('Modules are not allowed to inject app!');
                    }
                    continue;
                }
                else if (dependancies[i] == '@canvas') {
                    if (type == 'ext') {
                        _result.push(canvas);
                        continue;
                    }
                    else {
                        _result.push(undefined);
                        error('Unable to inject canvas into [' + injection.type() + ']');
                        continue;
                    }
                }
                else if (dependancies[i] == '@html') {
                    if (type == 'ext') {
                        _result.push(app.html);
                        continue;
                    }
                    else {
                        _result.push(undefined);
                        error('Unable to inject html function into [' + injection.type() + ']');
                        continue
                    }
                }
                else if (dependancies[i] == '@config') {
                    if (type == 'ext') {
                        _result.push(ext_config.extract(injection.name()));
                        continue;
                    }
                    else {
                        _result.push(undefined);
                        error('Unable to inject config into injection type[' + injection.type() + '] only type[ext] allowed');
                    }
                }
                else if (dependancies[i].charAt(0) == '.') {
                    if (type == 'app') {
                        var appname = TrimFirstChar(dependancies[i]);

                        if (!resolved.apps[appname]) {
                            if (ready_apps[appname]) {
                                _result.push(ready_apps[appname].resolve());
                                continue
                            }
                            else {
                                error('Application ' + appname + ' was not found!');
                            }
                        }
                        else {
                            _result.push(resolved.apps[appname]);
                            continue;
                        }
                    }
                }
                else {

                    if (type == 'app' || type == 'ext' || type == 'mod') {
                        _target = registered.exts;
                        modname = dependancies[i];
                    }
                    else if (type == 'part') {
                        var ext = injection.ext();

                        if (dependancies[i] !== ext) {
                            _target = registered.exts;
                            modname = dependancies[i];
                        }
                        else {
                            error('Unable to inject extension [' + dependancies[i] + '] into it\'s own part! [' + injection.name() + ']');
                            _result.push(undefined);
                            continue;
                        }
                    }
                    else {
                        error('Parts are not allowed to inject Extensions!');
                        _result.push(undefined);
                        continue;
                    }
                }

                if (_target && modname && _target[modname]) {
                    _result.push(ResolveInjection(_target[modname], app, ondemand));
                }
                else {
                    error('Unable to resolve injection [' + dependancies[i] + '] into ' + injection.name() + '.');
                    _result.push(undefined);
                }

            }

            if (extraction && extraction !== '$$direct_injection') {
                return _result;
            }
            else {
                if (extraction == '$$direct_injection') {
                    return injection.create(_result, app.name(), true);
                }
                else {
                    return injection.create(_result, app.name(), ondemand);
                }
            }

        }

        this.app = function (constructor) {
            new App(constructor);
        };
        this.part = function (ext, constructor) {
            if (!ext || typeof  ext !== "string" || ext.length == 0) {
                error('Unable to bind part to extension! ext is undefined!')
            }
            new Injection('part', constructor, null, ext);
        };
        this.mod = function (app, constructor) {
            new Injection('mod', constructor, app);
        };
        this.ext = function (constructor) {
            new Injection('ext', constructor);
        };

        var startApps = ['Loader'];

        function Config(config) {
            var config = config.config ? config.config : {};

            this.extract = function (name) {
                if (name && typeof name == "string") {
                    return config[name];
                }
            }
        }

        this.config = function (config) {
            if (!config || typeof config !== "object") {
                error('Unable to set config');
                return;
            }
            else {
                if (!config.apps || config.apps.constructor !== Array || config.apps.length == 0) {
                    error('config apps property is not an array or empty!');
                    return
                }
                else {
                    startApps = startApps.concat(config.apps);
                }
            }

            if (canvas) {
                error('Canvas already configured!');
                return;
            }
            else if (!config.canvas || typeof config.canvas !== 'string') {
                error('config.canvas in undefined or not a string!');
            }
            else {
                canvas = config.canvas
            }


            if (!config.fps || typeof config.fps !== "number") {
                error('config.fps not a number or undefined!');
            }
            else {
                fps = config.fps
            }

            framereset = typeof config.framereset !== "boolean" ? true : config.framereset;

            ext_config = new Config(config);
        };

        document.addEventListener('DOMContentLoaded', function () {

            if (canvas) {
                canvas = document.getElementById(canvas);
                if (canvas) {
                    var parent = canvas.parentNode,
                        wrapper = document.createElement('div');
                    wrapper.setAttribute('style', 'position:fixed; overflow:hidden; left:0; top:0; width:100%; height:100%;');
                    wrapper.setAttribute('class', '$R-root-node');
                    wrapper.appendChild(canvas);
                    parent.appendChild(wrapper);
                    htmlroot = wrapper;
                    canvas.setAttribute('style', 'position:relative; z-index:1;');
                }
            }

            renderer = new Renderer();

            renderer.fps(fps);


            for (var i = 0; i < startApps.length; i++) {
                if (ready_apps[startApps[i]]) {
                    ready_apps[startApps[i]].run(i);
                }
                else {
                    error('Application [' + startApps[i] + '] not found. Skip.');
                }
            }

            renderer.run();

        });
    }

    window.$R = new $R();
})();