/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', function DrawerObjectExtension (Debug) {

    var f = null, matrix = null;

    this.f = function (func) {
        if(typeof func !== "function") {
            Debug.error({},'ObjectDrawer / func is not a function!');
            delete this.f;
            return;
        }
        f = func;
        delete this.f;
    };

    this.matrix = function () {
        return matrix;
    };

    this.draw = function () {
        if(f) f.apply(this,arguments);
    };

}]);