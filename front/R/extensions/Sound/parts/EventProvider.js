/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.part('Sound', ['@inject', function EventProvider(inject) {

    var events = [];

    this.event = function (name, argF, state) {
        var event = inject('Event');
        event.build.apply(event, arguments);
        events[name] = event;
        return this;
    };

    this.resolve = function (name) {
        if (typeof args !== "object" || args.constructor !== Array) args = [];
        if (events[name]) events[name].resolve.call(events[name]);
        return this;
    };

    this.wrap = function (object) {
        object.on = function (name, func) {
            if (events[name]) {
                events[name].callback.call(object, func);
            }
        };

        object.status = function (name) {
            if (events[name]) return events[name].active();
            return false;
        };
        return this;
    };

}]);