/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.part('Objects', ['Debug', '@app', 'Canvas', function Tree(Debug, app, Canvas) {

    var root = null, context = null, rootDrawer = null, rootStyle = null;

    this.root = function (object) {
        if (!root) {
            if (!object.type || typeof object.type !== "function" || object.type() !== 'Group') {
                Debug.error({}, 'Tree / Unable to set tree root! Wrong object type!');
                return;
            }

            root = object;

            var drawer = root.extension('Drawer');

            if (!drawer) {
                Debug.error({}, 'Tree / Unable to get Drawer extension!');
                return;
            }
            if (!drawer.draw || typeof drawer.draw !== "function") {
                Debug.error({}, 'Tree / Unable to register root Drawer. Drawer.draw is not a function!');
                return;
            }

            rootDrawer = drawer;

            rootStyle = root.extension('Style');

            return root;
        }
        else {
            return root;
        }
    };
    app.$('tick' , function (date, canvas) {
        if (!root || !rootDrawer) return;

        if (!context) context = canvas.getContext('2d');

        rootDrawer.draw.call(root,context);

    });

}]);