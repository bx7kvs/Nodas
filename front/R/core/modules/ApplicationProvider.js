/**
 * Created by Viktor Khodosevich on 4/26/2017.
 */
$R.$(['@define', 'Injector', 'InjectionContainerProvider', function ApplicationProvider(define, Injector, Provider) {
    var extensions = Injector.extensions(),
        apps = Provider.container(),
        modules = {};

    apps.source(apps,'.');

    function getAppConstructor(constructor) {
        return function Application(arguments) {
            var appExts = extensions.clone();
        }
    }


    define('app', function (config) {
        if(typeof config == "function" && config.name) {
            apps.injection(getAppConstructor(config),[]);
        }
        else if(typeof config == "object" && config.constructor === Array) {
            apps.injection(config);
        }
        else {
            throw new Error('Invalid application injection config');
        }
    });
}]);