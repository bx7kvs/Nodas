/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.service(
    ['Debug', '@Canvas', '@Config',
        function Tree(Debug, Canvas, Config) {

            var root = null, rootDrawer = null, rootStyle = null,
                clear = Config.define('clear', false, {isBool: true}).watch(function (v) {
                    clear = v;
                });

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

            Canvas.queue(0, function drawGraphicsTree(context, date, frame) {
                if (!root || !rootDrawer) return;
                if (clear) context.clearRect(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight);
                rootDrawer.draw.apply(root, arguments);
            });

        }
    ]
);