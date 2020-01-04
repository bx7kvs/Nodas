/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.service.class('Objects',
    ['@inject', 'Debug', '+Drawer', '+Path',
        function LineObjectDrawer(inject, Debug, DrawerHelper, PathHelper) {

            var box = this.extension('Box'),
                style = this.extension('Style'),
                canvas = inject('$Canvas'),
                matrix = this.extension('Matrix'),
                require_update = false, interpolated = false,
                strokefix = 1, interpolationfix = 0,
                drawer = this.extension('Drawer'),
                xshift = 0, yshift = 0;

            box.f(function (boxContainer) {
                var position = style.get('position'),
                    path = style.get('path'),
                    anchor = style.get('anchor'),
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

                if (minx === Infinity) minx = 0;
                if (miny === Infinity) miny = 0;
                if (maxx === -Infinity) maxx = 0;
                if (maxy === -Infinity) maxx = 0;

                xshift = minx;
                yshift = miny;

                var fix = strokefix + interpolationfix,
                    width = Math.abs(maxx - minx),
                    height = Math.abs(maxy - miny);

                if (anchor[0] === 'center') {
                    x -= width ? width / 2 : 0;
                }
                if (anchor[0] === 'right') {
                    x -= width ? width : 0;
                }
                if (anchor[1] === 'middle') {
                    y -= height ? height / 2 : 0;
                }
                if (anchor[1] === 'bottom') {
                    y -= height ? height : 0
                }
                boxContainer.set(
                    x + xshift,
                    y + yshift,
                    width,
                    height,
                    fix,
                    fix,
                    fix,
                    fix
                );
            });

            this.watch('path', function () {
                var interpolation = style.get('interpolation');
                if (interpolation !== 0) interpolated = false;
                box.purge();
                matrix.purge();
                require_update = true;
            });
            this.watch('position', function () {
                box.purge();
            });

            this.watch('strokeWidth', function (o, n) {
                var fix = 0;

                for (var i = 0; i < n.length; i++) {
                    if (n[i] > fix) fix = n[i];
                }

                strokefix = fix / 2;

                require_update = true;

                box.purge();
                matrix.purge();

            });

            this.watch('interpolation', function (o, n) {
                if (o !== n) interpolated = false;

                interpolationfix = Math.round(20 * n);
                box.purge();
                matrix.purge();
                require_update = true;

            });

            this.watch(['strokeStyle', 'strokeColor'], function () {
                require_update = true;
            });


            var ctx = canvas.context();

            function UpdateCanvas() {
                var sprite = box.box().sprite(),
                    path = style.get('path'),
                    interpolation = style.get('interpolation');

                if (canvas.width() !== sprite.size[0] || canvas.height() !== sprite.size[1]) {

                    var width = sprite.size[0],
                        height = sprite.size[1];

                    canvas.width(width);
                    canvas.height(height);
                }

                ctx.clearRect(0, 0, sprite.size[0], sprite.size[1]);
                ctx.save();

                if (!interpolated) {
                    PathHelper.interpolate(path, interpolation);
                    interpolated = true;
                }

                ctx.translate(sprite.margin[3] - xshift, sprite.margin[0] - yshift);

                if (interpolation > 0) {
                    if (path.length > 0) {
                        DrawerHelper.drawBezierPath(ctx, path, style);
                    }
                } else {
                    if (path.length > 0) {
                        DrawerHelper.drawLinePath(ctx, path, style);
                    }
                }

                ctx.restore();

                require_update = false;
            }

            drawer.filter(function () {
                if (require_update) UpdateCanvas.call(this);
                return true;
            });
            drawer.export(canvas.export);
            drawer.drawFunction(function (context) {
                DrawerHelper.transform(this, context);
                context.drawImage(drawer.export(), 0, 0);
            });

        }
    ]
);