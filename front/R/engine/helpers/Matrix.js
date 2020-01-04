/**
 * Created by Viktor Khodosevich on 2/6/2017.
 */
$R.helper.system(
    function Matrix() {

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

        function applyMatrixToPoint(matrix, point) {
            var x = point[0] * matrix[0] + point[1] * matrix[2] + matrix[4],
                y = point[0] * matrix[1] + point[1] * matrix[3] + matrix[5];

            point[0] = x;
            point[1] = y;
        }

        function GraphicsTransformMatrix(object) {
            var value = [1, 0, 0, 1, 0, 0],
                inversion = [1, 0, 0, 1, 0, 0],
                globalInversion = null,
                globalValue = null,
                history = [];

            this.invert = function () {
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
            };
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

            this.extractGlobalInversion = function () {
                if(globalInversion) return globalInversion;

                var parent = object.parent();

                if (!globalInversion) globalInversion = [inversion[0], inversion[1], inversion[2], inversion[3], inversion[4], inversion[5]];

                if (parent) {
                    multiply(globalInversion, parent.matrix().extractGlobalInversion());
                }
                return  globalInversion;
            };

            this.globalCursorProjection = function (point) {
                this.extractGlobalInversion();

                applyMatrixToPoint(globalInversion, point);

                return point;
            };

            this.cursorProjection = function (point) {

                applyMatrixToPoint(inversion, point);

                return point;
            };

            this.trackLocalPoint = function (point, exclude_self) {
                var parent = object.parent();

                if(parent) {
                    parent.matrix().trackLocalPoint(point);
                }
                if(!exclude_self) applyMatrixToPoint(value, point);

                return point;

            };

            this.extract = function () {
                return value;
            };
            this.extractInversion = function () {
                return inversion;
            };
        }

        this.objectMatrix = function (object) {

            var matrix = new GraphicsTransformMatrix(object);

            var style = object.extension('Style'),
                boxContainer = object.extension('Box').box(),
                sprite = boxContainer.sprite(),
                position = style.get('position'),
                origin = style.get('origin'),
                skew = style.get('skew'),
                rotate = style.get('rotate'),
                scale = style.get('scale'),
                translate = style.get('translate'),

                _translate = object.type('Group') ? [
                        position[0] + translate[0],
                        position[1] + translate[1]
                    ] :
                    [
                        sprite.position[0] + translate[0],
                        sprite.position[1] + translate[1]
                    ],
                _origin = [
                    origin[0] * sprite.size[0],
                    origin[1] * sprite.size[1]
                ];


            matrix.translate(_origin[0], _origin[1]);
            if (_translate[0] !== 0 || _translate[1] !== 0) matrix.translate(_translate[0], _translate[1]);
            if (rotate !== 0) matrix.rotate(rotate);
            if (skew[0] !== 0 || skew[1] !== 0) matrix.skew(skew[0], skew[1]);
            if (scale[0] !== 1 || scale[1] !== 1) matrix.scale(scale[0], scale[1]);
            matrix.translate(-_origin[0], -_origin[1]);
            matrix.invert();
            return matrix;
        };

    });