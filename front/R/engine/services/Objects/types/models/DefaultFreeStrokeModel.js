/**
 * Created by Viktor Khodosevich on 5/3/2017.
 */
$R.service.class('Objects',
    ['+Model', '+Color', 'Debug',
        function DefaultFreeStrokeModel(ModelHelper, ColorHelper, Debug) {

            var style = this.extension('Style');

            style.define(1, 'interpolation', 0,
                function (value) {
                    if (value > .4) value = .4;

                    if (value < 0) value = 0;

                    return value;
                },
                function (value) {
                    return value;
                }
            );

            style.define(2, 'strokeColor', ['rgba(0,0,0,1)'],
                function (value) {

                    if (typeof value == "string") {

                        if (ColorHelper.colorToArray(value)) {
                            var path = style.get('path'),
                                result = [];

                            for (var i = 0; i < path.length; i++) {
                                result[i] = value;
                            }

                            return result
                        }
                        else {
                            Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                            return false;
                        }
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        var path = style.get('path'),
                            old = style.get('strokeColor'),
                            result = [];

                        for (var i = 0; i < path.length; i++) {
                            if (value[i]) {
                                if (typeof value[i] == "string") {
                                    if (ColorHelper.colorToArray(value[i])) {
                                        result.push(value[i])
                                    }
                                    else {
                                        if (old[i]) {
                                            result.push(old[i]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                        }
                                        else {
                                            result.push(old[old.length - 1]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                        }

                                    }
                                }
                                else if (typeof value[i] == "object" || value[i].constructor == Array) {
                                    if (ColorHelper.isColor(value[i])) {
                                        result.push(ColorHelper.arrayToColor(value[i]))
                                    }
                                    else {
                                        if (old[i]) {
                                            result.push(old[i]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                        }
                                        else {
                                            result.push(old[old.length - 1]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                        }
                                    }
                                }
                                else {
                                    if (old[i]) {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                    }
                                    else {
                                        result.push(old[old.length - 1]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                    }
                                }
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }
                            }
                        }

                        if (result.length) {
                            return result;
                        }
                        else {
                            Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                            return false;
                        }
                    }
                    else if (typeof value == "object") {
                        var path = style.get('path'),
                            old = style.get('strokeColor'),
                            result = [];

                        for (var i = 0; i < path.length; i++) {
                            if (value[i]) {
                                if (typeof value[i] == "string") {
                                    if (ColorHelper.colorToArray(value[i])) {
                                        result.push(value[i])
                                    }
                                    else {
                                        if (old[i]) {
                                            result.push(old[i]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, mo changes made!');
                                        }
                                        else {
                                            result.push(old[old.length - 1]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                        }

                                    }
                                }
                                else if (typeof value[i] == "object" || value[i].constructor == Array) {
                                    if (ColorHelper.isColor(value[i])) {
                                        result.push(ColorHelper.arrayToColor(value[i]))
                                    }
                                    else {
                                        if (old[i]) {
                                            result.push(old[i]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, no changes made!');
                                        }
                                        else {
                                            result.push(old[old.length - 1]);
                                            Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                        }
                                    }
                                }
                                else {
                                    if (old[i]) {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, no changes made!');
                                    }
                                    else {
                                        result.push(old[old.length - 1]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                    }
                                }
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, no changes made!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a color, replace with rgba(0,0,0,1)!');
                                }
                            }
                        }

                        if (result.length) {
                            return result;
                        }
                        else {
                            Debug.warn({val: value}, 'Line Model / {val} is not a color!');
                            return false;
                        }
                    }
                    else {
                        Debug.warn('Line Model / Wrong type of value');
                        return false
                    }

                    return false;
                },
                function (value) {
                    var result = [];

                    for (var i = 0; i < value.length; i++) {
                        result.push(ColorHelper.colorToArray(value[i]));
                    }

                    return result;
                }
            );

            style.define(2, 'strokeWidth', [1],
                function (value) {
                    if (typeof value == "number") {
                        var path = style.get('path'),
                            result = [];

                        for (var i = 0; i < path.length; i++) {
                            result.push(value);
                        }

                        return result;
                    }
                    else if (typeof  value == "object" && value.constructor == Array) {
                        var path = style.get('path'),
                            old = style.get('strokeWidth'),
                            result = [];

                        for (var i = 0; i < path.length; i++) {
                            if (typeof value[i] == "number") {
                                result.push(value[i]);
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                                }
                            }
                        }
                        return result;
                    }
                    else if (typeof value == "object") {
                        var path = style.get('path'),
                            old = style.get('strokeWidth'),
                            result = [];
                        for (var i = 0; i < path.length; i++) {
                            if (value[i]) {
                                if (typeof value[i] == "number") {
                                    result.push(value[i]);
                                }
                                else {
                                    if (old[i]) {
                                        result.push(old[i]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                                    }
                                    else {
                                        result.push(old[old.length - 1]);
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                                    }
                                }
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a number!');
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                }
                            }
                        }
                        return result;
                    }
                    else {
                        Debug.warn({val: value}, 'Line Model / {val} is not valid value for strokeWidth!');
                    }
                },
                function (value) {
                    return ModelHelper.cloneArray(value);
                }
            );

            style.define(2, 'strokeStyle', [[1, 0]],
                function (value) {
                    if (typeof value == "object" && value.constructor == Array) {
                        if (ModelHelper.validNumericArray(value)) {
                            var result = [],
                                path = style.get('path');

                            for (var i = 0; i < path.length; i++) {
                                result.push(ModelHelper.cloneArray(value));
                            }

                            return result;
                        }
                        else {
                            var result = [],
                                path = style.get('path'),
                                old = style.get('strokeStyle');

                            for (var i = 0; i < path.length; i++) {
                                if (value[i]) {
                                    if (ModelHelper.validNumericArray(value[i])) {
                                        result.push(value[i]);
                                    }
                                    else {
                                        if (old[i]) {
                                            result.push(old[i]);
                                        }
                                        else {
                                            result.push(old[old.length - 1]);
                                        }
                                        Debug.warn({val: value[i]}, 'Line Model / {val} is not a valid value for strokeStyle!');
                                    }
                                }
                                else {
                                    if (old[i]) {
                                        result.push(old[i]);
                                    }
                                    else {
                                        result.push(old[old.length - 1]);
                                    }
                                }
                            }

                            return result;
                        }
                    }
                    else if (typeof value == "object") {
                        var result = [],
                            old = style.get('strokeStyle'),
                            path = style.get('path');

                        for (var i = 0; i < path.length; i++) {
                            if (value[i]) {
                                if (ModelHelper.validNumericArray(value[i])) {
                                    result.push(value[i]);
                                }
                                else {
                                    if (old[i]) {
                                        result.push(old[i]);
                                    }
                                    else {
                                        result.push(old[old.length - 1]);
                                    }
                                    Debug.warn({val: value[i]}, 'Line Model / {val} is not a valid value for strokeStyle!');
                                }
                            }
                            else {
                                if (old[i]) {
                                    result.push(old[i]);
                                }
                                else {
                                    result.push(old[old.length - 1]);
                                }
                            }
                        }

                        return result;
                    }
                },
                function (value) {
                    return ModelHelper.cloneArray(value);
                }
            );
        }
    ]
);