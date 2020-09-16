/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.plugin('Objects',
    ['+Mouse', 'Debug',
        function Mouse(MouseHelper, Debug) {

            var self = this,
                disabled = false,
                mouseCheckFunction = function () {
                    return false;
                };

            this.object().events.register('dragmove dragstart dragend mousemove mouseup mousedown mouseenter mouseleave');


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
                return self.object().events.hasEvent(event);
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

            this.resolve = function (target, event, eventObj, forced) {
                if (disabled && !forced) return;
                self.object().events.resolve(event, eventObj, target)
            };
            this.destroy(function () {
                self = null;
                mouseCheckFunction = null;
            })
        }
    ]
);
