/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.plugin('Objects',
    ['+Mouse', 'Debug',
        function Mouse(MouseHelper, Debug) {

            var callbacks = {
                    dragmove: [],
                    dragstart: [],
                    dragend: [],
                    mousemove: [],
                    mouseup: [],
                    mousedown: [],
                    mouseenter: [],
                    mouseleave: []
                },
                disabled = false,
                mouseCheckFunction = function () {
                    return false;
                };


            function GetEventArray(event) {
                return callbacks[event];
            }

            this.register('on', function (event, func) {
                if (typeof event === undefined && typeof func === undefined) {
                    for (var i in callbacks) {
                        callbacks[i].$OFF = false;
                    }
                    return this;
                }
                if (typeof event === "string" && func === undefined) {
                    var array = GetEventArray(event);

                    if (array) {
                        array.$OFF = false;
                    }

                    return this;
                }
                if (typeof event === "string" && typeof func === "function") {
                    var array = GetEventArray(event);
                    if (array) {
                        array.push(func);
                    }
                    else {
                        Debug.warn({e: event}, 'There is no event [{e}]')
                    }

                    return this;
                }

                if (!GetEventArray(event)) {
                    Debug.warn({e: event}, 'Unable to set event handler for {[e]}. No such event found!');
                    return this;
                }

                if (typeof  func !== "function") {
                    Debug.warn({e: event, f: func}, 'Unable to set event handler for {[e]}. {[f]} is not a function!');
                    return this;
                }
                return this;
            });

            this.register('off', function (event, func) {
                if (event === undefined && func === undefined) {
                    for (var i in callbacks) {
                        callbacks[i].$$OFF = true;
                    }
                    return this;
                }
                if (typeof event === "string" && func === undefined) {
                    var array = GetEventArray(event);
                    if (array) {
                        array.$$OFF = true;
                    }
                    return this;
                }
                if (typeof event === "string" && typeof func === "function") {
                    var array = GetEventArray(event);
                    func.$$MOUSEFUNCSEARCH = true;
                    if (array) {
                        var index = null;
                        for (var i = 0; i < array.length; i++) {
                            if (array[i].$$MOUSEFUNCSEARCH) {
                                index = i;
                                break;
                            }
                        }
                        if (index !== null) {
                            array.splice(index, 1);
                        }
                        return this;
                    }
                }

                if (!GetEventArray(event)) {
                    Debug.warn({e: event}, 'Unable to uset event handler for {[e]}. no such event');
                }
                if (typeof func !== "function") {
                    Debug.warn({e: event, f: func}, 'Unable to unset function {[f]} from event {[e]}. Not a function!');
                }
                return this;
            });

            this.register('mouseCheckFunction', function (func) {
                if (typeof func === "string") {
                    if (MouseHelper[func + 'CheckFunction']) {
                        mouseCheckFunction = MouseHelper[func + 'UserCheckFunction'];
                    }
                    return this;
                }
                if (typeof func !== "function") {
                    Debug.warn({f: func}, 'Unable to set check function! {[f]} is not a function!', this);
                    return this;
                }
                mouseCheckFunction = func;
                return this;
            });

            this.register('disable', function () {
                disabled = true;
                return this;
            });

            this.register('enable', function () {
                disabled = false;
                return this;
            });
            this.register('disabled', function () {
                return disabled;
            });

            this.check = function (target, cursor) {
                if (disabled) return false;
                return mouseCheckFunction.call(target, [cursor[0], cursor[1]]);
            };

            var cursorTransformFunction = null;

            this.cursorTransformFunction = function (func) {
                if (typeof func === "function") cursorTransformFunction = func;
            };

            this.applyCursorTransform = function (cursor) {
                if (cursorTransformFunction) {
                    return cursorTransformFunction.call(this, cursor);
                }
                else {
                    return cursor;
                }
            };

            this.hasEvent = function (event) {
                return callbacks[event];
            };

            this.propagate = function (target, eventObj) {
                var parent = target.parent();
                if (parent) {
                    var mouse = parent.extension('Mouse');
                    if (mouse.hasEvent(eventObj.type())) {
                        var type = eventObj.type(),
                            _eventObj = eventObj.originalTarget.call({$$MOUSEPROPAGATIONSETTER: parent});

                        mouse.resolve(parent, type, _eventObj);
                    }
                }
            };

            this.resolve = function (target, event, eventObj) {
                if (disabled) return;

                var array = GetEventArray(event);

                if (array) {
                    if (!array.$OFF) {
                        for (var i = 0; i < array.length; i++) {
                            array[i].call(target, eventObj);
                        }
                    }
                }
                if (eventObj.propagate()) {
                    this.propagate(target, eventObj);
                }
                else {
                    Debug.warn({e: event}, 'Unable to resolve event [{e}]. No such event!');
                }
            };

            for (var i in callbacks) {
                callbacks[i].$$OFF = false;
            }
            this.destroy(function () {
                var prop;
                for(prop in callbacks) {
                    if(callbacks.hasOwnProperty(prop)) {
                        while (callbacks[prop][0]) {
                            callbacks[prop].shift();
                        }
                        delete callbacks[prop];
                    }
                }
                disabled = undefined;
                mouseCheckFunction= undefined;
            })
        }
    ]
);
