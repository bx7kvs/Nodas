/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.part('Objects', ['@inject', 'Debug', function GraphicsAssembler(inject, Debug) {

    var output = inject('Canvas'),
        context = output.context(),
        pipe = [],
        layers = {},
        w = 0,
        h = 0,
        boxExt = null,
        resized = false,
        ready = false;

    function SetSize(width, height) {
        for (var i = 0; i < pipe.length; i++) {
            pipe[i].size(width, height);
        }
        output.width(width);
        output.height(height);
        w = width;
        h = height;
    }

    function compose(ctx) {
        if(!resized) {
            if(boxExt) {
                var sprite = boxExt.box().sprite();
                if(sprite.size[0] !== w || sprite.size[1] !== h) {
                    SetSize(sprite.size[0],sprite.size[1]);
                }
            }
            resized = true;
        }
        if(!ready) {
            context.clearRect(0,0,w,h);
            for (var i = 0; i < pipe.length; i++) {
                pipe[i].draw(context);
            }
            ready = true;
        }
        ctx.drawImage(output.export(),0,0);
    }

    this.layer = function (order, name, updateFunc) {
        if (typeof order !== "number") {
            Debug.warn({o: order}, 'Invalid order argument [{o}] is not a number.');
            return;
        }
        if (typeof name !== "string") {
            Debug.warn({n: name}, '[{n}] is not valid name for layer');
            return;
        }
        if (typeof updateFunc !== "function") {
            Debug.warn('updateFunc is not a function!');
            return;
        }

        layers[name] = inject('GraphicsAssemblerLayer');
        layers[name].f(updateFunc);
        layers[name].ordering(order);
        layers[name].update();
        pipe.push(layers[name]);
        pipe.sort(function (a, b) {
            return a.ordering() - b.ordering();
        });
        ready = false;
    };

    this.ready = function () {
        return ready;
    };

    this.box = function (boxProvider) {
        boxExt = boxProvider;
    };

    this.size = function (width, height) {
        if (width !== w || height !== h) {
            SetSize(width, height);
            ready = false;
        }
    };

    this.resize = function () {
        resized = false;
        ready = false;
    };

    this.update = function (name) {
        ready = false;
        layers[name].update();
    };

    this.draw = compose;

}]);