$R.service.class('States', ['Debug', function State(Debug) {

    var states = {},
        emitter = null,
        target = null,
        self = this,
        state_string_regexp = /[A-Za-z-0-9]+/g;

    function isInState(state) {
        if (states[state]) {
            return states[state].value
        } else {
            Debug.error({
                state: state,
                target: target.constructor.name
            }, 'State {state} if {target} does not exist', target)
        }
    }

    function isBoundProperty(property) {
        return typeof states[property] !== undefined &&
            typeof states[property].bound === "object" &&
            states[property].bound.constructor === Array &&
            states[property].bound.length;
    }

    function getPropertyEventCallback(property, value) {
        return function () {
            setPropertyValue(property, value, true);
        }
    }

    function createProperty(property, value, enabler, disabler) {
        if (states[property] === undefined) {
            states[property] = {value: !!value};
            if (typeof enabler === "string" && enabler.length > 0) {
                enabler = enabler.match(state_string_regexp);
                if(enabler) {
                    if (!states[property].bound) states[property].bound = [];
                    for(var i = 0 ; i < enabler.length; i++) {
                        states[property].bound.push(enabler[i]);
                        emitter.on(enabler[i], getPropertyEventCallback(property, true));
                    }
                }else {
                    Debug.error({
                        enabler: typeof enabler,
                        disabler: typeof disabler,
                        property: property
                    }, 'Enabler is not a valid event string. Unable to create bound property {property} : enabler {enabler}, disabler - {disabler}', target);
                }
            }
            if (typeof disabler === "string" && disabler.length > 0) {
                disabler = disabler.match(state_string_regexp)[0];
                if (typeof disabler === "string" && disabler.length > 0) {
                    if (!states[property].bound) states[property].bound = [];
                    disabler = disabler.match(state_string_regexp);
                    if(disabler) {
                        if (!states[property].bound) states[property].bound = [];
                        for(var f = 0 ; f < disabler.length; f++) {
                            states[property].bound.push(disabler[f]);
                            emitter.on(disabler[f], getPropertyEventCallback(property, false));
                        }
                    }else {
                        Debug.error({
                            enabler: typeof enabler,
                            disabler: typeof disabler,
                            property: property
                        }, 'Disabler is not a valid event string. Unable to create bound property {property} : enabler {enabler}, disabler - {disabler}', target);
                    }
                } else {
                    Debug.error({
                        enabler: typeof enabler,
                        disabler: typeof disabler,
                        property: property
                    }, 'Disabler is not a valid event string. Unable to create bound property {property} : enabler {enabler}, disabler - {disabler}', target);
                }
            }
        }
    }

    function setPropertyValue(property, value, trusted) {
        if (typeof value === "boolean") {
            if (typeof states[property] === "object") {
                var is_bound = isBoundProperty(property);
                if (!is_bound || (is_bound && trusted)) {
                    states[property].value = value;
                } else {
                    Debug.error({
                        property: property,
                        value: value
                    }, 'Attempt to set state of bound property directly. Unable to set value {value} of property {property}.')
                }
            }
        } else {
            Debug.error({
                property: property,
                val: typeof value
            }, 'Unable to set {property} value as {val}. Must be boolean. ', target);
        }
    }

    this.decorate = function (object, event_emitter) {
        target = object;

        if (event_emitter) {
            emitter = event_emitter;

            this.create = function (property, value, enabler, disabler) {
                var matches = property.match(state_string_regexp);
                if (typeof value === "undefined") {
                    enabler = property;
                    value = false;
                }
                for (var i = 0; i < matches.length; i++) {
                    createProperty(matches[i], value, enabler, disabler);
                }
            };

            this.set = function (property, value) {
                var matches = property.match(state_string_regexp);

                if (matches && matches.length) {
                    for (var i = 0; i < matches.length; i++) {
                        setPropertyValue(matches[i], value);
                    }
                }
            };
        }

        target.is = function (state, strict) {
            if (this.$STATESPROTECTEDCONTEXT) {
                return self;
            }
            if (this.$STATESPROTECTEDHASEMITTERSET) {
                if (!event_emitter) {
                    emitter = state;
                }
                return self;
            }

            if (typeof state === "string") {
                var matches = state.match(state_string_regexp),
                    result;

                strict = typeof strict === "undefined" ? true : typeof strict === "boolean" ? strict : true;

                if (matches && matches.length) {
                    for (var i = 0; i < matches.length; i++) {
                        result = isInState(matches[i]);
                        if (strict && !result) break;
                        if (!strict && result) break;
                    }
                    return result;
                } else {
                    Debug.error({state: state}, 'Invalid state string. Unable to parse {state} and check state.', target);
                }
            }
            return isInState(state);
        };
        target.is.$$STATESPROTECTED = true;
        delete this.decorate;
        return this;
    }


}]);