/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['Debug', function Event(Debug) {

    var cb = [],
        state = false,
        name = 'default',
        stateval = false,
        self = this;
        argFunct = function () {
            return [];
        };

    this.build = function (eventName, argF, isStateEvent) {
        state = !!isStateEvent;

        if (typeof argF == "function") {
            argFunct = argF;
        }

        if (typeof eventName == "string" && eventName.length > 0) {
            name = eventName
        }

        delete this.build;
        return this;
    };

    this.name = function () {
        return name;
    };

    this.active = function () {
        return stateval;
    };

    this.resolve = function () {
        if (state) stateval = true;

        var args = argFunct();
        if(typeof args !== "object" || args.constructor !== Array) args = [];

        else {
            for (var i = 0; i < cb.length; i++) {
                cb[i].apply(this, args);
            }
        }
        return this;
    };

    this.callback = function (func) {
        if (typeof func !== "function") return this;
        if(self.active()) {
            var args = argFunct();
            if(typeof args !== "object" || args.constructor !== Array) args = [];
            func.apply(this, args);
            cb.push(arguments[0]);
            return this;
        }
        cb.push(func);
        return this;
    };

}]);