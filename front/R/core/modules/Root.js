/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Root() {
    var apps = {},
        services = Core.get('Services'),
        classes = Core.get('Classes'),
        helpers = Core.get('Helpers');

    function createApplication(app) {
        var appContainer = Core.inject('Container', [apps[app]]),
            appTicker = Core.inject('Ticker'),
            appCanvas = Core.inject('Canvas', [appTicker]),
            appAudio = Core.inject('Audio', []),
            appConfig = Core.inject('Config', [app]),
            appFonts = Core.inject('Fonts', [appConfig, app]),
            appApi = Core.inject('Application', [appCanvas, appTicker, appConfig]);

        var defaultsLibrary = {};

        defaultsLibrary.Ticker = Core.inject('Injection', [appTicker, true]);
        defaultsLibrary.Canvas = Core.inject('Injection', [appCanvas, true]);
        defaultsLibrary.API = Core.inject('Injection', [appApi, true]);
        defaultsLibrary.Fonts = Core.inject('Injection', [appFonts, true]);
        defaultsLibrary.Config = Core.inject('Injection', [appConfig, true]);
        defaultsLibrary.Audio = Core.inject('Injection', [appAudio, true]);

        var appDefaults = Core.inject('Container', [defaultsLibrary]),
            appSysHelpers = helpers.getSystemHelpers(appDefaults),
            appPubHelpers = helpers.getPublicHelpers(appDefaults),
            appClasses = classes.getApplicationClasses(app),
            appSysClasses = classes.getSystemClasses(app),
            appServices = services.getApplicationServices(appSysHelpers, appSysClasses, appDefaults);

        appContainer.source(appServices, false);
        appContainer.source(appClasses, '.');
        appContainer.source(appPubHelpers, '+');
        appContainer.source(appDefaults, '@');
        for(var i = 0; i < appServices.length; i++) {
            var list = appServices[i].list();
            for(var l = 0 ; l < list.length; l++) {
                appServices[i].resolve(list[l]);
            }
        }
        appContainer.resolve(app);
        return appApi;
    }

    Core.define('app', function (cfg) {
        try {
            var application = Core.inject('Injection', [cfg]);
            if (apps[application.name()]) console.warn('Application [' + application.name() + '] override. Remove duplicates');
            apps[application.name()] = application;
        }
        catch (e) {
            console.error('Unable to register Application constructor.');
            throw e;
        }
    });

    Core.define('run', function (app) {
        if (typeof app === "string") {
            if (apps[app]) {
                return createApplication(app);
            }
            else {
                throw new Error('Application [' + app + '] not found.');
            }
        }
        else {
            throw new Error('Unable to get app. App Id is not a string');
        }
    });
});