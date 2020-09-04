/**
 * Created by bx7kv_000 on 1/11/2017.
 */
$R.service.class('Objects',
    ['@inject', '+Drawer',
        function RectangleObjectDrawer(inject, DrawerHelper) {

            var assembler = inject('$GraphicsAssembler'),
                style = this.extension('Style'),
                drawer = this.extension('Drawer'),
                boxExtension = this.extension('Box'),
                matrix = this.extension('Matrix'),
                strokefix = [2, 2, 2, 2],
                viewSize = [0, 0];

            assembler.layer(0, 'fill', UpdateFill.bind(this));
            assembler.layer(1, 'bg', UpdateBg.bind(this));
            assembler.layer(2, 'stroke', UpdateStroke.bind(this));
            assembler.box(boxExtension);

            boxExtension.f(function (boxContainer) {

                var position = style.get('position'),
                    size = style.get('size'),
                    anchor = style.get('anchor');

                var x = position[0],
                    y = position[1];

                if (anchor[0] === 'center') {
                    x -= size[0] / 2;
                }
                if (anchor[0] === 'right') {
                    x -= size[0];
                }
                if (anchor[1] === 'middle') {
                    y -= size[1] / 2;
                }
                if (anchor[1] === 'bottom') {
                    y -= size[1]
                }

                viewSize[0] = size[0];
                viewSize[1] = size[1];

                boxContainer.set(
                    x, y,
                    size[0], size[1],
                    strokefix[0], strokefix[1], strokefix[2], strokefix[3]
                );
            });

            drawer.export(assembler.export);
            drawer.drawFunction(function (context) {
                DrawerHelper.transform(this, context);
                if (viewSize[0] >= 1 && viewSize[1] >= 0) context.drawImage(drawer.export(), 0, 0);
            });

            this.watch('size', function (o, n) {
                assembler.update('fill');
                assembler.update('stroke');
                assembler.update('bg');
                assembler.resize();
                matrix.purge();
                boxExtension.purge();
            });

            this.watch('radius', function (o, n) {
                assembler.update('fill');
                assembler.update('stroke');
                assembler.update('bg');
            });

            this.watch('strokeWidth', function (o, n) {
                strokefix[0] = n[0];
                strokefix[1] = n[1];
                strokefix[2] = n[2];
                strokefix[3] = n[3];
                boxExtension.purge();
                assembler.resize();
                matrix.purge();
                assembler.update('fill');
                assembler.update('stroke');
                assembler.update('bg');
            });

            this.watch(['position', 'size'], function () {
                boxExtension.purge();
                matrix.purge();
            });

            this.watch(['bg', 'bgSize', 'bgPosition'], function () {
                assembler.update('bg');
            });

            this.watch(['strokeStyle', 'strokeColor'], function () {
                assembler.update('stroke');
            });

            this.watch(['fill'], function () {
                assembler.update('fill');
            });

            function normalizeRadius(radius) {

                var result = [radius[0], radius[1], radius[2], radius[3]],
                    box = boxExtension.box().value(),
                    halfbox = [box.size[0] / 2, box.size[1] / 2];

                for (var i = 0; i < result.length; i++) {
                    if (result[i] > halfbox[0]) {
                        result[i] = halfbox[0]
                    }
                    if (result[i] > halfbox[1]) {
                        result[i] = halfbox[1]
                    }
                }

                return result;
            }

            function drawRectPath(context, stroke) {

                var radius = normalizeRadius(style.get('radius')),
                    k = 0.5522847498,
                    box = boxExtension.box().value(),
                    sprite = boxExtension.box().sprite();

                if (stroke) {
                    var strokeColor = style.get('strokeColor'),
                        strokeWidth = style.get('strokeWidth'),
                        strokeStyle = style.get('strokeStyle'),
                        cap = style.get('cap');

                    context.lineCap = cap;
                }
                context.beginPath();

                if (radius[0] > 0) {
                    context.moveTo(sprite.margin[3] + radius[0], sprite.margin[0]);
                } else {
                    context.moveTo(sprite.margin[3], sprite.margin[0]);
                }


                if (stroke) {
                    context.setLineDash(strokeStyle[0]);
                    context.strokeStyle = strokeColor[0];
                    context.lineWidth = strokeWidth[0];
                }
                if (radius[1] > 0) {
                    context.lineTo(box.size[0] + sprite.margin[3] - radius[1], sprite.margin[0]);
                    var curveModifier = k * radius[1];
                    context.bezierCurveTo(
                        box.size[0] + sprite.margin[3] - radius[1] + curveModifier,
                        sprite.margin[0],
                        box.size[0] + sprite.margin[3],
                        sprite.margin[0] + radius[1] - curveModifier,
                        box.size[0] + sprite.margin[3],
                        sprite.margin[0] + radius[1]
                    );
                } else {
                    context.lineTo(box.size[0] + sprite.margin[3], sprite.margin[0]);
                }

                if (stroke) context.stroke();

                if (stroke) {
                    context.setLineDash(strokeStyle[1]);
                    context.strokeStyle = strokeColor[1];
                    context.lineWidth = strokeWidth[1];
                }
                if (radius[2] > 0) {
                    var curveModifier = k * radius[2];
                    context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0] - radius[2]);
                    if (stroke) context.stroke();
                    if (stroke) {
                        context.setLineDash(strokeStyle[2]);
                        context.strokeStyle = strokeColor[2];
                        context.lineWidth = strokeWidth[2];
                    }
                    context.bezierCurveTo(
                        box.size[0] + sprite.margin[3],
                        box.size[1] + sprite.margin[0] - radius[2] + curveModifier,
                        box.size[0] + sprite.margin[3] - radius[2] + curveModifier,
                        box.size[1] + sprite.margin[0],
                        box.size[0] + sprite.margin[3] - radius[2],
                        box.size[1] + sprite.margin[0]
                    );
                    if (stroke) context.stroke();
                } else {
                    context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0]);
                    if (stroke) context.stroke();
                }

                if (stroke) {
                    context.setLineDash(strokeStyle[2]);
                    context.strokeStyle = strokeColor[2];
                    context.lineWidth = strokeWidth[2];
                }

                if (radius[3] > 0) {
                    var curveModifier = k * radius[3];
                    context.lineTo(sprite.margin[3] + radius[3], box.size[1] + sprite.margin[0]);

                    context.bezierCurveTo(
                        sprite.margin[3] + radius[3] - curveModifier,
                        box.size[1] + sprite.margin[0],
                        sprite.margin[3],
                        box.size[1] + sprite.margin[0] - radius[3] + curveModifier,
                        sprite.margin[3],
                        box.size[1] + sprite.margin[0] - radius[3]
                    );
                } else {
                    context.lineTo(sprite.margin[3], box.size[1] + sprite.margin[0]);
                }

                if (stroke) context.stroke();

                if (stroke) {
                    context.setLineDash(strokeStyle[3]);
                    context.strokeStyle = strokeColor[3];
                    context.lineWidth = strokeWidth[3];
                }

                if (radius[0] > 0) {
                    var curveModifier = k * radius[0];
                    context.lineTo(sprite.margin[3], sprite.margin[0] + radius[0]);
                    if (stroke) context.stroke();

                    if (stroke) {
                        context.setLineDash(strokeStyle[0]);
                        context.strokStyle = strokeColor[0];
                        context.lineWidth = strokeWidth[0];
                    }
                    context.bezierCurveTo(
                        sprite.margin[3],
                        sprite.margin[0] + radius[0] - curveModifier,
                        sprite.margin[0] + radius[0] - curveModifier,
                        sprite.margin[0],
                        sprite.margin[3] + radius[0],
                        sprite.margin[0]
                    );
                    if (stroke) context.stroke();
                } else {
                    context.lineTo(sprite.margin[3], sprite.margin[0]);
                    if (stroke) context.stroke();
                }

            }

            function hasRadius() {
                var result = false,
                    radius = style.get('radius');

                for (var i = 0; i < radius.length; i++) {
                    if (radius[i] > 0) {
                        result = true;
                        break;
                    }
                }
                return result;
            }

            function hasStroke() {
                var stroke = style.get('strokeWidth'),
                    result = false;

                for (var i = 0; i < stroke.length; i++) {
                    if (stroke[i] > 0) {
                        result = true;
                        break;
                    }
                }

                return result;
            }

            function monoStroke() {
                var strokeColor = style.get('strokeColor'),
                    strokeWidth = style.get('strokeWidth'),
                    strokeStyle = style.get('strokeStyle'),
                    dColor = strokeColor[0],
                    dWidth = strokeWidth[0],
                    dStyle = strokeStyle[0],

                    result = true;

                for (var i = 1; i < 4; i++) {
                    if (
                        dColor !== strokeColor[i] ||
                        dWidth !== strokeWidth[i] ||
                        !(strokeStyle[i][0] === dStyle[0] && strokeStyle[i][1] === dStyle[1])
                    ) {
                        result = false;
                        break;
                    }
                }
                return result;
            }

            function UpdateBg(context) {
                var boxContainer = boxExtension.box(),
                    box = boxContainer.value(),
                    sprite = boxContainer.sprite(),
                    bgposition = style.get('bgPosition'),
                    bgsize = style.get('bgSize'),
                    bg = style.get('bg');

                if (hasRadius()) {
                    drawRectPath(context);
                } else {
                    context.rect(sprite.margin[3], sprite.margin[0], box.size[0], box.size[1]);
                }

                context.clip();

                for (var i = 0; i < bg.length; i++) {

                    if (!bg[i].loaded()) {
                        bg[i].on('load', function () {
                            assembler.update('bg');
                        });
                    } else {
                        context.save();
                        var bgwidth = box.size[0] * bgsize[i][0],
                            bgheight = box.size[1] * bgsize[i][1],
                            bgpositionx = box.size[0] * bgposition[i][0],
                            bgpositiony = box.size[1] * bgposition[i][1];

                        context.translate(sprite.margin[3] + bgpositionx, sprite.margin[0] + bgpositiony);
                        context.drawImage(bg[i].export(), 0, 0, bgwidth, bgheight);
                        context.restore();
                    }
                }
            }

            function UpdateStroke(context) {
                if (hasStroke()) {
                    var strokeColor = style.get('strokeColor'),
                        strokeWidth = style.get('strokeWidth'),
                        strokeStyle = style.get('strokeStyle'),
                        boxContainer = boxExtension.box(),
                        box = boxContainer.value(),
                        sprite = boxContainer.sprite();

                    if (hasRadius()) {
                        drawRectPath(context, true);
                    } else {
                        if (monoStroke()) {
                            var cap = style.get('cap');
                            context.lineCap = cap;
                            context.setLineDash(strokeStyle[0]);
                            context.strokeStyle = strokeColor[0];
                            context.lineWidth = strokeWidth[0];
                            context.beginPath();
                            context.moveTo(sprite.margin[3], sprite.margin[0]);
                            context.lineTo(sprite.margin[3] + box.size[0], sprite.margin[0]);
                            context.lineTo(sprite.margin[3] + box.size[0], sprite.margin[0] + box.size[1]);
                            context.lineTo(sprite.margin[3], sprite.margin[0] + box.size[1]);
                            context.lineTo(sprite.margin[3], sprite.margin[0]);
                            context.stroke();
                        }
                    }
                }
            }

            function UpdateFill(context) {
                var fill = style.get('fill'),
                    boxContainer = boxExtension.box(),
                    box = boxContainer.value(),
                    sprite = boxContainer.sprite();

                if (hasRadius()) {
                    drawRectPath(context);
                } else {
                    context.rect(sprite.margin[3], sprite.margin[0], box.size[0], box.size[1]);
                }
                context.fillStyle = fill;
                context.fill();
            }

            drawer.destroy(function () {
                assembler = assembler.destroy();
                style = undefined;
                drawer = undefined;
                boxExtension = undefined;
                matrix = undefined;

                while (strokefix[0]) {
                    strokefix.shift();
                }
                while (viewSize[0]) {
                    viewSize.shift();
                }
                strokefix = undefined;
                viewSize = undefined;
            })
        }
    ]
);
