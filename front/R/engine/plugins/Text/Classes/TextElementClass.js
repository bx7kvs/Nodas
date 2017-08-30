/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.plugin.class('Objects', 'Text',
    ['$ColorHelper',
        function TextElementClass(ColorHelper) {
            var color = 'rgba(0,0,0,1)',
                font = 'sans-serif',
                fontWeight = 400,
                fontSize = 14,
                lineHeight = 14,
                fontStyle = 'normal',
                cb = [],
                self = this;

            function resolve(property, val) {
                for (var i = 0; i < cb.length; i++) {
                    cb[i].apply(self, [property, val]);
                }
            }

            this.size = function (val) {
                if (typeof val === "number") {
                    if (val < 0) val = 0;
                    fontSize = val;
                    resolve('size', fontSize);
                    return this;
                }
                else {
                    return fontSize;
                }
            };

            this.height = function (val) {
                if (typeof val === "number") {
                    if (val < 0) val = 0;
                    lineHeight = val;
                    resolve('height', lineHeight);
                    return this;
                }
                else {
                    return lineHeight;
                }
            };

            this.weight = function (val) {
                if (typeof val === "number") {
                    if (val < 100) val = 100;
                    if (val > 900) val = 900;
                    if (val % 100 !== 0) val = val - (val % 100);
                    fontWeight = val;
                    resolve('weight', fontWeight);
                    return this;
                }
                return fontWeight;
            };

            this.font = function (val) {
                if (typeof val === "string" && val.length > 0) {
                    font = val;
                    resolve('font', font);
                    return this;
                }
                return font;
            };

            this.color = function (val) {
                if (typeof val === "string") {
                    if (ColorHelper.colorToArray(val)) {
                        color = val;
                        resolve('color', color);
                    }
                    return this;
                }
                return color;
            };

            this.style = function (val) {
                if (val === 'normal' || val === 'italic' || val === 'oblique') {
                    fontStyle = val;
                    resolve('style', fontStyle);
                    return this;
                }
                return fontStyle;
            };

            this.extractFontString = function () {
                return fontStyle + ' ' + fontSize + 'px "' + font + '-' + fontWeight + '"';
            };

            this.onPropertyChange = function (func) {
                if (typeof func === "function") {
                    cb.push(func);
                }
            };

            this.propertyChanged = function (name, val) {
                resolve(name, val);
            }

        }
    ]
);