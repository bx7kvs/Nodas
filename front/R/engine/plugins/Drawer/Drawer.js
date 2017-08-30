/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.plugin('Objects',
    ['Debug',
        function Drawer(Debug) {

            var f = null, matrix = null,
                cb = {
                    before: [],
                    after: []
                },
                object = this.object();

            function resolve(event, args) {
                for (var i = 0; i < cb[event].length; i++) {
                    cb[event].apply(object, args);
                }
            }

            this.f = function (func) {
                if (typeof func !== "function") {
                    Debug.error({}, 'ObjectDrawer / func is not a function!');
                    delete this.f;
                    return;
                }
                f = func;
                delete this.f;
            };

            this.register('before', function (func) {
                if (typeof func == "function") {
                    cb.before.push(func);
                }
                else {
                    Debug.warn('Unable to set event [before Render]. func is not a Function')
                }
            });

            this.register('after', function (func) {
                if (typeof func == "function") {
                    cb.after.push(func);
                }
                else {
                    Debug.warn('Unable to set event [after Render]. func is not a Function')
                }
            });

            this.matrix = function () {
                return matrix;
            };

            this.draw = function () {
                resolve('before', arguments);
                if (f) f.apply(this, arguments);
                resolve('after', arguments);
            };

        }
    ]
);