$R.service.class('Api',
    [
        'Debug', 'Is', 'Events',
        function ApiController(Debug, Is, Events) {
            var methods = {},
                emitter = null,
                self = this;

            this.wrap = function (target) {
                if (typeof target.can !== "undefined") Debug.error({target: target.constructor.name}, 'Target method collision. {target} already has .can field');
                if (typeof target.do !== "undefined") Debug.error({target: target.constructor.name}, 'Target method collision. {target} already has .do field');
                emitter = Events.emitter(target);


                target.can = function (actionName) {
                    if(this.$$APIPROTECTED) return self;
                    if (!Is.properString(actionName)) Debug.error({
                        t: target.constructor.name,
                        n: typeof actionName
                    }, '{t}\'s Api method {name} check failed. ActionName is not a string', this);
                    return !!methods[actionName];
                };
                target.can.$$APIPROTECTED = true;


                target.api = function () {
                    var result = [];
                    for(var m in methods) {
                        result.push(methods);
                    }
                    return result;
                };
                target.do = function (action, payload) {
                    if (!Is.properString(action)) Debug.error({a: typeof action}, 'Invalid action parameter {a}. Action is not a string', this);
                    if (target.can(action)) {
                        Debug.info({n : action}, 'Processing {n}', target);
                        Debug.group(action);
                        for (var i = 0; i < methods[action].length; i++) {
                            methods[action][i].call(target, payload);
                        }
                        if (emitter) emitter.resolve(action, payload);
                        Debug.groupEnd();
                    } else Debug.warn({t: target.constructor.name, a: action}, '{t} can not perform action {a}.', target)
                };
                this.define = function (actionName, callback) {
                    if (!Is.properString(actionName)) Debug.error({n: typeof actionName}, 'Unable to define Api method {n}. Method name is not a string', this);
                    if (!target.can(actionName)) {
                        methods[actionName] = [];
                        Debug.info({n : actionName}, 'Added API method {n}', target);
                        emitter.register(actionName);
                    }
                    else {
                        Debug.info({n : actionName}, 'Added api callback method for {n}', target);
                    }
                    if (typeof callback === "function"){
                        methods[actionName].push(callback);
                    }
                };
            }
        }
    ]
);