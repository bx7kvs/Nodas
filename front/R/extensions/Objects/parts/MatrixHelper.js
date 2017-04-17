/**
 * Created by Viktor Khodosevich on 2/6/2017.
 */
$R.part('Objects', function MatrixHelper() {


    function GrapthicsTransformMatrix(object) {
        var value = [1, 0, 0, 1, 0, 0],
            inversion = [1, 0, 0, 1, 0, 0],
            globalInversion = null,
            history = [], inverted = false;

        function multiply(m1, m2) {
            var a1 = m1[0] * m2[0] + m1[2] * m2[1],
                a2 = m1[1] * m2[0] + m1[3] * m2[1],
                a3 = m1[0] * m2[2] + m1[2] * m2[3],
                a4 = m1[1] * m2[2] + m1[3] * m2[3],
                a5 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
                a6 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
            m1[0] = a1;
            m1[1] = a2;
            m1[2] = a3;
            m1[3] = a4;
            m1[4] = a5;
            m1[5] = a6;
        }

        function invert() {
            for (var i = history.length - 1; i >= 0; i--) {
                if (history[i].rotate) {
                    var sinA = Math.sin(-history[i].rotate),
                        cosA = Math.cos(-history[i].rotate);

                    multiply(inversion, [cosA, sinA, -sinA, cosA, 0, 0]);
                }
                if (history[i].translate) {
                    multiply(inversion, [1, 0, 0, 1, -history[i].translate[0], -history[i].translate[1]]);
                }
                if (history[i].skew) {
                    multiply(inversion, [1, Math.tan(-history[i].skew[1]), Math.tan(-history[i].skew[0]), 1, 0, 0]);
                }
                if (history[i].scale) {
                    multiply(inversion, [1 / history[i].scale[0], 0, 0, 1 / history[i].scale[1], 0, 0]);
                }
            }
            inverted = true;
            history = null;
        }

        this.rotate = function (angle) {
            var sinA = Math.sin(angle),
                cosA = Math.cos(angle),
                m = [cosA, sinA, -sinA, cosA, 0, 0];

            multiply(value, m);

            history.push({'rotate': angle});

            return this;
        };

        this.translate = function (x, y) {
            var m = [1, 0, 0, 1, x, y];

            if (x !== 0 || y !== 0) {
                multiply(value, m);
                history.push({'translate': [x, y]});
            }

            return this;
        };

        this.scale = function (x, y) {
            if (x !== 1 || y !== 1) {
                var m = [x, 0, 0, y, 0, 0];
                multiply(value, m);
                history.push({'scale': [x, y]});
            }

            return this;
        };

        this.skew = function (x, y) {
            if (x !== 0 || y !== 0) {
                var tanA = Math.tan(x),
                    tanB = Math.tan(y),
                    m = [1, tanB, tanA, 1, 0, 0];

                multiply(value, m);
                history.push({'skew': [x, y]});
            }

            return this;
        };

        this.extract = function () {
            return value;
        };

        function invertGlobal() {
            var parent = object.parent();

            if (!inverted) invert();

            if (parent) {
                if (!globalInversion) {
                    globalInversion = [inversion[0], inversion[1], inversion[2], inversion[3], inversion[4], inversion[5]];
                    multiply(globalInversion, parent.matrix().globalInversionMatrix());
                }
                else {
                    return globalInversion;
                }
            }
            else {
                globalInversion = inversion;
            }

            return globalInversion;
        }

        this.globalInversionMatrix = invertGlobal;

        this.globalCursorProjection = function (cursor) {
            if (!globalInversion) invertGlobal();

            var x = cursor[0] * globalInversion[0] + cursor[1] * globalInversion[2] + globalInversion[4],
                y = cursor[0] * globalInversion[1] + cursor[1] * globalInversion[3] + globalInversion[5];

            cursor[0] = x;
            cursor[1] = y;

            return cursor;
        };

        this.cursorProjection = function (cursor) {
            if (!inverted) invert();

            var x = cursor[0] * inversion[0] + cursor[1] * inversion[2] + inversion[4],
                y = cursor[0] * inversion[1] + cursor[1] * inversion[3] + inversion[5];

            cursor[0] = x;
            cursor[1] = y;

            return cursor;
        };

    }

    this.objectMatrix = function (object) {

        var matrix = new GrapthicsTransformMatrix(object);

        var style = object.extension('Style'),
            boxContainer = object.extension('Box').box(),
            sprite = boxContainer.sprite(),
            position = style.get('position'),
            origin = style.get('origin'),
            skew = style.get('skew'),
            rotate = style.get('rotate'),
            scale = style.get('scale'),
            translate = style.get('translate'),

            _translate = object.type() == 'Group' ? [
                    position[0] + translate[0] - sprite.margin[3],
                    position[1] + translate[1] - sprite.margin[0]
                ] :
                [
                    sprite.position[0] + translate[0],
                    sprite.position[1] + translate[1]
                ],
            _origin = [
                origin[0] * sprite.size[0] + sprite.margin[3],
                origin[1] * sprite.size[1] + sprite.margin[0]
            ];


        matrix.translate(_origin[0], _origin[1]);
        if (_translate[0] !== 0 || _translate[1] !== 0) matrix.translate(_translate[0], _translate[1]);
        if (rotate !== 0) matrix.rotate(rotate);
        if (skew[0] !== 0 || skew[1] !== 0) matrix.skew(skew[0], skew[1]);
        if (scale[0] !== 1 || scale[1] !== 1) matrix.scale(scale[0], scale[1]);
        matrix.translate(-_origin[0], -_origin[1]);

        return matrix;
    };

});