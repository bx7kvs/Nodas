/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.service.class('Objects',
    ['Debug', '$MatrixHelper',
        function DefaultObjectDrawer(Debug, Matrix) {
            var matrix = this.extension('Matrix');

            matrix.f(function () {
                return Matrix.objectMatrix(this);
            });

            this.watch(['position', 'rotate', 'translate', 'scale', 'skew'], function () {
                matrix.purge();
            });
        }
    ]
);