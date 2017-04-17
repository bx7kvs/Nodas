/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.part('State' , function Property () {

    var value = null, callbacks = [];


    this.set = function (val) {
        for (var i = 0 ; i < callbacks.length; i++) {
            callbacks[i](val,value);
        }
        value = val;
    };

    this.onset = function (func) {
        if(typeof  func !== 'function') return;
        callbacks.push(func);
    }

});