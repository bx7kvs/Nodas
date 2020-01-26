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
                        Debug.error({object: object.constructor, type : typeof object.type !== "function" ? object.type() : 'unknownType'}, 'Unable to set tree root as {object}{type}. Object is not a group.', this);
                        return;
                    }
                    root = object;

                    var drawer = root.extension('Drawer');

                    if (!drawer) {
                        Debug.error({object : object.type()}, '{object} has no drawer extension', this);
                        return;
                    }
                    if (!drawer.draw || typeof drawer.draw !== "function") {
                        Debug.error({object : object.type()}, '{object} incompatible drawer extension', this);
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
            function drawGraphicsTree(context, date, frame) {
                if (!root || !rootDrawer) return;
                if (clear) context.clearRect(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight);
                rootDrawer.draw.apply(root, arguments);
            }
            Canvas.queue(0, drawGraphicsTree);
        }
    ]
);