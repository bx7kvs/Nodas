/**
 * Created by Viktor Khodosevich on 3/27/2017.
 */
$R.part('ApplicationManager', function Application (injection) {

    var events = {
        tick : {},
        start : {},
        stop : {}
    };

    this.name = function () {
        return injection.name();
    };
    
    function ResolveEventArray(event,target,data) {
        if(events[event]) {
            if(!data) data = [];
            else if(data.constructor !== Array) data = [data];
            for(var ordering in events[event]) {
                for(var i = 0 ; i < events[event][ordering].length; i++) {
                    events[event][ordering][i].apply(target,data);
                }
            }
        }
    }

    this.bind = function (event,func,ordering) {
        if(typeof event == "string" && typeof func == "function" && events[event]) {
            if(typeof ordering !== "number") ordering = 0;
            if(!events[event][ordering]) events[event][ordering] = [];
            events[event][ordering] = func;
        }
    };
    
    this.tick = function (time,context) {
        if(this.status('active')) {
            ResolveEventArray('tick',arguments);
        }
    };
});