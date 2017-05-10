/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', ['Debug', function DrawerHelper(Debug) {

    var textDrawerContext = document.createElement('canvas').getContext('2d');

    this.measureText = function (func) {
        textDrawerContext.save();
        var width = func(textDrawerContext);
        textDrawerContext.restore();
        return width;
    };

    this.transform = function (object, context) {
        context.transform.apply(context, object.matrix().extract());
    };

    this.drawLineBgClipPath = function (context, path, style, assembler, sprite) {
        var bg = style.get('bg'),
            bgsize = style.get('bgSize'),
            bgposition = style.get('bgPosition');

        context.save();

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }

            context.lineTo(x2, y2);
        }

        context.closePath();
        context.clip();

        for (var b = 0; b < bg.length; b++) {

            if (!bg[b].loaded()) {
                bg[b].on('load', function () {
                    assembler.update('bg');
                });
            }
            else {
                context.save();
                var bgwidth = box.size[0] * bgsize[b][0],
                    bgheight = box.size[1] * bgsize[b][1],
                    bgpositionx = box.size[0] * bgposition[b][0],
                    bgpositiony = box.size[1] * bgposition[b][1];

                context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                context.restore();
            }
        }
        context.restore();
    };

    this.drawBezierBgClipPath = function (context, path, style, assembler, sprite) {
        var bg = style.get('bg'),
            bgsize = style.get('bgSize'),
            bgposition = style.get('bgPosition');

        context.save();

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);
        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }
            context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);

        }
        context.closePath();
        context.clip();

        for (var b = 0; b < bg.length; b++) {

            if (!bg[b].loaded()) {
                bg[b].on('load', function () {
                    assembler.update('bg');
                });
            }
            else {
                context.save();
                var bgwidth = box.size[0] * bgsize[b][0],
                    bgheight = box.size[1] * bgsize[b][1],
                    bgpositionx = box.size[0] * bgposition[b][0],
                    bgpositiony = box.size[1] * bgposition[b][1];

                context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                context.restore();
            }
        }

        context.restore();

    };

    this.drawLinePathFill = function (context, path, style) {
        var fill = style.get('fill'),
            cap = style.get('cap');

        context.save();
        context.lineCap = cap;
        context.moveTo(path[0][0], path[0][1]);

        context.beginPath();

        console.log(path);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            context.lineTo(x2, y2);
        }

        context.closePath();
        context.fillStyle = fill;
        context.fill();
        context.restore();

    };

    this.drawBezierPathFill = function (context, path, style) {
        var fill = style.get('fill'),
            cap = style.get('cap');

        context.save();

        context.lineCap = cap;

        context.beginPath();
        context.moveTo(path[0][0], path[0][1]);

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }

            context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);

        }
        context.closePath();
        context.fillStyle = fill;
        context.fill();
        context.restore();

    };

    this.drawLinePath = function (context, path, style) {
        var strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth'),
            strokeStyle = style.get('strokeStyle'),
            strokeCap = style.get('cap');

        context.save();

        context.lineCap = strokeCap;

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(x2, y2);
            }
            else {
                context.moveTo(x1, y1);
                context.beginPath();
                context.strokeStyle = strokeColor[i];
                context.lineWidth = strokeWidth[i];
                context.setLineDash(strokeStyle[i]);
                context.lineTo(x2, y2);
                context.stroke();
            }
        }

        context.restore();
    };

    this.drawBezierPath = function (context, path, style) {
        var strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth'),
            strokeStyle = style.get('strokeStyle'),
            strokeCap = style.get('cap');

        context.save();

        context.lineCap = strokeCap;

        for (var i = 0; i < path.length; i++) {
            var x1 = path[i][0],
                y1 = path[i][1],
                x2 = path[i][2],
                y2 = path[i][3],
                ax1 = path[i][4],
                ay1 = path[i][5],
                ax2 = path[i][6],
                ay2 = path[i][7];

            if (typeof x1 !== "number" || typeof x2 !== "number" || typeof y1 !== "number" || typeof y2 !== "number") {
                Debug.error('Invalid path!');
                break;
            }
            if (typeof ax1 !== "number" || typeof  ax2 !== "number" || typeof ay1 !== "number" || typeof  ay2 !== "number") {
                Debug.error('Invalid curve!');
                break;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(x2, y2);
            }
            else {
                context.beginPath();
                context.moveTo(x1, y1);
                context.strokeStyle = strokeColor[i];
                context.lineWidth = strokeWidth[i];
                context.setLineDash(strokeStyle[i]);
                context.bezierCurveTo(ax1, ay1, ax2, ay2, x2, y2);
                context.stroke();
            }
        }

        context.restore();
    };

    this.drawRectFill = function (context, style, x, y, w, h) {

        context.save();

        var fill = style.get('fill');

        context.fillStyle = fill;

        context.rect(x, y, w, h);

        context.fill();

        context.restore();


    };

    this.drawRectStroke = function (context, style, x, y, w, h) {
        var strokeStyle = style.get('strokeStyle'),
            strokeColor = style.get('strokeColor'),
            strokeWidth = style.get('strokeWidth');

        context.save();

        var _x = 0, _y = 0;

        for (var i = 0; i < 4; i++) {
            context.beginPath();
            context.strokeStyle = strokeColor[i];
            context.strokeWidth = strokeWidth[i];
            context.setLineDash(strokeStyle[i]);


            if (i == 0) {
                _x = x + w;
                _y = y;
            }
            if (i == 1) {
                _x = x + w;
                _y = y + h;
            }
            if (i == 2) {
                _x = x;
                _y = y + h;
            }
            if (i == 3) {
                _x = x;
                _y = y;
            }

            if (strokeWidth[i] < .1) {
                context.moveTo(_x, _y);
            }
            else {
                context.lineTo(_x, _y);
                context.stroke();
            }

        }


        context.restore();
    }
}]);