/**
 * Created by bx7kv_000 on 1/11/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper',
    function RectangleObjectDrawer(inject, DrawerHelper) {

        var assembler = inject('$GraphicsAssembler'),
            style = this.extension('Style'),
            drawer = this.extension('Drawer'),
            boxExtension = this.extension('Box'),
            matrix = this.extension('Matrix'),
            strokefix = [2, 2, 2, 2];

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

            if (anchor[0] == 'center') {
                x -= size[0]/2;
            }
            if (anchor[0] == 'right') {
                x -= size[0];
            }
            if (anchor[1] == 'middle') {
                y -= size[1]/2;
            }
            if (anchor[1] == 'bottom') {
                y -= size[1]
            }

            boxContainer.set(
                position[0], position[1],
                size[0], size[1],
                strokefix[0], strokefix[1], strokefix[2], strokefix[3]
            );
        });

        drawer.f(function (context) {
            DrawerHelper.transform(this, context);
            assembler.draw(context);
        });

        this.watch('size', function (o, n) {
            assembler.update('fill');
            assembler.update('stroke');
            assembler.update('bg');
            assembler.resize();
            matrix.purge();
        });

        this.watch('strokeWidth', function (o, n) {
            strokefix[0] = n[0];
            strokefix[1] = n[1];
            strokefix[2] = n[2];
            strokefix[3] = n[3];
            boxExtension.purge();
            assembler.resize();
            assembler.update('stroke');
            matrix.purge();
        });

        this.watch(['position', 'size'], function () {
            boxExtension.purge();
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

        function UpdateBg(context) {
            var boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.moveTo(sprite.margin[3], sprite.margin[0]);
            context.beginPath();
            context.lineTo(box.size[0] + sprite.margin[3], sprite.margin[0]);
            context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.lineTo(sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.lineTo(sprite.margin[3], sprite.margin[0]);
            context.clip();

            var bgposition = style.get('bgPosition'),
                bgsize = style.get('bgSize'),
                bg = style.get('bg');

            for (var i = 0; i < bg.length; i++) {

                if (!bg[i].loaded()) {
                    bg[i].on('load', function () {
                        assembler.update('bg');
                    });
                }
                else {
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
            var strokeColor = style.get('strokeColor'),
                strokeWidth = style.get('strokeWidth'),
                strokeStyle = style.get('strokeStyle'),
                cap = style.get('cap'),
                boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.moveTo(sprite.margin[3], sprite.margin[0]);
            context.lineCap = cap;
            context.strokeStyle = strokeColor[0];
            context.lineWidth = strokeWidth[0];
            context.setLineDash(strokeStyle[0]);
            context.lineTo(box.size[0] + sprite.margin[3], sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[1];
            context.lineWidth = strokeWidth[1];
            context.setLineDash(strokeStyle[1]);
            context.lineTo(box.size[0] + sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[2];
            context.lineWidth = strokeWidth[2];
            context.setLineDash(strokeStyle[2]);
            context.lineTo(sprite.margin[3], box.size[1] + sprite.margin[0]);
            context.stroke();

            context.strokeStyle = strokeColor[3];
            context.lineWidth = strokeWidth[3];
            context.setLineDash(strokeStyle[3]);
            context.lineTo(sprite.margin[3], sprite.margin[0]);
            context.stroke();
        }

        function UpdateFill(context) {
            var fill = style.get('fill'),
                boxContainer = boxExtension.box(),
                box = boxContainer.value(),
                sprite = boxContainer.sprite();

            context.rect(sprite.margin[3], sprite.margin[0], box.size[0], box.size[1]);
            context.fillStyle = fill;
            context.fill();
        }
    }
]);