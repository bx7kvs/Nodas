/**
 * Created by Viktor Khodosevich on 25/08/2017.
 */
Core(function Classes() {
    var systemClasses = {},
        applicationClasses = {},
        globalClasses = {};


    function cls(cfg) {
        try {
            var injection = Core.inject('Injection', [cfg]);
            if (globalClasses[injection.name()]) console.warn('Global Class Library class [' + injection.name() + '] has been overwritten.');
            for (var app in applicationClasses) {
                if (applicationClasses.hasOwnProperty(app)) {
                    if (applicationClasses[app][injection.name()]) {
                        console.warn('Application [' + app + '] Class [' + injection.name() + '] overrides global class.');
                    }
                }
            }
            globalClasses[injection.name()] = injection;
        }
        catch (e) {
            throw new Error('Unable to create class injection.');
        }
    }

    cls.app = function (app, cfg) {
        if (typeof app === "string") {
            if (!applicationClasses[app]) applicationClasses[app] = {};
            try {
                var injection = Core.inject('Injection', [cfg]);
                if (globalClasses[injection.name()]) console.warn('Application [' + app + '] Class [' + injection.name() + '] overrides global class.');
                applicationClasses[app][injection.name()] = injection;
            }
            catch (e) {
                throw new Error('Unable to create and register ApplicationClass for app [' + app + '].');
            }
        }
        else {
            throw new Error('Unable to register ApplicationClass injection. App id is not a string.');
        }
    };

    cls.sys = function (cfg) {
        try {
            var injection = Core.inject('Injection', [cfg]);
            if (systemClasses[injection.name()]) console.warn('System Class [' + injection.name() + '] override.');
            systemClasses[injection.name()] = injection;
        }
        catch (e) {
            throw new Error('Unable to register SystemClass injection');
        }
    };


    this.getApplicationClasses = function (app) {
        if (typeof app === "string") {
            if (applicationClasses[app]) {
                var container = Core.inject('Container', [globalClasses]);
                container.source(container, '.');
                container.merge(applicationClasses);
                return container;
            }
            else {
                var container = Core.inject('Container', [globalClasses]);
                container.source(container, '.');
                return container;
            }
        }
        else {
            throw new Error('Unable to get application classes container. App id is not a string.');
        }
    };

    this.getSystemClasses = function () {
        var container = Core.inject('Container', [systemClasses]);
        container.source(container, '.');
        return container;
    };

    Core.define('class', cls);

});