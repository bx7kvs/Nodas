/**
 * Created by bx7kv_000 on 1/12/2017.
 */
$R.service.class('Resource',
    ['@extend', 'Debug',
        function SpriteResource(extend, Debug) {

            extend(this, '$Resource');

            var url = null, image = null, size = 0, frames = 0, duration = 0, width = 0, height = 0,
                frameHeight = 0, frameWidth = 0, fps = 12,
                setStausFunc = null, resolveEventFunc = null, ready = false,
                matrix = [];

            this.type = 'Sprite';

            this.on('init', function (u, eventF, statusF) {
                setStausFunc = statusF;
                resolveEventFunc = eventF;
                url = u;

                image = document.createElement('img');
                image.addEventListener('load', function () {
                    setStausFunc(1);

                    width = image.width;
                    height = image.height;

                    if (ready) {
                        createCanvasArray();
                        setCanvasSize();
                    }
                    resolveEventFunc('load', []);
                });
                image.addEventListener('error', function () {
                    setStausFunc(2);
                    resolveEventFunc('error', []);
                });

                this.on('get', function () {
                    image.setAttribute('src', url);
                });
            });

            function createCanvasArray() {

                var elems = 0;
                for (var r = 0; r < size; r++) {
                    matrix.push([]);
                    for (var c = 0; c < size; c++) {
                        elems++;
                        if (elems < frames) {
                            matrix[r].push(document.createElement('canvas'));
                        }
                    }
                }
            }

            function setCanvasSize() {
                frameHeight = Math.round(height / size);
                frameWidth = Math.round(width / size);

                for (var r = 0; r < size; r++) {
                    for (var c = 0; c < size; c++) {
                        if (matrix[r][c]) {
                            matrix[r][c].setAttribute('width', frameWidth);
                            matrix[r][c].setAttribute('height', frameHeight);
                            var _ctx = matrix[r][c].getContext('2d');
                            _ctx.translate(-frameWidth * c, -frameHeight * r);
                            _ctx.drawImage(image, 0, 0);
                        }
                    }
                }

            }

            this.ready = function () {
                return ready;
            };

            this.width = function () {
                return frameWidth;
            };
            this.height = function () {
                return frameHeight;
            };

            this.spriteWidth = function () {
                return width;
            };

            this.spriteHeight = function () {
                return height;
            };

            this.fps = function (number) {
                if (typeof number !== "number" || number <= 0) {
                    Debug.warn({n: number}, '{n} is not a correct fps number');
                    return false;
                }
                fps = number;

                duration = Math.round((frames / fps) * 1000);

            };

            var pause = false;

            this.pause = function () {
                pause = true;
            };

            this.play = function () {
                pause = false;
            };

            this.config = function (f) {
                if (ready) return;

                if (typeof f !== "number" || f <= 0) {
                    Debug.warn({rows: f}, '{rows} is not a valid frames number');
                    return;
                }

                size = Math.ceil(Math.sqrt(f));

                frames = f;

                duration = Math.round((frames / fps) * 1000);

                ready = true;

                createCanvasArray();
            };

            this.frames = function () {
                return frames;
            };

            var currentX = 0, currentY = 0;

            var _time = new Date().getTime();

            this.tick = function (time) {
                time = time.getTime();
                if (pause) return;

                var progress = (time - _time) / duration;

                if (progress > 1) {
                    progress = 1;
                    _time = new Date().getTime();
                }

                if (progress < 0) {
                    progress = 0;
                }

                var frame = Math.floor((frames - 1) * progress);

                currentY = Math.floor(frame / size);
                currentX = frame - currentY * size;
            };

            this.export = function () {
                if (matrix[currentY][currentX]) {
                    return matrix[currentY][currentX];
                }
            }
        }
    ]
);