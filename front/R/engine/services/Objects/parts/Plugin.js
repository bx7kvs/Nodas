/**
 * Created by bx7kv_000 on 12/25/2016.
 */
$R.service.class('Objects',
    function Plugin() {

        var properties = {}, clear = {}, object = null,
            applies = [], destroyCb = [];

        this.defineObject = function (o) {
            object = o;
            delete this.defineObject;
        };

        this.object = function () {
            return object;
        };

        this.matchType = function (type) {
            if (applies.length === 0) return true;

            var result = false;

            for (var i = 0; i < applies.length; i++) {
                if (applies[i] === type) {
                    result = true;
                    break;
                }
            }
            if (this.applyTo) {
                delete this.applyTo;
                delete  this.matchType;
            }
            return result;
        };

        this.applyTo = function (types) {
            if (typeof types == "string") {
                applies.push(types);
            }
            else if (typeof types == "object" && types.constructor === Array) {
                for (var i = 0; i < types.length; i++) {
                    if (typeof types[i] == "string") {
                        applies.push(types[i]);
                    }
                }
            }
            delete this.applyTo;
        };

        this.register = function (property, func, temp) {
            if (!properties[property]) properties[property] = func;
            if (temp) clear[property] = true;
        };

        this.wrap = function (object) {
            for (var property in properties) {
                if (!properties.hasOwnProperty(property) || object[property]) continue;
                object[property] = properties[property];
            }

            delete  this.wrap;
            delete  this.register;
            delete  this.clear;
        };

        this.hasProperty = function (prop) {
            var result = false;

            for (var property in properties) {
                if (!properties.hasOwnProperty(property)) continue;

                if (prop === property) {
                    result = true;
                    break;
                }
            }

            return result;
        };

        this.clear = function (object) {
            for (var prop in clear) {
                if (!clear.hasOwnProperty(prop)) continue;
                delete  object[prop];
            }
        };

        this.destroy = function (f) {
            var prop;
            if(typeof f === "function") {
                destroyCb.push(f);
                return this;
            }
            while (destroyCb[0]) {
                destroyCb[0].call(this);
                destroyCb.shift();
            }
            destroyCb = undefined;
            for(prop in properties) {
                if(object) delete object[prop];
                delete properties[prop];
            }
            for(prop in this) {
                if(this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
            }
            properties = undefined; clear = undefined;
        }
    }
);