/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$DrawerHelper', 'Resource', function ImageObjectDrawer(DrawerHelper, Resource) {

    var style = this.extension('Style'),
        box = this.extension('Box'),
        drawer = this.extension('Drawer'),
        matrix = this.extension('Matrix');

    var width = null, height = null,
        image = null;


    this.watch('src', function (o, n) {
        if (o !== n) {
            image = Resource.image(n);
            image.on('load', function () {
                if(width == null) {
                    width = image.width();
                }
                if(height == null) {
                    height = image.height();
                }
                matrix.purge();
                box.purge();
            });
        }
    });

    this.watch('size', function (o, n) {
        if (o[0] !== n[0] || o[1] !== n[1]) {
            width = n[0];
            height = n[1];
            box.purge();
        }
    });

    this.watch('position', function (o, n) {
        if (o[0] !== n[0] || o[1] !== n[1]) {
            box.purge();
        }
    });

    box.f(function (boxContainer) {
        var position = style.get('position');
        boxContainer.set(
            position[0],
            position[1],
            width ? width : 0,
            height ? height : 0,
            0, 0, 0, 0
        );
    });

    drawer.f(function (context) {
        if (image && image.loaded() && !image.error() &&
            width !== null &&
            height !== null && width > 0 && height > 0) {
            DrawerHelper.transform(this, context);
            context.drawImage(image.export(), 0, 0, width, height);
        }
    });

}]);