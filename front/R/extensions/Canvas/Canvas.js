/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.ext(['@canvas', '@config', 'Debug', function Canvas(canvas, config, Debug) {

    var callbacks = [], width = 0, height = 0, xunits = 'px', yunits = 'px',
        parentNode = null, offset = [0, 0], scroll = [0, 0];

    if (config) {
        if (config.size && typeof config.size == "object" && config.size.constructor == Array) {
            if (typeof config.size[0] == "number") {
                width = config.size[0];
            }
            else if (typeof config.size[0] == "string") {
                if (config.size[0].match(/^[\d]+%$/)) {
                    width = parseInt(config.size[0]);
                    xunits = '%';
                }
                else {
                    width = 1000;
                    xunits = 'px';

                    Debug.warn({width: config.size[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
                }
            }
            else {
                width = 1000;
                Debug.warn({width: config.size[0]}, '{width} is not a valid value for canvas.size[0]. Width set as 1000px');
            }

            if (typeof config.size[1] == "number") {
                height = config.size[1];
            }
            else if (typeof config.size[1] == "string") {
                if (config.size[1].match(/^[\d]+%$/)) {
                    height = parseInt(config.size[1]);
                    yunits = '%';
                }
                else {
                    height = 800;
                    Debug.warn({height: config.size[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
                }
            }
            else {
                height = 800;
                Debug.warn({height: config.size[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
            }
        }
        else {
            width = 1000;
            height = 800;
            Debug.warn({height: config.size[1]}, '{height} is not a valid value for canvas.size[1]. Width set as 800px');
        }
    }

    parentNode = canvas.parentElement;

    var pW = 0, pH = 0;

    function GetParentSize() {
        canvas.setAttribute('width', 0);
        canvas.setAttribute('height', 0);
        if (parentNode) {
            var style = window.getComputedStyle(parentNode, null);
            pH = parseInt(style.getPropertyValue("height"));
            pW = parseInt(style.getPropertyValue("width"));
        }
    }

    function CompareOnResize() {

        if (parentNode) {
            if (xunits == '%' || yunits == '%') {
                var _pW = pW, _pH = pH,
                    change = false;

                GetParentSize();

                if (xunits == '%') {
                    canvas.setAttribute('width', Math.floor(pW * (width / 100)));
                    change = true;
                }
                if (yunits == '%') {
                    canvas.setAttribute('height', Math.floor(pH * (height / 100)));
                    change = true;
                }
                if (xunits == 'px') {
                    canvas.setAttribute('width', width);
                }
                if (yunits == 'px') {
                    canvas.setAttribute('height', height);
                }

                return change;

            }
            else {
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                return false;
            }
        }
        else {
            return false;
        }
    }

    function GetCanvasOffset(x) {
        var offsetProp = x ? 'offsetLeft' : 'offsetTop';

        var result = 0, element = canvas;

        do {
            if (!isNaN(element[offsetProp])) {
                result += element[offsetProp];
            }
        } while (element = element.offsetParent);

        return result;
    }

    function WindowResizeCallback(e) {
        if (CompareOnResize()) {
            offset[0] = GetCanvasOffset(0);
            offset[1] = GetCanvasOffset(1);
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](width, height);
            }
            ResolveCanvasEventArray('canvasresize', [new RCanvasResizeEvent(e)]);
        }

    }

    this.resize = function (func) {
        if (typeof func !== "function") return;

        callbacks.push(func);
    };

    this.width = function () {
        if (xunits == '%') {
            return pW * (width / 100);
        }
        else {
            return width;
        }

    };

    this.height = function () {
        if (xunits == '%') {
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
        canvasresize: []
    };

    function GetCanvasEventArray(event) {
        return canvasEventCallbacks[event];
    }

    function ResolveCanvasEventArray(event, data) {
        if (typeof data !== "object" || data.constructor !== Array) {
            Debug.warn({e: event}, 'Canvas : unable to resolve event array {[e]}. Data is not an array!');
            return;
        }

        var array = GetCanvasEventArray(event);

        if (!array) {
            Debug.warn({e: event}, 'Unable to resolve event {[e]} no such event!');
            return;
        }
        for (var i = 0; i < array.length; i++) {
            array[i].apply(canvas, data);
        }
    }

    this.on = function (event, func) {
        var array = GetCanvasEventArray(event);
        if (!array) {
            Debug.warn({e: event}, 'Canvas : Unable to set event handler for event [e]');
            return;
        }
        if (typeof func !== "function") {
            Debug.warn({f: event}, 'Canvas : Unable to set event handler [f]');
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
        this.canvas = canvas;
    }

    function RCanvasResizeEvent(e) {
        this.original = e;
        this.type = 'canvasresize';
        this.canvas = canvas;
        this.offset = [offset[0], offset[1]];
        this.size = [width, height];
        this.original = [width, height];
        this.units = [xunits, yunits];
        if (xunits == '%') {
            this.size[0] = pW * (width / 100);
        }
        if (yunits == '%') {
            this.size[1] = pH * (height / 100);
        }
    }

    canvas.addEventListener('mousemove', function (e) {
        ResolveCanvasEventArray('mousemove', [new RCanvasMouseEvent(e)]);
    });
    canvas.addEventListener('mousedown', function (e) {
        ResolveCanvasEventArray('mousedown', [new RCanvasMouseEvent(e)]);
    });
    canvas.addEventListener('mouseup', function (e) {
        ResolveCanvasEventArray('mouseup', [new RCanvasMouseEvent(e)]);
    });
    canvas.addEventListener('mouseleave', function (e) {
        ResolveCanvasEventArray('mouseleave', [new RCanvasMouseEvent(e)]);
    });
    canvas.addEventListener('mouseenter', function (e) {
        ResolveCanvasEventArray('mouseenter', [new RCanvasMouseEvent(e)]);
    });


    window.addEventListener('scroll', function () {
        scroll[1] = window.pageXOffset || document.documentElement.scrollLeft;
        scroll[0] = window.pageYOffset || document.documentElement.scrollTop;
    });

    window.addEventListener('resize', WindowResizeCallback);

    WindowResizeCallback();
}]);