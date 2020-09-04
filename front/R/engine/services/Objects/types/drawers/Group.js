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
                    minx = Math.min(minx, obox.position[0]);
                    miny = Math.min(miny, obox.position[1]);
                    maxx = Math.max(maxx, obox.position[0] + obox.size[0]);
                    maxy = Math.max(maxy, obox.position[1] + obox.size[1]);
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

            this.watch('position', function (o, n) {
                box.purge();
            });

            var _argumnets;
            drawer.drawFunction(function () {
                _argumnets = arguments;
                DrawerHelper.transform(this, _argumnets[0]);
                layers.forEach(function () {
                    _argumnets[0].save();
                    this.extension('Drawer').draw.apply(this, _argumnets);
                    _argumnets[0].restore();
                });
            });
            drawer.destroy(function () {
                drawer = undefined;
                layers = undefined;
                box = undefined;
                style = undefined;
                _argumnets = undefined;
            })
        }
    ]
);