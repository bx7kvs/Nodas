/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.plugin('Objects',
    ['Debug', '+Model', '@inject',
        function Text(Debug, ModelHelper, inject, Fonts) {

            this.applyTo('Text');

            var object = this.object();

            if (object.type() !== 'Text') return;

            var lines = [],
                wordByWordRegExp = /((\S+\s+)|(\S+$))/g,
                style = object.extension('Style'),
                string = '',
                update = false,
                limits = [Infinity, Infinity],
                width = 0,
                height = 0;

            this.register('lines', function () {
                this.update();
                var array = [];
                for (var i = 0; i < lines.length; i++) {
                    array.push(lines[i].string());
                }
            });

            this.register('words', function () {
                this.update();
                var words = [];
                for (var l = 0; l < lines.length; l++) {
                    var _w = lines[i].words();
                    for (var w = 0; w < _w.length; w++) {
                        words.push(_w.string());
                    }
                }
                return words;
            });

            this.limits = function (w, h) {
                limits[0] = w;
                limits[1] = h;
                update = true;
            };

            object.watch('str', function (o, n) {
                if (n !== string) {
                    string = n;
                }
            });

            object.watch(['str', 'fontSize', 'lineHeight', 'color', 'weight', 'style'], function () {
                update = true;
            });

            this.update = function (forced) {
                if (update || forced) {
                    var pieces = string.match(wordByWordRegExp),
                        lineWidth = 0,
                        l = 0,
                        limits = style.get('size'),
                        w = 0,
                        h = 0;

                    if(pieces) {
                        var font = style.get('systemFont'),
                            fontSize = style.get('fontSize'),
                            lineHeight = style.get('lineHeight'),
                            fontWeight = style.get('weight'),
                            color = style.get('color'),
                            fontStyle = style.get('style');

                        lines = [];


                        for (var i = 0; i < pieces.length; i++) {

                            var usernewline = pieces[i].match(/\n/g),
                                str = pieces[i].match(/\S+/g),
                                word = inject('$TextWordClass').string(str[0]);

                            if (!lines[l]) lines[l] = inject('$TextLineClass')
                                .font(font)
                                .size(fontSize)
                                .height(lineHeight)
                                .color(color)
                                .style(fontStyle)
                                .weight(fontWeight);

                            lines[l].push(word);
                            lineWidth = lines[l].width();

                            if (lineWidth >= limits[0] || usernewline) {
                                l++;
                            }
                            if (lineWidth > w) w = lineWidth + 4;
                        }
                        height = lines.length * style.get('lineHeight');
                        if (fontSize > lineHeight) {
                            height += fontSize - lineHeight;
                        }
                        else if (fontSize < lineHeight) {
                            height -= lineHeight - fontSize;
                        }
                        width = w;
                        update = false;
                    }
                }
                return this;
            };

            this.textBlockHeight = function () {
                this.update();
                return height;
            };

            this.textBlockWidth = function () {
                this.update();
                return width;
            };

            this.forEachLine = function (func) {
                this.update();
                for (var i = 0; i < lines.length; i++) {
                    func.apply(lines[i], [i, lines[i]]);
                }
            };

            this.destroy(function () {
                while (lines[0]) {
                    lines.shift();
                }
                lines = undefined;
                while (limits[0]) {
                    limits.shift()
                }
                limits = undefined;
                object = undefined;
                string = undefined;
                width = undefined;
                height = undefined;
                wordByWordRegExp = undefined;
            })

        }
    ]
);