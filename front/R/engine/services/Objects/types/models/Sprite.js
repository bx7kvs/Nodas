/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.service.class('Objects',
    ['@extend', '+Model', 'Debug',
        function SpriteObjectModel(extend, ModelHelper, Debug) {

            extend(this, '$DefaultObjectModel');
            extend(this, '$GlobalSizeModel');

            var style = this.extension('Style');

            style.define(0, 'src', null,
                function (value) {
                    if (typeof value == "string") {

                        if (ModelHelper.isSpriteString(value)) {
                            return value;
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid value for sprite src');
                            return false;
                        }
                    }
                    else if (typeof value == "object" && value.constructor == Array) {
                        if (typeof value[0] == "string" && typeof value[1] == "number" && value[1] > 0) {
                            return value[0] + '[' + value[1] + ']';
                        }
                        else {
                            Debug.warn({val: value}, '[{val}] is not a valid sprite src');
                            return false;
                        }
                    }
                    else {
                        Debug.warn({val: value}, '[{val}] is not a valid sprite src');
                    }
                },
                function (value) {
                    return value;
                }
            );
        }]);