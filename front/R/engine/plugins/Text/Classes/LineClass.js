/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.plugin.class('Objects', 'Text',
    ['@extend', '@inject', '+Drawer',
        function TextLineClass(extend, inject, DrawerHelper) {
            extend(this, '$TextElementClass');

            var width = 0,
                words = [],
                space = inject('$TextSpaceClass'),
                length = 0,
                widthUpdated = false;

            function getWidth() {
                if (widthUpdated) {
                    width = 0;
                    for (var i = 0; i < words.length; i++) {
                        width += words[i].width();
                    }
                    widthUpdated = false;
                    return width;
                }
                return width;
            }

            this.width = function () {
                return DrawerHelper.measureText(getWidth)
            };

            this.length = function () {
                return length;
            };

            this.words = function (array) {
                if (array && typeof array == "object" && array.constructor == Array) {
                    for (var i = 0; i < array.length; i++) {
                        words.push(array[i]
                            .size(this.size())
                            .height(this.height())
                            .style(this.style())
                            .weight(this.weight())
                            .color(this.color())
                            .font(this.font()));
                    }
                    length = words.length;
                    var _arr = [];
                    for (var i = 0; i < words.length; i++) {
                        _arr.push(words[i]);
                    }
                    this.propertyChanged('string', _arr);
                    return this;
                }
                widthUpdated = true;
                return words;
            };

            this.push = function (word) {
                if (words.length > 0) words.push(space);
                words.push(
                    word.size(this.size())
                        .height(this.height())
                        .style(this.style())
                        .weight(this.weight())
                        .color(this.color())
                        .font(this.font())
                );
                widthUpdated = true;
                return this;
            };

            this.string = function () {
                var string = '';

                for (var i = 0; i < words.length; i++) {
                    string += words[i].string();
                }
                return string;
            };

            this.onPropertyChange(function (property, val) {
                if (property !== 'string') {
                    space[property](val);
                }
            });

        }
    ]
);