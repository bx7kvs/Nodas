/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.part('Objects', ['Debug', function StyleObjectExtension(Debug) {

    var properties = {},
        callbacks = [],
        setters = {},
        getters = {};

    function GetSetterFunction(name, setter) {
        return function (value) {
            var result = setter.apply(this, [value, properties[name].value]),
                old = properties[name].value;

            if (!result && typeof result == "boolean") {
                Debug.warn('Unable to set property [' + name + ']. Invalid value!');
            }
            else {
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
            Debug.warn({property: a, type: target.type()}, 'Style / Object type {type} has no property {property}');
        }
        else {
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
                }, 'Style / Object type {type} has no property {property}');
                continue;
            }
            else {
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
        }
        else {
            Debug.warn('Style / No properties to be applied!');
        }
    }

    function StyleType3(name) {
        var target = this;

        if (!getters[name]) {
            Debug.warn({
                property: property,
                type: target.type()
            }, 'Style / Object type {type} has no property {property}');
            return this;
        }
        else {
            return getters[name].apply(target, [properties[name].value]);
        }

    }

    this.register('style', function (a, b) {
        if (typeof a == "string" && b !== undefined) StyleType1.apply(this, [a, b]);
        else if (typeof a == "object") StyleType2.apply(this, [a]);
        else if (typeof a == 'string' && b == undefined) return StyleType3.apply(this, [a]);
        else {
            Debug.error('Style / Invalid style function arguments!');
        }
        return this;
    });

    this.register('watch', function (property, callback) {

        if (typeof property !== "string") {
            if (typeof property !== "object" || property.constructor !== Array) {
                Debug.error('Style / Property is not an array or string');
                return;
            }
        }
        else if (typeof callback !== "function") {
            Debug.error('Style / Callback is not a function!');
            return;
        }

        if (property.constructor == Array) {

            for (var i = 0; i < property.length; i++) {
                if (typeof property[i] !== "string") {
                    Debug.error({i: i}, 'Style / Property {i} is not a string!');
                    continue;
                }
                else {
                    if (!callbacks[property[i]] || typeof callbacks[property[i]] !== "object" || callbacks[property[i]].constructor !== Array) callbacks[property[i]] = [];

                    callbacks[property[i]].push(callback);
                }
            }
        }
        else if (typeof property == "string") {
            if (!callbacks[property] || callbacks[property].constructor !== Array) callbacks[property] = [];
            callbacks[property].push(callback);
        }
        else {
            Debug.error('Style / Property is not an array or string');
        }

    });

    this.define = function (ordering, name, value, setter, getter) {
        if (properties[name]) {
            Debug.error({name: name}, 'Style / Duplicated Property [{name}]');
            return;
        }

        if (typeof name !== "string" || name.length == 0) {
            Debug.error('Style / Property name is not a string!');
            return;
        }

        if (typeof getter !== "function" || typeof setter !== "function") {
            Debug.error('Style / Unable to define property. Getter or setter is undefined!');
            return;
        }

        if (typeof  ordering !== "number") {
            Debug.error('Style / Unable to define property setter ordering!');
        }

        properties[name] = {ordering: ordering, value: value};

        setters[name] = GetSetterFunction(name, setter);

        getters[name] = GetGetterFunction(name, getter);
    };

    this.get = function (name) {
        if (properties[name]) return properties[name].value;

        Debug.warn('Getting value of property that does not exist!');

        return false;
    };

    this.ordering = function (name) {
        if (properties[name]) return properties[name].ordering;

        Debug.warn('Getting ordering of property that does not exist!');

        return false;
    }

}]);