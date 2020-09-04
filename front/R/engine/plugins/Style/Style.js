/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.plugin('Objects',
    ['Debug',
        function Style(Debug) {

            var properties = {},
                callbacks = [],
                setters = {},
                getters = {},
                self = this;

            function GetSetterFunction(name, setter) {
                return function (value) {
                    var result = setter.apply(this, [value, properties[name].value]),
                        old = properties[name].value;

                    if (!result && typeof result === "boolean") {
                        Debug.warn({n : name}, 'Unable to set property {n}. Invalid value!', self);
                    } else {
                        var args = [old, result];

                        properties[name].value = result;

                        if (!callbacks[name]) callbacks[name] = [];

                        for (var i = 0; i < callbacks[name].length; i++) {
                            callbacks[name][i].apply(this, args);
                        }
                    }

                }
            }

            function GetGetterFunction(name, getter) {
                return function () {
                    return getter.call(null, properties[name].value);
                }
            }

            function StyleType1(a, b) {

                var target = this;

                if (!setters[a]) {
                    Debug.warn({
                        property: a,
                        type: target.type()
                    }, 'Object type {type} has no property {property}', target);
                } else {
                    setters[a].apply(target, [b]);
                }
            }

            function StyleType2(object) {
                var target = this;

                var setterstack = [];

                for (var property in object) {
                    if (!object.hasOwnProperty(property) || !setters[property]) continue;

                    if (!setters[property]) {
                        Debug.warn({
                            property: property,
                            type: target.type()
                        }, 'Object type {type} has no style property {property}', target);
                        continue;
                    } else {
                        setterstack.push({
                            ordering: properties[property].ordering,
                            property: property,
                            setter: setters[property]
                        });
                    }
                }
                if (setterstack.length) {
                    setterstack.sort(function (a, b) {
                        return a.ordering - b.ordering;
                    });
                    for (var i = 0; i < setterstack.length; i++) {
                        setterstack[i].setter.apply(target, [object[setterstack[i].property]]);
                    }
                } else {
                    Debug.warn({
                        o: JSON.stringify(object),
                        type: target.type(),
                    }, 'Object {type} has got no style properties to be applied in {o}', target);
                }
            }

            function StyleType3(name) {
                var target = this;

                if (!getters[name]) {
                    Debug.warn({
                        property: name,
                        type: target.type()
                    }, 'Object {type} has no property {property}', target);
                    return this;
                } else {
                    return getters[name].apply(target, [properties[name].value]);
                }

            }

            this.register('style', function (a, b) {
                if (typeof a === "string" && b !== undefined) StyleType1.apply(this, [a, b]);
                else if (typeof a === "object") StyleType2.apply(this, [a]);
                else if (typeof a === 'string' && b === undefined) return StyleType3.apply(this, [a]);
                else {
                    Debug.error('Invalid .style() arguments', this);
                }
                return this;
            });

            this.register('watch', function (property, callback) {

                if (typeof property !== "string") {
                    if (typeof property !== "object" || property.constructor !== Array) {
                        Debug.error('Property is not an array or string', this);
                        return;
                    }
                }
                if (typeof callback !== "function") {
                    Debug.error({p: property}, 'Style change callback for property {p} is not a function', this);
                    return;
                }

                if (property.constructor === Array) {

                    for (var i = 0; i < property.length; i++) {
                        if (typeof property[i] !== "string") {
                            Debug.error({i: i, p: property[i]}, 'Property {i} is not a string {p}', this);
                        } else {
                            if (!callbacks[property[i]] || typeof callbacks[property[i]] !== "object" || callbacks[property[i]].constructor !== Array) callbacks[property[i]] = [];
                            callbacks[property[i]].push(callback);
                        }
                    }
                } else if (typeof property === "string") {
                    if (!callbacks[property] || callbacks[property].constructor !== Array) callbacks[property] = [];
                    callbacks[property].push(callback);
                } else {
                    Debug.error({p: property}, 'Style property {p} is not an array or string', this);
                }

            });

            this.define = function (ordering, name, value, setter, getter) {
                if (properties[name]) {
                    Debug.error({name: name}, 'Duplicated Style Property {name}', this);
                    return;
                }

                if (typeof name !== "string" || name.length === 0) {
                    Debug.error({n: name}, 'Property {name} is not a string or empty');
                    return;
                }

                if (typeof getter !== "function" || typeof setter !== "function") {
                    Debug.error({n: name}, 'Unable to define property {n}. Getter or setter is undefined');
                    return;
                }

                if (typeof ordering !== "number") {
                    Debug.error({n: name}, 'Style property{n} application order in not a number');
                }

                properties[name] = {ordering: ordering, value: value};

                setters[name] = GetSetterFunction(name, setter);

                getters[name] = GetGetterFunction(name, getter);
            };

            this.get = function (name) {
                if (properties[name]) return properties[name].value;

                Debug.warn({n: name}, 'Getting value of property {n} that does not exist');

                return false;
            };

            this.ordering = function (name) {
                if (properties[name]) return properties[name].ordering;

                Debug.warn({n: name}, 'Getting ordering of property{n} that does not exist!');

                return false;
            };

            this.destroy(function () {
                var prop;
                self = undefined;
                for(prop in properties) {
                    if(properties.hasOwnProperty(prop)) {
                        delete properties[prop];
                    }
                }
                for(prop in setters) {
                    if(setters.hasOwnProperty(prop)) {
                        delete setters[prop];
                    }
                }
                for(prop in getters) {
                    if(getters.hasOwnProperty(prop)) {
                        delete getters[prop];
                    }
                }
                while (callbacks[0]) {
                    callbacks.shift()
                }
                callbacks = undefined;
                setters = undefined;
                getters = undefined;
            });

        }
    ]
);