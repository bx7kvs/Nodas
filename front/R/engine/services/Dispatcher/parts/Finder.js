/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.service.class('Dispatcher',
    ['Tree', 'Debug',
        function Finder(Tree, Debug) {

            function checkElement(e, cursor) {
                if (e.type() === 'Group') {
                    var result = e.extension('Mouse').check(e, cursor),
                        layers = e.extension('Layers'),
                        layer_result = false;

                    layers.forEach(function () {
                        if (!this.disabled()) {
                            if (this.type() === 'Group') {
                                layer_result = checkElement(this, cursor);
                                if (layer_result) result = layer_result;
                            } else {
                                layer_result = this.extension('Mouse').check(this, cursor);
                                if (layer_result) result = layer_result;
                            }
                        }

                    });
                    return result;
                }
            }

            this.check = function (cursor) {
                var root = Tree.root();
                if (!root) return null;
                if (typeof cursor !== "object" || cursor.constructor !== Array || cursor.length !== 2 || typeof cursor[0] !== "number" || typeof cursor[1] !== "number") {
                    Debug.warn({c: cursor}, '{c} is not a valid cursor value.', this);
                    return null;
                }
                return checkElement(root, cursor);
            }
        }
    ]
);