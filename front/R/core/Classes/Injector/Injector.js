/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.injector(function Injector(manager) {
    var components = {},
        parts = {},
        tree = {};

    function createPart(component, dependancies) {
        if (typeof component == "string" && (typeof dependancies == "function" || (typeof dependancies == Array && dependancies.constructor == Array))) {

            dependancies = typeof dependancies == "function" ? [dependancies] : dependancies;

            var part = $R.create('InjectionContainer', ['part', $R.create('Injection', dependancies), component]),
                name = part.injection().name();

            if (name) {
                if (!parts[component]) parts[component] = {};

                parts[component][name] = part;
            }
        }
    }

    function createComponent(dependancies) {
        if (typeof dependancies == "function" || (typeof dependancies == "object" && dependancies.constructor == Array)) {

            if (typeof dependancies === "function") dependancies = [dependancies];

            var component = $R.create('InjectorContainer', ['component', $R.create('Injection', dependancies)]),
                name = component.injection().name();

            if (name) {
                if (!components[name]) components[name] = component;
            }
        }
    }

    function createApp(dependancies) {
        if (typeof dependancies == "function" || (typeof dependancies == "object" && dependancies.constructor == Array)) {
            if (typeof dependancies === "function") dependancies = [dependancies];

            var application = $R.create('InjectionContainer', ['application', $R.create('Injection', dependancies)]),
                name = application.injection().name();

            manager.add(application);
        }
    }

    this.part = createPart;

    this.component = createComponent;

    this.application = createApp;

});