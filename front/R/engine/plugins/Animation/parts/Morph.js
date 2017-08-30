/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.plugin.class('Objects', 'Animation',
    ['Debug',
        function Morph(Debug) {

            var property = null,
                setter = null,
                getter = null,
                applier = null,
                start, end,
                object = null,
                valid = false,
                ordering = 0;

            function SetStartValue(val) {
                start = val;
            }

            function SetEndValue(val) {
                end = val;
            }

            this.start = function () {
                return start;
            };

            this.end = function () {
                return end;
            };

            this.property = function () {
                return property;
            };

            this.ordering = function () {
                return ordering;
            };

            this.get = function (value) {
                setter.apply(object, [SetStartValue, SetEndValue, value]);
                return this;
            };

            this.valid = function () {
                return valid;
            };

            this.apply = function (progress, value) {
                object.style(property, applier.apply(object, [value, progress]));
            };

            this.config = function (name, obj, ord, set, apl) {
                if (typeof name !== "string") {
                    Debug.error({name: name}, 'Unable to config Morph. arg1 [{name}] is not a string!');
                    return;
                }
                if (typeof obj !== "object") {
                    Debug.error({name: name}, 'Unable to config Morph. arg3 is not an object!');
                    return;
                }
                if (typeof set !== "function") {
                    Debug.error({name: name}, 'Unable to config Morph. arg4 is not a function!');
                    return;
                }
                if (typeof ord !== "number") {
                    Debug.error({name: name}, 'Unable to config Morph. arg2 is not a number!');
                    return;
                }
                if (typeof apl !== "function") {
                    Debug.error({name: name}, 'Unable to config Morph. arg5 is not a function!');
                    return;
                }

                property = name;
                setter = set;
                applier = apl;
                ordering = ord;
                object = obj;

                valid = true;
            }

        }
    ]
);