$R.service.class('Events', ['Debug', '@inject', function EventEmitter(Debug, inject) {

    var events = {},
        event_string_regexp = /[A-Za-z-0-9]+/g,
        emitter = this;

    function addCallback(target, event, once, cb) {
        if (events.hasOwnProperty(event)) {
            if (typeof cb === "function") {
                if (once) {
                    events[event].once.push(cb);
                } else {
                    events[event].push(cb);
                }
            } else if (typeof cb === "object" && cb.constructor === Array) {
                for (var i = 0; i < cb.length; i++) {
                    addCallback(target, event, once, cb[i]);
                }
            } else {
                Debug.error({
                    type: typeof cb,
                    event: event
                }, 'Callback is not a function. Unable to bind callback {type} to event {event}.', target)
            }
        } else {
            Debug.error({event: event}, 'Event not found. Unable to bind callback[s] to event {event}.', target);
        }
    }

    function removeCallback(target, event, cb) {
        if (events.hasOwnProperty(event)) {
            if (typeof cb === "function") {
                var _clearCbArray = [];
                for (var i = 0; i < events[event].length; i++) {
                    if (!events[event][i] === cb) {
                        _clearCbArray.push(events[event][i]);
                    }
                }
                _clearCbArray.methods = events[event].methods;
                _clearCbArray.once = events[event].once;
                events[event] = _clearCbArray;
            } else if (typeof cb === "object" && cb.constructor === Array) {
                for (var ci = 0; ci < cb.length; ci++) {
                    removeCallback(target, event, cb[ci]);
                }
            } else {
                Debug.error({type: typeof cb}, 'Callback is not a function. {tyoe} is not a function', target);
            }
        } else {
            Debug.warn({event: event}, 'Event not found. Unable to unbind {event} callback. ', target);
        }
    }

    function resolveEvent(target, event, event_target, payload) {
        if (events.hasOwnProperty(event)) {
            if (typeof event_target !== "object") {
                event_target = target;
            }

            var event_object = inject('$Event');

            payload = payload !== null && typeof payload === "object" && payload.constructor === Array ? payload : [payload];

            payload.unshift(event_object);

            event_object.init(event, event_target, events[event].methods);

            for (var i = 0; i < events[event].length; i++) {
                events[event][i].apply(event_target, payload);
            }
            while (events[event].once[0]) {
                events[event].once[0].apply(event_target, payload);
                events[event].once.shift();
            }
        } else {
            Debug.error({event: event}, 'Event {event} not found. Unable to resolve event', target);
        }
    }

    this.decorate = function (target) {

        if (typeof target === "object") {
            target.on = function (event, cb) {
                if(this.$$EMITTERPROTECTEDCONTEXT) {
                    return emitter;
                }
                if (typeof event === "string" && event.length > 0) {
                    var matches = event.match(event_string_regexp);
                    if (matches && matches.length) {
                        for (var i = 0; i < matches.length; i++) {
                            addCallback(target, matches[i], false, cb);
                        }
                    } else {
                        Debug.error({events: event}, 'Invalid event name value. Unable to subscribe to event[s] {events}.', target);
                    }
                }
            };
            target.on.$$EMITTERPROTECTED = true;

            target.once = function (event, cb) {
                if (typeof event === "string" && event.length > 0) {
                    var matches = event.match(event_string_regexp);
                    if (matches && matches.length) {
                        for (var i = 0; i < matches.length; i++) {
                            addCallback(target, matches[i], true, cb);
                        }
                    } else {
                        Debug.error({events: event}, 'Invalid event name value. Unable to subscribe to event[s] {events}.', target);
                    }
                }
            };

            target.off = function (event, cb) {
                if (typeof event === "string" && event.length > 0) {
                    var matches = event.match(event_string_regexp);
                    if (matches && matches.length) {
                        for (var i = 0; i < matches.length; i++) {
                            removeCallback(target, matches[i], cb);
                        }
                    } else {
                        Debug.warn({event: event}, 'Unable to unbind callback[s] from event[s] {event}. Invalid event name', target);
                    }
                }
            };

            this.target = function () {
                return target;
            };

            this.on = function () {
                target.on.apply(target, arguments);
            };

            this.once = function () {
                target.once.apply(target, arguments);
            };

            this.off = function () {
                target.off.apply(target, arguments);
            };

            this.proxy = function (foreign_emitter, event, foreign_event, payload) {
                this.on(event, function () {
                    foreign_emitter.resolve(foreign_event, payload);
                });
            };

            this.resolve = function (event, payload, event_target) {
                if (typeof event === "string" && event.length > 0) {
                    var matches = event.match(event_string_regexp);
                    if (matches && matches.length) {
                        if (!event_target) {
                            event_target = target;
                        }
                        for (var i = 0; i < matches.length; i++) {
                            resolveEvent(target, matches[i], event_target, payload);
                        }
                    } else {
                        Debug.error({event: event}, 'Unable to resolve event {event}. Invalid event name', target);
                    }
                }
            };

            this.register = function (event, methods) {
                if (typeof event === "string") {
                    var matches = event.match(event_string_regexp);
                    for(var m = 0 ; m < matches.length; m++) {
                        if (!events.hasOwnProperty(matches[m])) {
                            events[matches[m]] = [];
                            events[matches[m]].once = [];

                            if (typeof methods === "function") {
                                events[matches[m]].methods = [methods];
                            }

                            if (typeof methods === "object" && methods.constructor === Array) {
                                events[matches[m]].methods = [];

                                for (var i = 0; i < methods.length; i++) {
                                    if (typeof methods[i] === "function") {
                                        events[matches[m]].methods.push(methods[i]);
                                    }
                                }
                            }
                        } else {
                            Debug.error({event: matches[m]}, 'Duplicate event name. Unable to create event {event}. Event already exists.', target)
                        }
                    }

                }
                return this;
            };

            this.hasEvent = function (event) {
                return !!events[event];
            }

            this.clear = function () {
                for (var event in events) {
                    delete events[event];
                }
            };

            delete this.decorate;
            return this;
        } else {
            Debug.error({type: target}, 'Unable to decorate object {type}. Target is not an object.', this);
        }

    };


}]);
