/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.member('Injector', function Injection() {
    var dependencies = null,
        constructor = null,
        instances = [];


    this.constructor = function () {
        return constructor
    };

    this.construct = function (resolve) {
        if (constructor) {
            var instance = new (Function.prototype.bind.apply(constructor, resolve.apply(this, dependencies)));
            instances.push(instance);
            return instance;
        }
    };

    this.extend = function (resolve,target) {
        if(constructor) {

        }
    };
    this.instances = function () {
        var result = [];

        for(var i = 0 ; i < instances.length ;i++) {
            result.push(instances[i]);
        }

        return result;
    };

    this.name = function () {
        if(constructor) {
            return constructor.name;
        }
    };

    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === "function") {
            constructor = arguments[i];
            break;
        }
        else if (typeof arguments[i] == "string") {
            if (!dependencies) dependencies = [];

            dependencies.push(arguments[i]);
        }
    }
});