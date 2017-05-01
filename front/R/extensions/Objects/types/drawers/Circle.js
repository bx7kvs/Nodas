/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$DrawerHelper', 'Debug', '@inject', function CircleObjectDrawer(DrawerHelper, Debug, inject) {

    var assembler = inject('$GraphicsAssembler'),
        drawer = this.extension('Drawer'),
        boxExt = this.extension('Box'),
        style = this.extension('Style'),
        matrix = this.extension('Matrix'),
        strokefix = 1;

    assembler.layer(0, 'fill', UpdateFill.bind(this));
    assembler.layer(1, 'bg', UpdateBg.bind(this));
    assembler.layer(2, 'stroke', UpdateStroke.bind(this));
    assembler.box(boxExt);

    function UpdateStroke(context) {
        var sprite = boxExt.box().sprite();

        context.beginPath();
        context.strokeStyle = style.get('strokeColor');
        context.lineWidth = style.get('strokeWidth');
        context.setLineDash(style.get('strokeStyle'));

        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI * 2);
        context.stroke();

    }

    function UpdateFill(context) {
        var sprite = boxExt.box().sprite();

        context.beginPath();
        context.fillStyle = style.get('fill');
        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI * 2);
        context.fill();
    }

    function UpdateBg(context){
        var sprite = boxExt.box().sprite(),
            box = boxExt.box().value();

        context.beginPath();
        context.arc(sprite.size[0] / 2, sprite.size[1] / 2, style.get('radius'), 0, Math.PI / 2);
        context.clip();

        var bgposition = style.get('bgPosition'),
            bgsize = style.get('bgSize'),
            bg = style.get('bg');

        for (var i = 0; i < bg.length; i++) {

            if (!bg[i].loaded()) {
                bg[i].on('load', function () {assembler.update('bg')});
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

    boxExt.f(function (boxContainer) {
        var radius = style.get('radius'),
            position = style.get('position'),
            anchor = style.get('anchor'),
            d = radius * 2;

        var x = position[0],
            y = position[1];

        if (anchor[0] == 'center') {
            x -= radius
        }
        if (anchor[0] == 'right') {
            x -= d
        }
        if (anchor[1] == 'middle') {
            y -= radius
        }
        if (anchor[1] == 'bottom') {
            y -= d;
        }

        boxContainer.set(x, y, d, d, strokefix, strokefix, strokefix, strokefix);
    });

    this.watch('radius', function () {
        assembler.update('stroke');
        assembler.update('bg');
        assembler.update('fill');
        boxExt.purge();
        matrix.purge();
        assembler.resize();
    });

    this.watch('fill', function () {
        assembler.update('fill');
    });

    this.watch('position', function () {
        boxExt.purge();
    });

    this.watch('strokeWidth', function (o, n) {
        if (n !== o) {
            strokefix = n;
            boxExt.purge();
            assembler.update('stroke');
            matrix.purge();
            assembler.resize();
        }
    });

    this.watch(['strokeStyle', 'strokeColor'], function () {
        assembler.update('stoke');
    });

    this.watch(['bg', 'bgPosition', 'bgSize'], function () {
        assembler.update('bg');
    });

    drawer.f(function (context) {
        DrawerHelper.transform(this, context);
        assembler.draw(context);
    });
}]);