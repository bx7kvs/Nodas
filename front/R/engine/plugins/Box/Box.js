/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.plugin('Objects',
    ['Debug', '@inject',
        function Box(Debug, inject) {

            var f = null, box = inject('$Box');

            this.f = function (func) {

                if (typeof func !== "function") {
                    Debug.error('Box Extension / Box function is not a function!');
                    return;
                }
                f = func;

                delete this.f;
            };

            var object = this.object();

            function BoxWrapperFunc() {
                if (!f || !object) return;
                f.call(object, box);
                return box;
            }

            this.box = function () {
                return object.extension('Cache').value('box', BoxWrapperFunc)
            };

            this.purge = function () {
                object.extension('Cache').purge('box');
                var parent = object.parent();
                if (parent) {
                    parent.extension('Box').purge();
                }
            };
            this.register('box', function () {
                return this.extension('Cache').value('box', BoxWrapperFunc).get();
            });
            this.register('width', function () {
                return this.extension('Cache').value('box', BoxWrapperFunc).get().size[0];
            });
            this.register('height', function () {
                return this.extension('Cache').value('box', BoxWrapperFunc).get().size[1];
            });
            this.register('left', function () {
                return this.extension('Cache').value('box', BoxWrapperFunc).get().position[0];
            });
            this.register('top', function () {
                return this.extension('Cache').value('box', BoxWrapperFunc).get().position[1];
            });
        }
    ]
);