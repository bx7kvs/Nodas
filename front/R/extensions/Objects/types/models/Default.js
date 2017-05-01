/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['$ModelHelper', '$PathHelper', 'Debug', function DefaultObjectModel(ModelHelper, PathHelper, Debug) {

    var style = this.extension('Style'),
        animation = this.extension('Animation');

    style.define(0, 'position', [0, 0],
        function (value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Invalid numeric array for position!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('position', 0,
        function (start, end, value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('position'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for position');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'rotate', 0,
        function (value) {
            if (typeof value == "number") {
                if (value < -360) {
                    value = value + 360;
                }
                if (value > 360) {
                    value = value - 360;
                    value = value * Math.PI / 180;
                    return value;
                }
                else {
                    return value * Math.PI / 180;
                }
            }
        },
        function (value) {
            return value * (180 / Math.PI);
        });

    animation.morph('rotate', 0,
        function (start, end, value) {
            if (typeof value == "number") {
                start(this.style('rotate'));
                end(value);
            }
            else {
                Debug.warn({v: value}, 'Is not a valid value to animate rotate');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'translate', [0, 0],
        function (value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Invalid numeric array for translate!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value)
        }
    );

    animation.morph('translate', 0,
        function (start, end, value) {
            if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('translate'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for translate');
            }
        },
        function (value) {
            return value;
        }
    );


    style.define(0, 'opacity', 1,
        function (value) {
            if (typeof value == "number") {
                if (value < 0) {
                    value = 0;
                }
                if (value > 1) {
                    value = 1;
                }
                return value;
            }
            else {
                Debug.warn('Opacity value is not a number');
                return false;
            }
        },
        function (value) {
            return value;
        }
    );
    animation.morph('opacity', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                start(this.style('opacity'));
                end(value);
            }
            else {
                Debug.warn({v: value}, 'Invalid value for translate');
            }
        },
        function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            return value;
        }
    );

    style.define(0, 'scale', [1, 1],
        function (value) {
            if (typeof value == "number") {
                if (value > 0) {
                    return [value, value];
                }
                else {
                    return [0, 0];
                }
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                return ModelHelper.cloneArray(value);
            }
            else {
                Debug.warn('Unknown type of value for scale!');
                return false;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('scale', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                if (value < 0) value = 0;
                if (value > 1) value = 1;
                start(this.style('scale'));
                end([value, value]);
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('scale'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for scale');
            }
        },
        function (value) {
            if (value[0] < 0) value[0] = 0;
            if (value[1] < 0) value[1] = 0;
            return value;
        }
    );

    style.define(0, 'skew', [0, 0],
        function (value) {
            if (typeof value == "number") {
                if (value > 360) {
                    value = value - 360;
                }
                if (value < -360) {
                    value = value + 360;
                }
                var rad = value * Math.PI / 180;

                console.log(value, rad);

                return [rad, rad];
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                if (value[0] > 360) {
                    value[0] = value[1] - 360;
                }
                if (value[1] < -360) {
                    value[1] = value[1] + 360;
                }
                var rad1 = value[0] * Math.PI / 180,
                    rad2 = value[1] * Math.PI / 180;

                return [rad1, rad2];
            }
            else {
                Debug.warn({v: value}, 'Ubknown value format for skew. [{v}]');
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    animation.morph('skew', 0,
        function (start, end, value) {
            if (typeof  value == "number") {
                start(this.style('skew'));
                end([value, value]);
            }
            else if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('skew'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for skew');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(0, 'origin', [.5, .5],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericArray(value) && value.length == 2) {
                    return [value[0], value[1]]
                }
                else {
                    Debug.warn('Unknown format of value for origin. Invalid Array!');
                    return false;
                }
            }
            else {
                Debug.warn('Unknown type of value for origin');
                return false;
            }
        },
        function (value) {
            ModelHelper.cloneArray(value);
        }
    );

    animation.morph('origin', 0,
        function (start, end, value) {
           if (ModelHelper.validNumericArray(value) && value.length == 2) {
                start(this.style('origin'));
                end(ModelHelper.cloneArray(value));
            }
            else {
                Debug.warn({v: value}, 'Invalid value for origin');
            }
        },
        function (value) {
            return value;
        }
    );

    style.define(2, 'cap', 'round',
        function (value) {
            if (typeof value == "string") {
                if (value == 'round' || value == 'butt' || value == 'square') {
                    return value;
                }
                else {
                    Debug.error({val: value}, '{val} is incorrect value for line cap property!');
                    return false;
                }
            }
            else {
                Debug.error('Cap property is a string!');
            }
        },
        function (value) {
            return value;
        }
    );

    if (this.type() !== 'Group') {
        style.define(0, 'blending', 'source-over',
            function (value) {
                if (ModelHelper.validBlending(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, ' [{val}] is not a valid blending!');
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
    }
}]);