/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Injection(con, resolved) {
    var constructor = con, instance = null,
        dependencies = [],
        self = this;


    if (resolved) {
        if (typeof con === "object") {
            constructor = con.constructor;
            instance = con;
            dependencies = [];
        }
        else throw new Error('Unable to create PreResolvedInjection! con argument is not an object!');
    }
    else {
        if (typeof con === "function" && con.name) {
            constructor = con;
        }
        else if (typeof con === "object" && con.constructor === Array) {
            for (var i = 0; i < con.length; i++) {
                if (typeof con[i] === "string" && con[i].length) {
                    dependencies.push(con[i]);
                }
                else if (typeof con[i] === "function" && con[i].name) {
                    constructor = con[i];
                    break;
                }
            }
        }

        if (!constructor) throw new Error('Injection constructor undefined!');
    }


    this.name = function () {
        return constructor.name;
    };

    this.dependencies = function () {
        var result = [];
        for (var i = 0; i < dependencies.length; i++) {
            result.push(dependencies[i]);
        }
        return result;
    };

    this.extend = function (container) {
        if(resolved) throw new Error('You can not extend with [' + constructor.name + ']!');
        return function (target, injectionName) {
            if (typeof target === "object") {
                if (typeof injectionName === "string") {
                    var source = container.findSourceByInjectionName(injectionName);
                    if (source) {
                        var config = source.resolveInjectionDependancies(injectionName);
                        config.$constructor.apply(target, config.dependencies);
                    }
                    else {
                        throw new Error('Unable to find injection [' + injectionName + '] for [' + self.name() +']');
                    }
                }
                else {
                    throw new Error('Extend class name should be a string!');
                }
            }
            else {
                throw new Error('Extend target should be an object!');
            }
        }
    };

    this.inject = function (container) {
        if(resolved) throw new Error('You can not inject [' + constructor.name +'] directly');
        return function (injectionName) {
            return container.resolveDirectInjection(injectionName);
        }
    };

    this.create = function (args, direct) {
        if (resolved) return instance;
        if (direct) {
            args.unshift(null);
            return new (Function.prototype.bind.apply(constructor, args));
        }
        else {
            if (!instance) {
                args.unshift(null);
                instance = new (Function.prototype.bind.apply(constructor, args));
            }
            return instance;
        }
    };

    this.$constructor = function () {
        return constructor;
    };

    this.clone = function () {
        return new Injection(con, resolved);
    };
});