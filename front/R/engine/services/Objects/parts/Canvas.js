/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.service.class('Objects', [function Canvas() {

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

    this.destroy = function () {
        canvas = undefined;
        context = undefined;
        w = undefined; h = undefined;
        for(var prop in this) {
            if(this.hasOwnProperty(prop)) {
                delete this[prop]
            }
        }
    }

}]);