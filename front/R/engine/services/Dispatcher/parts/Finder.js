/**
 * Created by Viktor Khodosevich on 2/2/2017.
 */
$R.service.class('Dispatcher',
    ['Tree', 'Debug',
        function Finder(Tree, Debug) {

            function CheckElement(e, cursor) {
                if (e.type() === 'Group') {
                    var result = null,
                        layers = e.extension('Layers');

                    layers.forEach(function () {
                        if (!this.disabled()) {
                            if (this.type() === 'Group') {
                                var _result = CheckElement(this, cursor);
                                if (_result) result = _result;
                            }
                            else {
                                var mouseext = this.extension('Mouse'),
                                    _result = mouseext.check(this, cursor);

                                if (_result) {
                                    result = this;
                                }
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
                    Debug.warn({c: cursor}, 'ObjectFinder ; {[c]} is not a valid cursor value.');
                    return null;
                }
                return CheckElement(root, cursor);
            }
        }
    ]
);