/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.service.class('Objects', ['@inject', 'Debug', function GraphicsAssemblerLayer(inject, Debug) {
    var canvas = inject('$Canvas'),
        context = canvas.context(),
        width = 0,
        height = 0,
        func = null,
        ready = false,
        ordering = 0;

    function updateCanvas(ctx) {
        if (!ready) {
            context.clearRect(0, 0, width, height);
            context.save();
            if (func) func(context);
            ready = true;
            context.restore();
        }
        ctx.drawImage(canvas.export(), 0, 0);
    }

    this.f = function (f) {
        if (typeof f === "function") {
            func = f;
            delete this.f;
        }
        else {
            Debug.warn({f: f}, '[{f}] is not a function');
        }
    };

    this.size = function (w, h) {
        if (width !== w || h !== h) {
            canvas.width(w);
            canvas.height(h);
            width = w;
            height = h;
            ready = false;
        }
    };

    this.ordering = function (value) {
        if (value && typeof value === "number") {
            ordering = value;
        }
        return ordering;
    };

    this.update = function () {
        ready = false;
    };

    this.draw = updateCanvas;
}]);