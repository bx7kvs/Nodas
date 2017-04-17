/**
 * Created by bx7kv_000 on 1/11/2017.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$ColorHelper', 'Debug',
    function RectangleObjectModel(extend, ModelHelper, ColorHelper, Debug) {

        extend(this, '$DefaultObjectModel');
        extend(this, '$GlobalBackgroundModel');
        extend(this, '$GlobalSizeModel');

        var style = this.extension('Style'),
            animation = this.extension('Animation');

        style.define(0, 'strokeColor', ['rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)'],
            function (value) {
                if (typeof value == "string") {
                    if (ColorHelper.colorToArray(value)) {
                        return [value, value, value, value];
                    }
                    else {
                        Debug.warn({value: val}, ' [{val} is not a valid stroke string');
                        return false;
                    }
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var old = style.get('strokeColor'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value[i]) {
                            if (typeof value[i] == "string") {
                                if (ColorHelper.colorToArray(value[i])) {
                                    result.push(value[i])
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid stroke color value!');
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor == Array) {
                                if (ColorHelper.isColor(value[i])) {
                                    result.push(ColorHelper.arrayToColor(value[i]));
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid stroke color value');
                                }
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                            }
                        }
                        else {
                            result.push(old[i]);
                        }
                    }

                    return result;
                }
                else if (typeof value == "object") {
                    var old = style.get('strokeColor'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value.hasOwnProperty(i)) {
                            if (typeof value[i] == "string") {
                                if (ColorHelper.colorToArray(value[i])) {
                                    result.push(value[i]);
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor === Array) {
                                if (ColorHelper.isColor(value[i])) {
                                    result.push(ColorHelper.arrayToColor(value[i]));
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, '[{val}] is not a valid color value')
                                }
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value[i]}, '[{val}] is not a valid color value');
                            }
                        }
                        else {
                            result.push(old[i])
                        }
                    }

                    return result;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid value for strokeColor!');
                    return false;
                }
            },
            function (value) {
                var result = [];
                for (var i = 0; i < value.length; i++) {
                    result.push(ColorHelper.colorToArray(value[i]));
                }
                return result;
            }
        );

        animation.morph('strokeColor', 0,
            function (start, end, value) {
                if (typeof value == "string") {
                    var color = ColorHelper.colorToArray(value[i]);
                    if (color) {
                        end([ModelHelper.cloneArray(color), ModelHelper.cloneArray(color), ModelHelper.cloneArray(color), ModelHelper.cloneArray(color)]);
                        start(this.style('strokeColor'));
                    }
                    else {
                        Debug.warn({v: value}, '{v} is not a valid color!');
                    }
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    if (ColorHelper.isColor(value)) {
                        end([ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value),
                            ModelHelper.cloneArray(value)]);

                        start(this.style('strokeColor'));
                    }
                    else {
                        var cuurent = this.style('strokeColor'),
                            result = [],
                            valid = false;

                        for (var i = 0; i < cuurent.length; i++) {
                            if (typeof value[i] == "string") {
                                var color = ColorHelper.colorToArray(value[i]);
                                if (color) {
                                    result.push(color);
                                    valid = true;
                                }
                                else {
                                    result.push(current[i])
                                }
                            }
                            else if (typeof value[i] == "object" && value[i].constructor == Array) {
                                if (value[i] && ColorHelper.isColor(value[i])) {
                                    result.push(ModelHelper.cloneArray(value[i]));
                                    valid = true;
                                }
                                else {
                                    result.push(current[i]);
                                }
                            }
                            else {
                                result.push(current[i])
                            }
                        }

                        if (valid) {
                            start(cuurent);
                            end(result);
                        }
                        else {
                            Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor');
                        }
                    }
                }
                else if (typeof value == "object") {
                    var current = this.style('strokeColor'),
                        result = [],
                        valid = false;

                    for (var i = 0; i < current.length; i++) {
                        if (typeof value[i] == "string") {
                            var color = ColorHelper.colorToArray(value[i]);
                            if (color) {
                                result.push(color);
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        else if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (ColorHelper.isColor(value[i])) {
                                result.push(ModelHelper.cloneArray(value[i]));
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        else {
                            result.push(current[i])
                        }
                    }
                    if (valid) {
                        start(current);
                        end(result);
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a valid value for strokeColor!');
                    }
                }
            },
            function (value) {
                for (var i = 0; i < value.length; i++) {
                    ColorHelper.normalize(value[i]);
                }
                return value;
            }
        );

        style.define(0, 'strokeWidth', [1, 1, 1, 1],
            function (value) {
                if (typeof value == "number") {
                    return [value, value, value, value];
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var old = style.get('strokeWidth'),
                        result = [];

                    for (var i = 0; i < old.length; i++) {
                        if (value[i]) {
                            if (typeof value[i] == "number") {
                                result.push(value[i]);
                            }
                            else {
                                result.push(old[i]);
                                Debug.warn({val: value}, ' [{val}] is not a valid stroke width value');
                            }
                        }
                        else {
                            result.push(old[i])
                        }
                    }

                    return result;
                }
                else if (typeof value == "object") {
                    var result = [],
                        old = style.get('strokeWidth');

                    for (var i = 0; i < old.length; i++) {
                        if (value.hasOwnProperty(i)) {
                            if (typeof value[i] == "number") {
                                result.push(value[i]);
                            }
                            else {
                                Debug.warn({val: value}, '[{val}] is not a valid value for strokeWidth');
                                result.push(old[i]);
                            }
                        }
                        else {
                            result.push(old[i]);
                        }
                    }

                    return result;
                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not a valid strokeWidth value');
                    return false;
                }
            },
            function (value) {
                return ModelHelper.cloneArray(value);
            }
        );

        animation.morph('strokeWidth', 0,
            function (start, end, value) {
                if (typeof value == "number") {
                    end([value, value, value, value]);
                    start(this.style('strokeWidth'));
                }
                else if (typeof value == "object" && value.constructor == Array) {
                    var current = this.style('strokeWidth'),
                        result = [];

                    for (var i = 0; i < current.length; i++) {
                        if (value[i] && typeof value[i] == "number") {
                            result.push(value[i]);
                        }
                        else {
                            result.push(current[i]);
                        }
                    }
                    end(result);
                    start(current);
                }
                else if (typeof value == "object") {
                    var current = this.style('strokeWidth'),
                        result = [],
                        valid = false;

                    for (var i = 0; i < current.length; i++) {
                        if (value[i] && typeof value[i] == "number") {
                            result.push(value);
                            valid = true;
                        }
                        else {
                            result.push(current[i]);
                        }
                    }
                    if (valid) {
                        end(result);
                        start(current);
                    }
                    else {
                        Debug.warn({v: value}, ' [{v}] is not a valid strokeWidth object');
                    }
                }
                else {
                    Debug.warn({v: value}, ' [{v}] is not a valid value for strokeWidth')
                }
            },
            function (value) {
                return value;
            }
        );

        style.define(0, 'strokeStyle', [[1, 0], [1, 0], [1, 0], [1, 0]],
            function (value) {
                if (typeof value == "object") {
                    if (value.constructor == Array) {
                        if (ModelHelper.validNumericArray(value)) {
                            if (value.length == 2) {
                                return [value, value, value, value];
                            }
                            else {
                                Debug.warn({v: value}, ' [{v}] is not a valid value for stroke width!');
                            }
                        }
                        else {
                            var result = [],
                                old = style.get('strokeStyle');

                            for (var i = 0; i < old.length; i++) {
                                if (value[i]) {
                                    if (ModelHelper.validNumericArray(value[i]) && value.length == 2) {
                                        result.push(ModelHelper.cloneArray(value[i]))
                                    }
                                    else {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, ' [{val}] is not a valid stroke style value');
                                    }
                                }
                                else {
                                    result.push(old[i]);
                                }
                            }
                            return result;
                        }
                    }
                    else {
                        var result = [],
                            old = style.get('strokeStyle');

                        for (var i = 0; i < old.length; i++) {
                            if (value.hasOwnProperty(i)) {
                                if (typeof value[i] == "object" && value[i].constructor == Array) {
                                    if (ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                        result.push(ModelHelper.cloneArray(value[i]));
                                    }
                                    else {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, '[{val}] is not a valid strokeStyle value');
                                    }
                                }
                                else {
                                    result.push(old[i]);
                                    Debug.watch({val: value[i]}, ' [{val}] is not a valid strokeStyle value');
                                }
                            }
                            else {
                                result.push(old[i]);
                            }
                        }
                        return result;
                    }

                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not valid strokeStyle value');
                    return false;
                }
            },
            function (value) {
                return ModelHelper.cloneArray(value);
            }
        );

        animation.morph('strokeStyle', 0,
            function (start, end, value) {
                if(typeof value == "object") {
                    if(value.constructor == Array) {
                        if(ModelHelper.validNumericArray(value)) {
                            if(value.length == 2) {
                                start(this.style('strokeStyle'));
                                end(ModelHelper.cloneArray(value),ModelHelper.cloneArray(value),ModelHelper.cloneArray(value),ModelHelper.cloneArray(value));
                            }
                            else {
                                Debug.warn({v:value}, ' [{v}] is not a valid strokeStyle value!');
                            }
                        }
                        else {
                            var current = this.style('strokeStylr'),
                                result = [],
                                valid = false;

                            for(var i = 0 ; i < current.length ; i++) {
                                if(value[i] && ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                    result.push(ModelHelper.cloneArray(value[i]))
                                    valid = true;
                                }
                                else {
                                    result.push(current[i]);
                                }
                            }

                            if(valid) {
                                start(current);
                                end(result);
                            }
                            else {
                                Debug.warn({v:value}, '[{v}] is not a valid strokeStyle value');
                            }
                        }
                    }
                    else {
                        var current = this.style('strokeStyle'),
                            result = [],
                            valid = false;

                        for(var i = 0 ; i < current.length; i++) {
                            if(value[i] && ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                result.push(ModelHelper.cloneArray(value[o]));
                                valid = true;
                            }
                            else {
                                result.push(current[i]);
                            }
                        }
                        if(valid) {
                            start(current);
                            end(result);
                        }
                        else {
                            Debug.warn({v:value}, '[{v}] is not a valid strokeStyleValue');
                        }
                    }
                }
                else {
                    Debug.warn({v:value}, '[{v}] is not a valid strokeStyleValue');
                }
            },
            function (value) {
                return value;
            }
        )


    }]);