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
                    if (typeof value[prop] == "string" || typeof value[prop] == "number" || typeof [prop] == "boolean") {
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