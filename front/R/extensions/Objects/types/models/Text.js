/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['@extend', '$ModelHelper', '$ColorHelper', 'Debug',
        function TextObjectModel(extend, ModelHelper, ColorHelper, Debug) {
            extend(this, 'DefaultObjectModel');

            var style = this.extension('Style'),
                text = this.extension('Text'),
                animation = this.extension('Animation');

            style.define(1, 'size', ['auto', 'auto'],
                function (value) {
                    if (typeof value == "string" && value == 'auto') {
                        text.limits(Infinity, Infinity);
                        return [value, value]
                    }
                    if (typeof value == "number") {
                        text.limits(value, value);
                        return [value, value];
                    }
                    else if (typeof value == "object" && value.constructor === Array && value.length == 2) {
                        var valid = true;

                        for (var i = 0; i < value.length; i++) {
                            if (
                                (typeof value[i] !== "string" && typeof value[i] !== "number") ||
                                (typeof value[i] == "string" && value[i] !== 'auto')) {
                                valid = false;
                                break;
                            }
                        }

                        if (valid) {
                            if (typeof value[0] == "number" && value[0] < 0) value[0] = 0;
                            if (typeof value[1] == "number" && value[1] < 0) value[1] = 0;

                            text.limits(value[0] === 'auto' ? Infinity : value[0], value[1] === 'auto' ? Infinity : value[1]);

                            return [value[0], value[1]]
                        }
                        Debug.warn({v: value}, '[{v}] is not a valid size array');
                        return false;
                    }
                    Debug.warn({v: value}, '[{v}] is not a valid value for size');
                    return false;
                },
                function (value) {
                    return [value[0], value[1]];
                }
            );

            style.define(1, 'str', '',
                function (value) {
                    if (typeof value == "string") {
                        return value
                    }
                    return false;
                },
                function (value) {
                    return value
                }
            );

            style.define(1, 'font', 'sans-serif',
                function (value) {
                    if (typeof value == "string") {
                        return value;
                    }
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'weight', 400,
                function (value) {
                    if (typeof value === "number") {
                        if (value < 0) value = 0;
                        if (value > 900) value = 900;

                        if (value % 100 !== 0) value = value - (value % 100);

                        return value
                    }
                    return false;
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'style', 'normal',
                function (value) {
                    if (typeof value == "string" && (value == 'normal' || value == 'italic' || value == 'oblique')) {
                        return value
                    }
                    return false;
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'lineHeight', 14,
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

            style.define(1, 'fontSize', 14,
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

            style.define(1, 'color', 'rgba(0,0,0,1)',
                function (value) {
                    if (typeof value == "string") {
                        if (ColorHelper.colorToArray(value)) {
                            return value;
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid color!');
                            return false;
                        }
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        if (ColorHelper.isColor(value)) {
                            return ColorHelper.arrayToColor(value);
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid color');
                            return false;
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not a valid color!');
                        return false;
                    }
                },
                function (value) {
                    return ColorHelper.colorToArray(value);
                }
            );

            style.define(1, 'align', 'left',
                function (value) {
                    if(value === 'center' || value === 'left' || value === 'right') {
                        return value;
                    }
                    else {
                        Debug.warn({v:value},'[{v}] is not a proper value for aling text property');
                        return false;
                    }
                },
                function (value) {
                    return value;
                }
            );
            style.define(1, 'anchor', ['left','top'],
                function (value) {
                    if(typeof value === "object" && value.constructor == Array && value.length == 2) {
                        if(
                            (value[0] == 'left' || value[0] == 'center' || value[0] == 'right') &&
                            (value[1] == 'top' || value[1] == 'middle' || value[1] == 'bottom')
                        ) {
                            return [value[0],value[1]];
                        }
                        else {
                            Debug.warn({v:value}, '[{v}] is not a valid value. Array ["left" || "center" || "right" , "top" || "middle" || "bottom" ] is required format.')
                            return false;
                        }
                    }
                    else {
                        Debug.warn({v:value},'[{v}] is not a valid anchor value for text element');
                        return false;
                    }
                },
                function (value) {
                    return [value[0],value[1]];
                }
            );

            animation.morph('color', 1,
                function (start,end,value) {
                    if(typeof value == 'string') {
                        var color = ColorHelper.colorToArray(value);
                        if(color) {
                            start(this.style('fill'));
                            end(color);
                        }
                        else {
                            Debug.warn({v:value}, '[{v}] is not avalid color!');
                        }
                    }
                    else if (typeof value == "object" && value.constructor === Array) {
                        if(ColorHelper.isColor(value)) {
                            start(this.style('fill'));
                            end(ModelHelper.cloneArray(value));
                        }
                    }
                    else {
                        Debug.warn({v : value}, '[{v}] is not a valid color!');
                    }
                },
                function (value) {
                    ColorHelper.normalize(value);
                    return value;
                }
            );
        }
    ]
);