/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.part('State' , ['@inject', function State (inject) {


    var callbacks = {}, props = {};


    function GetPropertyCallback(name) {
        return function (n,o) {
            if(!callbacks[name]) return;
            for(var i = 0 ; i < callbacks.length; i++) {
                callbacks[name][i](n,o);
            }
        }
    }


    this.define = function (name,val) {
        if(props[name]) {
            props[name].set(val);
            return;
        }

        props[name] = inject('$Property');
        props[name].onset(GetPropertyCallback(name));
        props[name].set(val);

    };

    this.watch = function (property,func) {
        if(typeof property !== "string" || typeof func !== "function") return;

        if(!callbacks[property]) callbacks[property] = [];

        if(!props[property]) this.def(property,null);

        callbacks[property].push(func);
    };

}]);