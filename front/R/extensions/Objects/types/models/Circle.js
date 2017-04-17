/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['@extend', '$ColorHelper', '$ModelHelper', 'Debug', function CircleObjectModel(extend, ColorHelper, ModelHelper, Debug) {
    extend(this, 'DefaultObjectModel');
    extend(this, 'GlobalBackgroundModel');

    var style = this.extension('Style'),
        animation = this.extension('Animation');

    style.define(0, 'radius', 0,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;

                return value;
            }
        },
        function (value) {
            return value;
        }
    );
    animation.morph('radius', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                start(this.style('radius'));
                end(value);
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid radius value')
            }
        },
        function (value) {
            if (value < 0) value = 0;
            return value;
        }
    );

    style.define(0, 'strokeWidth', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;

                return value;
            }
        },
        function (value) {
            return value;
        }
    );

    animation.morph('strokeWidth', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                if (value < 0) value = 0;
                start(this.style('strokeWidth'));
                end(value);
            }
        },
        function (value) {
            if (value < 0) value = 0;
            return value;
        }
    );

    style.define(0, 'strokeColor', 'rgba(0,0,0,1)',
        function (value) {
            if (typeof value == "string") {
                if (ColorHelper.colorToArray(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeColor value');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    return ColorHelper.arrayToColor(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeColor value');
                    return false;
                }
            }
        },
        function (value) {
            return ColorHelper.colorToArray(value);
        }
    );

    animation.morph('strokeColor', 0,
        function (start, end, value) {
            if (typeof value == "string") {
                var color = ColorHelper.colorToArray(value);
                if (color) {
                    start(this.style('strokeColor'));
                    end(color);
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    start(this.style('strokeColor'));
                    end(ModelHelper.cloneArray(value));
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
            }
        },
        function (value) {
            ColorHelper.normalize(value);
            return value;
        }
    );

    style.define(0, 'strokeStyle', [1, 0],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericValue(value)) {
                    if (value.length == 2) {
                        for (var i = 0; i < value.length; i++) {
                            if (value[i] < 0) {
                                value[i] = 0;
                            }
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value.');
                        return false;
                    }
                    return ModelHelper.cloneArray(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value.');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid strokeStyle value');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );
    animation.morph('strokeStyle', 0,
        function (start, end, value) {
            if (typeof value == "object" && value.constructor === Array) {
                if (ModelHelper.validNumericArray(value)) {
                    if (value.length == 2) {
                        start(this.style('strokeStyle'));
                        end(ModelHelper.cloneArray(value))
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                    }
                }
                else {
                    Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                }
            }
            else {
                Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
            }
        },
        function (value) {
            if (value[0] < 0) value[0] = 0;
            if (value[1] < 0) value[1] = 0;
            return value;
        }
    )
}]);