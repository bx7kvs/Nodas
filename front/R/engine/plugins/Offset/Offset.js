/**
 * Created by bx7kv_000 on 1/5/2017.
 */
$R.plugin('Objects',
    ['@Canvas', '+Drawer',
        function Offset(Canvas, DrawerHelper) {
            var points = [[0, 0], [0, 0], [0, 0], [0, 0]],
                mask = Canvas.size(),
                box = null,
                result = false,
                iterator = 0;
            this.register('beyond', function (ctx) {
                result = true;
                mask = Canvas.size();
                box = this.extension('Box').box().get();
                points[0] = this.matrix().trackLocalPoint([box.position[0], box.position[1]], true);
                points[1] = this.matrix().trackLocalPoint([box.size[0] + box.position[0], box.position[1]], true);
                points[2] = this.matrix().trackLocalPoint([box.size[0] + box.position[0], box.size[1] + box.position[1]], true);
                points[3] = this.matrix().trackLocalPoint([box.position[0], box.size[1] + box.position[1]], true);


                var left = Math.min(points[0][0], points[1][0], points[2][0], points[3][0]),
                    right = Math.max(points[0][0], points[1][0], points[2][0], points[3][0]),
                    bottom = Math.max(points[0][1], points[1][1], points[2][1], points[3][1]),
                    top = Math.min(points[0][1], points[1][1], points[2][1], points[3][1]),
                    w = (right - left),
                    h = (bottom - top);

                if(left > -w && top > -h && bottom < h + mask[1] && right < w + mask[0]) {
                    return false;
                }
                return result;
            });

            this.destroy(function () {
                var i,u;
                while (points[0]) {
                    while (points[0][0]) {
                        points[0].shift()
                    }
                    points.shift();
                }
                points = undefined;
                while (mask[0]) {
                    mask.shift();
                }
                mask = undefined;
            });
        }
    ]
);