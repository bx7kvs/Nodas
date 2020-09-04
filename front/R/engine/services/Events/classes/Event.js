$R.service.class('Events', ['Debug', function Event(Debug) {

    var data = {
        type: undefined,
        props: {},
        target: null,
        event_time : new Date()
    };

    this.init = function (type, target, methods) {
        if (typeof type === "string") {
            data.type = type;
            if (typeof target === "object") {
                data.target = target;
                if (typeof methods === "object" && methods.constructor === Array) {
                    for (var i = 0; i < methods.length; i++) {
                        if (typeof methods[i].name === "string" && methods[i].name.length > 0) {
                            if (!this.hasOwnProperty(methods[i].name)) {
                                this[methods[i].name] = methods[i].bind(target);
                            } else {
                                Debug.error({
                                    type: type,
                                    name: methods[i].name
                                }, 'Duplicated method {name} for event {type}.', this);
                            }
                        } else {
                            Debug.error({type: type}, 'Unable to create method for event object {type}. Method must be a named function.', this);
                        }
                    }
                }
                if (typeof methods === "function") {
                    if (typeof methods.name == "string" && methods.name.length > 0) {
                        if (!this.hasOwnProperty(methods[i].name)) {
                            this[methods.name] = methods.bind(target);
                        } else {
                            Debug.error({
                                type: type,
                                name: methods.name
                            }, 'Duplicated method {name} for event {type}.', this);
                        }
                    } else {
                        Debug.error({type: type}, 'Unable to create method for event object {type}. Method function must be a named function.', this);
                    }
                }
            } else {
                Debug.error({
                    type: typeof target,
                    val: target
                }, 'Invalid Event target {type}{val. Must be an object}', this)
            }
        } else {
            Debug.error({type: typeof type, val: type}, 'Invalid type of event. {type}{val}. Must be string. ', this);
        }

        delete this.init;
    };

    this.time = function () {
        return data.event_time;
    }

    this.target = function () {
        return data.target;
    };

    this.type = function () {
        return data.type;
    };

}]);