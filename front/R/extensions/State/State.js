/**
 * Created by bx7kv_000 on 12/24/2016.
 */
$R.ext(['@inject', function State(inject) {

    var states = {};


    function ParseAddress(address) {
        var result = address.match(/^([a-zA-Z]+).([a-zA-Z]+)$/),
            state = result[0],
            prop = result[1];

        if(state && prop) return {state : state, prop : prop};

    }


    this.watch = function (address, func) {

        if (typeof func !== "function") return;

        address = ParseAddress(address);

        if(!address) return;

        if(!states[address.state]) states[address.state] = inject('$State');

        states[address.prop].when(address.prop, func);

    };

    this.define = function (address, value) {

        address = ParseAddress(address);

        if(!address) return;

        if(!states[address.state]) states[address.state] = inject('$State');

        states[address.state].define(address.prop, value);
    };

}]);