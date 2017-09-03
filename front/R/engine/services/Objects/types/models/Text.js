/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.service.class('Objects',
    ['@extend', '+Model', '+Color', 'Debug', '@Fonts',
        function TextObjectModel(extend, ModelHelper, ColorHelper, Debug, Fonts) {
            extend(this, '$DefaultObjectModel');

            var style = this.extension('Style'),
                text = this.extension('Text'),
                animation = this.extension('Animation'),
                object = this;

            style.define(1, 'size', ['auto', 'auto'],
                function (value) {
                    if (typeof value === "string" && value === 'auto') {
                        text.limits(Infinity, Infinity);
                        return [value, value]
                    }
                    if (typeof value === "number") {
                        text.limits(value, value);
                        return [value, value];
                    }
                    else if (typeof value === "object" && value.constructor === Array && value.length === 2) {
                        var valid = true;

                        for (var i = 0; i < value.length; i++) {
                            if (
                                (typeof value[i] !== "string" && typeof value[i] !== "number") ||
                                (typeof value[i] === "string" && value[i] !== 'auto')) {
                                valid = false;
                                break;
                            }
                        }

                        if (valid) {
                            if (typeof value[0] === "number" && value[0] < 0) value[0] = 0;
                            if (typeof value[1] === "number" && value[1] < 0) value[1] = 0;

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
                    if (typeof value === "string") {
                        return value
                    }
                    return false;
                },
                function (value) {
                    return value
                }
            );

            var systemFont = 'sans-serif';

            style.define(1, 'font', 'sans-serif',
                function (value) {
                    if (typeof value === "string") {
                        systemFont = Fonts.format(value);
                        object.style('systemFont', null);
                        return value;
                    }
                },
                function (value) {
                    return value;
                }
            );

            style.define(1, 'systemFont', systemFont,
                function () {
                    return systemFont;
                },
                function () {
                    return systemFont;
                }
            );

            style.define(1, 'weight', 400,
                function (value) {
                    if (typeof value === "number") {
                        if (value < 100) value = 100;
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
                    if (typeof value === "string" && (value === 'normal' || value === 'italic' || value === 'oblique')) {
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
                    if (typeof value === "number") {
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
                    if (typeof value === "number") {
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
                    if (typeof value === "string") {
                        if (ColorHelper.colorToArray(value)) {
                            return value;
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid color!');
                            return false;
                        }
                    }
                    else if (typeof value === "object" && value.constructor === Array) {
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
                    if (value === 'center' || value === 'left' || value === 'right') {
                        return value;
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a proper value for aling text property');
                        return false;
                    }
                },
                function (value) {
                    return value;
                }
            );

            animation.morph('color', 1,
                function (start, end, value) {
                    if (typeof value === 'string') {
                        var color = ColorHelper.colorToArray(value);
                        if (color) {
                            start(this.style('fill'));
                            end(color);
                        }
                        else {
                            Debug.warn({v: value}, '[{v}] is not avalid color!');
                        }
                    }
                    else if (typeof value === "object" && value.constructor === Array) {
                        if (ColorHelper.isColor(value)) {
                            start(this.style('fill'));
                            end(ModelHelper.cloneArray(value));
                        }
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not a valid color!');
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