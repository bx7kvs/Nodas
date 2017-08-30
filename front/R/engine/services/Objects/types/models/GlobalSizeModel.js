/**
 * Created by Viktor Khodosevich on 2/8/2017.
 */
$R.service.class('Objects',
    ['$ModelHelper',
        function GlobalSizeModel(ModelHelper) {

            var animation = this.extension('Animation'),
                style = this.extension('Style');

            animation.morph('size', 1,
                function (start, end, value) {
                    if (typeof value == "number") {
                        if (value < 0) value = 0;

                        start(this.style('size'));
                        end([value, value]);
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        if (ModelHelper.validNumericArray(value) && value.length == 2) {
                            if (value[0] < 0) value[0] = 0;
                            if (value[1] < 0) value[1] = 0;

                            start(this.style('size'));
                            end(ModelHelper.cloneArray(value));
                        }
                        else {
                            Debug.warn({v: value}, '[{v}] is not valid value for size');
                        }
                    }
                    else {
                        Debug.warn({v: value}, '[{v}] is not valid value for size');
                    }
                },
                function (value) {
                    if (value[0] < 0) value[0] = 0;
                    if (value[1] < 0) value[1] = 0;
                    return value;
                }
            );

            style.define(1, 'size', [0, 0],
                function (value) {
                    if (typeof value == "number") {
                        if (value < 0) value = 0;
                        return [value, value];
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        if (value.length == 2 && ModelHelper.validNumericArray(value)) {
                            if (value[0] < 0) value[0] = 0;
                            if (value[1] < 0) value[1] = 0;

                            return [value[0], value[1]];
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not valid value for size!');
                            return false;
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not valid value for size!');
                        return false;
                    }
                },
                function (value) {
                    return ModelHelper.cloneArray(value);
                }
            )
        }
    ]
);