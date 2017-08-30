/**
 * Created by Viktor Khodosevich on 2/3/2017.
 */
$R.helper.system(
    function Mouse() {
        this.circleUserCheckFunction = function (cursor) {
            var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]);

            if (coords < [0] || coords[1] < 0) return false;

            var sprite = this.extension('Box').box().sprite();

            if (coords[0] > sprite.size[0]) return false;

            if (coords[1] > sprite.size[1]) return false;

            var radius = sprite.size[0] / 2,
                cx = radius,
                cy = sprite.size[1] / 2;

            if (Math.pow(coords[0] - cx, 2) + Math.pow(coords[1] - cy, 2) <= Math.pow(radius, 2)) {
                return this;
            }

            return false;
        };

        this.squareUserCheckFunction = function (cursor) {
            var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]),
                sprite = this.extension('Box').box().sprite();

            if (coords[0] > 0 && coords[0] < sprite.size[0]) {
                if (coords[1] > 0 && coords[1] < sprite.size[1]) {
                    return this
                }
                return false;
            }
            return false;
        };

        this.circleCheckFunction = function (cursor) {
            var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]);

            if (coords < [0] || coords[1] < 0) return false;

            var sprite = this.extension('Box').box().sprite();

            if (coords[0] > sprite.size[0]) return false;

            if (coords[1] > sprite.size[1]) return false;

            var center = sprite.size[0] / 2,
                radius = this.extension('Style').get('radius');

            if (Math.pow((coords[0] - center), 2) + Math.pow((coords[1] - center), 2) < Math.pow(radius, 2)) {
                return this;
            }

            return false;
        };

        this.rectCheckFunction = function (cursor) {
            var coords = this.matrix().globalCursorProjection([cursor[0], cursor[1]]),
                sprite = this.extension('Box').box().sprite();

            if (coords[0] > 0 && coords[0] < sprite.size[0]) {
                if (coords[1] > 0 && coords[1] < sprite.size[1]) {
                    return this
                }
                return false;
            }
            return false;
        };
    }
);