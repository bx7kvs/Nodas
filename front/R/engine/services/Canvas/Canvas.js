/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service(
    ['@Canvas', '@Config', 'Debug',
        function Canvas(Canvas, Config, Debug) {
            var callbacks = [], width = 0, height = 0, dimms = [0, 0], xunits = 'px', yunits = 'px',
                offset = [0, 0], scroll = [0, 0], output = Canvas.element(), self = this;

            Config.define(
                'size',
                [0, 0],
                {
                    isArray: true,
                    custom: function (v) {
                        if ((typeof v[0] === "string" || typeof v[0] === Array)
                            &&
                            (typeof v[0] === "string" || typeof v[1] === "number")) {
                            return true;
                        }
                    }
                })
                .watch(
                    function (v) {
                        if (typeof v[0] === "number") {
                            width = v[0];
                        }
                        else if (typeof v[0] === "string") {
                            if (v[0].match(/^[\d]+%$/)) {
                                width = parseInt(v[0]);
                                xunits = '%';
                            }
                            else {
                                width = 1000;
                                xunits = 'px';
                                Debug.warn({width: v[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
                            }
                        }
                        else {
                            width = 1000;
                            Debug.warn({width: v[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
                        }

                        if (typeof v[1] === "number") {
                            height = v[1];
                        }
                        else if (typeof v[1] === "string") {
                            if (v[1].match(/^[\d]+%$/)) {
                                height = parseInt(v[1]);
                                yunits = '%';
                            }
                            else {
                                height = 800;
                                Debug.warn({height: v[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
                            }
                        }
                        else {
                            height = 800;
                            Debug.warn({height: v[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
                        }
                        WindowResizeCallback();
                    }
                );

            var pW = 0, pH = 0, resizeTO = null;

            function compareOnResize(success) {
                if (xunits === '%' || yunits === '%') {
                    var _pW = pW, _pH = pH;
                    Canvas.size(0, 0);
                    if (resizeTO) clearTimeout(resizeTO);

                    resizeTO = setTimeout(function () {
                        var parentNode = Canvas.element().parentNode,
                            styles = window.getComputedStyle(parentNode, null);

                        pH = parseInt(styles.getPropertyValue('height'));
                        pW = parseInt(styles.getPropertyValue('width'));

                        if (_pW !== pW) {
                            if (xunits === '%' && _pW !== pW) {
                                dimms[0] = Math.floor(pW * (width / 100));
                            }
                        }
                        if (_pH !== pH) {
                            if (yunits === '%') {
                                dimms[1] = Math.floor(pH * (height / 100));
                            }
                        }
                        Canvas.size(dimms[0], dimms[1]);
                        resizeTO = null;
                        success();
                    }, 200);
                }
                else {
                    dimms[0] = width;
                    dimms[1] = height;
                    Canvas.size(dimms[0], dimms[1]);

                    return false;
                }
            }

            function GetCanvasOffset(x) {
                var offsetProp = x ? 'offsetLeft' : 'offsetTop';

                var result = 0, element = Canvas.element();

                do {
                    if (!isNaN(element[offsetProp])) {
                        result += element[offsetProp];
                    }
                } while (element = element.offsetParent);

                return result;
            }

            function WindowResizeCallback() {
                if (!output) return;
                compareOnResize(function () {
                    offset[0] = GetCanvasOffset(0);
                    offset[1] = GetCanvasOffset(1);
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i](dimms[0], dimms[1]);
                    }
                    ResolveCanvasEventArray('canvasresize', [new RCanvasResizeEvent()]);
                });

            }

            function CanvasSwitchCallback() {
                offset[0] = GetCanvasOffset(0);
                offset[1] = GetCanvasOffset(1);
                ResolveCanvasEventArray('canvasswitch', [new RCanvasSwitchEvent()]);
                WindowResizeCallback();
            }

            this.resize = function (func) {
                if (typeof func !== "function") return;
                callbacks.push(func);
            };

            this.width = function () {
                if (xunits === '%') {
                    return pW * (width / 100);
                }
                else {
                    return width;
                }

            };

            this.height = function () {
                if (xunits === '%') {
                    return pH * (height / 100);
                }
                else {
                    return height;
                }
            };

            var canvasEventCallbacks = {
                mousemove: [],
                mousedown: [],
                mouseup: [],
                mouseleave: [],
                mouseenter: [],
                canvasresize: [],
                canvasswitch: []
            };

            function GetCanvasEventArray(event) {
                return canvasEventCallbacks[event];
            }

            function ResolveCanvasEventArray(event, data) {
                if (typeof data !== "object" || data.constructor !== Array) {
                    Debug.warn({e: event}, 'Canvas : unable to resolve event array [{e}]. Data is not an array!');
                    return;
                }

                var array = GetCanvasEventArray(event);

                if (!array) {
                    Debug.warn({e: event}, 'Unable to resolve event [{e}] no such event!');
                    return;
                }
                for (var i = 0; i < array.length; i++) {
                    array[i].apply(self, data);
                }
            }

            this.on = function (event, func) {
                var array = GetCanvasEventArray(event);
                if (!array) {
                    Debug.warn({e: event}, 'Canvas : Unable to set event handler for event [{e}]');
                    return;
                }
                if (typeof func !== "function") {
                    Debug.warn({f: event}, 'Canvas : Unable to set event handler [{f}]');
                }
                array.push(func);
            };

            function GetMouseRelativePosition(e) {
                return [e.pageX - offset[0] - scroll[0], e.pageY - offset[1] - scroll[1]];
            }

            function RCanvasMouse(e) {
                this.page = [e.pageX, e.pageY];
                this.sceen = [e.pageX - scroll[0], e.pageY - scroll[1]];
                this.position = GetMouseRelativePosition(e);
            }

            function RCanvasMouseEvent(e) {
                this.original = e;
                this.type = e.type;
                this.mouse = new RCanvasMouse(e);
                this.canvas = self;
            }

            function RCanvasResizeEvent() {
                this.type = 'canvasresize';
                this.canvas = self;
                this.offset = [offset[0], offset[1]];
                this.size = [width, height];
                this.original = [width, height];
                this.units = [xunits, yunits];
                if (xunits === '%') {
                    this.size[0] = pW * (width / 100);
                }
                if (yunits === '%') {
                    this.size[1] = pH * (height / 100);
                }
            }

            function RCanvasSwitchEvent() {
                this.type = 'canvasswitch';
                this.canvas = self;
                this.offset = [offset[0], offset[1]];
                this.size = [width, height];
                this.original = [width, height];
                this.units = [xunits, yunits];
                if (xunits === '%') {
                    this.size[0] = pW * (width / 100);
                }
                if (yunits === '%') {
                    this.size[1] = pH * (height / 100);
                }
            }

            var listeners = {
                mousemove: function (e) {
                    ResolveCanvasEventArray('mousemove', [new RCanvasMouseEvent(e)]);
                },
                mousedown: function (e) {
                    ResolveCanvasEventArray('mousedown', [new RCanvasMouseEvent(e)]);
                },
                mouseup: function (e) {
                    ResolveCanvasEventArray('mouseup', [new RCanvasMouseEvent(e)]);
                },
                mouseleave: function (e) {
                    ResolveCanvasEventArray('mouseleave', [new RCanvasMouseEvent(e)]);
                },
                mouseenter: function (e) {
                    ResolveCanvasEventArray('mouseenter', [new RCanvasMouseEvent(e)]);
                }
            };

            Canvas.switch(function () {
                if (output) {
                    for (var event in listeners) {
                        if (listeners.hasOwnProperty(event)) {
                            output.removeEventListener(event, listeners[event]);
                        }
                    }
                }

                output = this.element();
                for (var event in listeners) {
                    if (listeners.hasOwnProperty(event)) {
                        output.addEventListener(event, listeners[event]);
                    }
                }
                CanvasSwitchCallback();
            });


            window.addEventListener('scroll', function () {
                scroll[1] = window.pageXOffset || document.documentElement.scrollLeft;
                scroll[0] = window.pageYOffset || document.documentElement.scrollTop;
            });

            window.addEventListener('resize', WindowResizeCallback);
        }

    ]
);