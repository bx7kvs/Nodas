/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.part('Objects', ['@inject', '$DrawerHelper',
        function TextObjectDrawer(inject, DrawerHelper) {
            var text = this.extension('Text'),
                style = this.extension('Style'),
                box = this.extension('Box'),
                drawer = this.extension('Drawer'),
                matrix = this.extension('Matrix'),
                require_update = false,
                assembler = inject('GraphicsAssembler'),
                object = this;

            assembler.layer(0, 'text', UpdateTextLayer);

            function UpdateTextLayer(context) {
                var lineHeight = style.get('lineHeight'),
                    color = style.get('color'),
                    fontSize = style.get('fontSize'),
                    align = style.get('align');

                context.beginPath();

                var topSpan = lineHeight - (fontSize / 5);
                if (fontSize < lineHeight) {
                    topSpan = topSpan - (lineHeight - fontSize);
                }
                else {
                    topSpan = topSpan + (fontSize - lineHeight);
                }

                text.forEachLine(function (i) {
                    context.beginPath();
                    var y = topSpan + i * lineHeight;
                    context.font = this.extractFontString();
                    context.fillStyle = this.color();
                    if (align == 'center') {
                        context.fillText(this.string(), (text.textBlockWidth() - this.width()) / 2, y);
                    }
                    else if (align == 'right') {
                        context.fillText(this.string(), text.textBlockWidth() - this.width() - 2, y);
                    }
                    else {
                        context.fillText(this.string(), 2, y);
                    }
                });
            }

            function drawText(context) {
                if (require_update) {
                    assembler.size(text.textBlockWidth(), text.textBlockHeight());
                    assembler.update('text');
                    require_update = false;
                }
                DrawerHelper.transform(this, context);
                assembler.draw(context);
            }

            this.watch(['str', 'style', 'font', 'weight', 'size', 'color', 'fontSize', 'lineHeight'], function () {
                require_update = true;
                box.purge();
                matrix.purge();
            });

            this.watch('anchor', function () {
                box.purge();
                matrix.purge();
            });

            box.f(function (boxContainer) {
                var position = style.get('position'),
                    anchor = style.get('anchor'),
                    x = position[0],
                    y = position[1];

                if (anchor[0] == 'center') {
                    x -= text.textBlockWidth() / 2
                }
                if (anchor[0] == 'right') {
                    x -= text.textBlockWidth();
                }
                if (anchor[1] == 'middle') {
                    y -= text.textBlockHeight() / 2
                }
                if (anchor[1] == 'bottom') {
                    y -= text.textBlockHeight();
                }
                boxContainer.set(x, y, text.textBlockWidth(), text.textBlockHeight(), 0, 0, 0, 0);
            });

            drawer.f(drawText);

        }
    ]
);