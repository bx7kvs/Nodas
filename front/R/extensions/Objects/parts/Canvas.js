/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', [function Canvas() {

    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    var w = 0, h = 0;

    this.context = function () {
        return context;
    };

    this.width = function (value) {
        if (typeof value == "number") {
            w = value;
            canvas.setAttribute('width', w);
        }
        else {
            return w;
        }
    };

    this.height = function (value) {
        if (typeof value == "number") {
            h = value;
            canvas.setAttribute('height', h);
        }
        else {
            return h;
        }
    };

    this.export = function () {
        return canvas;
    };

}]);