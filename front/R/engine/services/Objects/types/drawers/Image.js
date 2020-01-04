/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.service.class('Objects',
    ['+Drawer', 'Resource', '@inject',
        function ImageObjectDrawer(DrawerHelper, Resource, inject) {

            var style = this.extension('Style'),
                box = this.extension('Box'),
                canvas = inject('$Canvas'),
                drawer = this.extension('Drawer'),
                matrix = this.extension('Matrix');

            var width = null, height = null,
                image = null;

            this.watch('src', function (o, n) {
                if (o !== n) {
                    image = Resource.image(n);
                    image.on('load', function () {
                        if (width === null) {
                            width = style.get('size')[0] ? style.get('size')[0] : image.width();
                            canvas.width(width);
                        }
                        if (height === null) {
                            height = style.get('size')[1] ? style.get('size')[1] : image.height();
                            canvas.height(height);
                        }
                        canvas.context().drawImage(image.export(), 0, 0, width, height);
                        matrix.purge();
                        box.purge();
                        drawer.spriteUpdated.call({$$CALL: true});
                    });
                }
            });

            this.watch('size', function (o, n) {
                if (o[0] !== n[0] || o[1] !== n[1]) {
                    width = n[0];
                    height = n[1];
                    canvas.width(width);
                    canvas.height(height);
                    canvas.context().clearRect(0, 0, canvas.width(), canvas.height());
                    canvas.context().drawImage(image.export(), 0, 0, width, height);
                    box.purge();
                }
            });

            this.watch('position', function (o, n) {
                if (o[0] !== n[0] || o[1] !== n[1]) {
                    box.purge();
                }
            });

            box.f(function (boxContainer) {
                var position = style.get('position'),
                    anchor = style.get('anchor');

                var x = position[0],
                    y = position[1];

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
                boxContainer.set(x, y, width ? width : 0, height ? height : 0, 0, 0, 0, 0);
            });

            drawer.filter(function () {
                return image && image.loaded() && !image.error() &&
                    width !== null &&
                    height !== null && width > 0 && height > 0;
            });

            drawer.export(canvas.export);

            drawer.drawFunction(function (context) {
                DrawerHelper.transform(this, context);
                context.drawImage(drawer.export(), 0, 0, width, height);
            });

        }
    ]
);