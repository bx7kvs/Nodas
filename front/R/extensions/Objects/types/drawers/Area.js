/**
 * Created by Viktor Khodosevich on 5/1/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper', '$PathHelper', function AreaObjectDrawer(inject, DrawerHelper, PathHelper) {

    var assembler = inject('$GraphicsAssembler'),
        box = this.extension('Box'),
        style = this.extension('Style'),
        matrix = this.extension('Matrix'),
        drawer = this.extension('Drawer'),
        interpolated = false,
        strokefix = 1, interpolationfix = 0,
        xshift = 0, yshift = 0;


    //TODO : Apply interpolation to path!

    assembler.layer(0, 'fill', UpdateFill.bind(this));
    assembler.layer(1, 'bg', UpdateBg.bind(this));
    assembler.layer(2, 'stroke', UpdateStroke.bind(this));
    assembler.box(box);

    function UpdateFill(context) {
        var sprite = this.extension('Box').sprite(),
            style = this.extension('Style'),
            path = style.get('path');

        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        var interpolation = style.get('interpolation');

        if(!interpolated) {
            PathHelper.interpolate(path, interpolation);
            interpolated = true;
        }

        if (interpolation) {
            DrawerHelper.drawBezierPathFill(context, style.get('path'), style);
        }
        else {
            DrawerHelper.drawLinePathFill(context, style.get('path'), style);
        }
    }

    function UpdateStroke(context) {
        var sprite = this.extension('Box').sprite(),
            style = this.extension('Style');

        if(!interpolated) {
            PathHelper.interpolate(path, interpolation);
            interpolated = true;
        }

        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        var interpolation = style.get('interpolation');

        if(!interpolated) PathHelper.interpolate(path, interpolation);

        if (interpolation) {
            DrawerHelper.drawLinePath(context, style.get('path'), style);
        }
        else {
            DrawerHelper.drawBezierPath(context, style.get('path'), style);
        }
    }

    function UpdateBg(context) {
        var style = this.extension('Style'),
            sprite = this.extension('Box').sprite();

        context.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

        var interpolation = style.get('interpolation');

        if(!interpolated) {
            PathHelper.interpolate(path, interpolation);
            interpolated = true;
        }

        if (interpolation) DrawerHelper.drawLineBgClipPath(context, style.get('path'), style, assembler, sprite);
        else DrawerHelper.drawBezierBgClipPath(context, style.get('path'), style, assembler, sprite);
    }


    this.watch('path', function () {
        var interpolation = style.get('interpolation');
        interpolated = false;
        box.purge();
        matrix.purge();
        assembler.update('fill');
        assembler.update('stoke');
        assembler.update('bg');
    });

    this.watch('interpolation', function () {
        interpolated = false;
        assembler.update('fill');
        assembler.update('stoke');
        assembler.update('bg');
    });

    this.watch('position', function () {
        box.purge();
    });

    this.watch(['strokeStyle', 'strokeColor'], function () {
        assembler.update('stoke');
    });

    this.watch('fill', function () {
        assembler.update('fill');
    });

    this.watch(['bg', 'bgSize', 'bgPosition'], function () {
        assembler.update('bg');
    });

    this.watch('strokeWidth', function (o, n) {
        var fix = 0;

        for (var i = 0; i < n.length; i++) {
            if (n[i] > fix) fix = n[i];
        }

        strokefix = fix / 2;
        assembler.update('stroke');
        box.purge();
        matrix.purge();

    });

    box.f(function (boxContainer) {
        var position = style.get('position'),
            path = style.get('path'),
            x = position[0],
            y = position[1],
            minx = Infinity,
            miny = Infinity,
            maxx = -Infinity,
            maxy = -Infinity;

        for (var i = 0; i < path.length; i++) {
            if (path[i][0] < minx) {
                minx = path[i][0]
            }
            if (path[i][2] < minx) {
                minx = path[i][2]
            }
            if (path[i][1] < miny) {
                miny = path[i][1]
            }
            if (path[i][3] < miny) {
                miny = path[i][3]
            }
            if (path[i][0] > maxx) {
                maxx = path[i][0]
            }
            if (path[i][2] > maxx) {
                maxx = path[i][2]
            }
            if (path[i][1] > maxy) {
                maxy = path[i][1]
            }
            if (path[i][3] > maxy) {
                maxy = path[i][3]
            }
        }

        if (minx == Infinity) minx = 0;
        if (miny == Infinity) miny = 0;
        if (maxx == -Infinity) maxx = 0;
        if (maxy == -Infinity) maxx = 0;

        xshift = minx;
        yshift = miny;

        var fix = strokefix + interpolationfix;

        boxContainer.set(
            x + xshift,
            y + yshift,
            Math.abs(maxx - minx),
            Math.abs(maxy - miny),
            fix,
            fix,
            fix,
            fix
        );

    });

    drawer.f(function (context) {
        DrawerHelper.transform(this, context);
        assembler.draw(context);
    });
}]);