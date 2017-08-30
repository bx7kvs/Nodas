/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.service.class('Objects',
    ['+Drawer',
        function GroupObjectDrawer(DrawerHelper) {
            var drawer = this.extension('Drawer'),
                layers = this.extension('Layers'),
                box = this.extension('Box'),
                style = this.extension('Style');

            box.f(function (boxContainer) {

                var minx = Infinity,
                    miny = Infinity,
                    maxx = -Infinity,
                    maxy = -Infinity;


                layers.forEach(function () {


                    var obox = this.extension('Box').box().value();

                    if (obox.position[0] < minx) {
                        minx = obox.position[0];
                    }
                    if (obox.position[1] < miny) {
                        miny = obox.position[1]
                    }
                    if (obox.position[0] + obox.size[0] > maxx) {
                        maxx = obox.position[0] + obox.size[0];
                    }
                    if (obox.position[1] + obox.size[1] > maxy) {
                        maxy = obox.position[1] + obox.size[1];
                    }

                });

                var position = style.get('position');

                if (minx === Infinity) minx = 0;
                if (maxx === -Infinity) maxx = 0;
                if (miny === Infinity) miny = 0;
                if (maxy === -Infinity) maxy = 0;

                boxContainer.set(
                    minx + position[0],
                    miny + position[1],
                    maxx - minx,
                    maxy - miny,
                    0, 0, 0, 0
                );
            });

            var position = [0, 0];

            this.watch('position', function (o, n) {
                position = n;
                box.purge();
            });

            drawer.f(function (context) {

                context.save();

                context.globalAlpha *= style.get('opacity');

                DrawerHelper.transform(this, context);

                layers.forEach(function () {

                    var odrawer = this.extension('Drawer'),
                        type = this.type();

                    if (type === 'Group') {
                        odrawer.draw.call(this, context);
                    }
                    else {
                        var ostyle = this.extension('Style');

                        context.save();
                        context.globalCompositeOperation = ostyle.get('blending');
                        context.globalAlpha *= ostyle.get('opacity');
                        odrawer.draw.call(this, context);
                        context.restore();
                    }

                });

                context.restore();

            });
        }
    ]
);