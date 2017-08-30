/**
 * Created by Viktor Khodosevich on 25/08/2017.
 */
Core(function Helpers() {

    var helpers = {},
        sysHelpers = {};

    function helper(cfg) {
        try {
            var helper = Core.inject('Injection', [cfg]);
            if (helpers[helper.name()]) console.warn('helper [' + helper.name() + '] override.');
            helpers[helper.name()] = helper;
        }
        catch (e) {
            throw new Error('Unable to create Helper.');
        }
    }

    Core.define('helper', helper);

    helper.system = function (cfg, public) {
        try {
            var helper = Core.inject('Injection', [cfg]);
            if(sysHelpers[helper.name()]) console.warn('System Helper ['+helper.name()+'] Duplicate declaration override.');
            sysHelpers[helper.name()] = helper;
            if(public) {
                if(helpers[helper.name()]) {
                    console.warn('System Helper ['+helper.name()+'] overrides user helper. Skipped system helper.');
                }
                else {
                    helpers[helper.name()] = helper;
                }
            }
        }
        catch (e) {

        }
    }

    this.getSystemHelpers = function (defaults) {
        var container = Core.inject('Container', [sysHelpers]);
        container.source(container, '+');
        container.source(defaults, '@');
        return container;
    };

    this.getPublicHelpers = function (defaults) {
        var container = Core.inject('Container', [helpers]);
        container.source(container,'+');
        container.source(defaults, '@');
        return container;
    };

});