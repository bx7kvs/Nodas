/**
 * Created by Viktor Khodosevich on 14/08/2017.
 */
Core(function Fonts(Config, app) {

    var element = document.createElement('style');

    var families = {},
        format = Config.define('fontFormats', ['eot', 'svg', 'ttf', 'woff'], {
            isArray: true, custom: function (v) {
                var result = true;
                for (var i = 0; i < v.length(); i++) {
                    if (v[i] !== 'eot' || v[i] !== 'svg' || v[i] !== 'ttf' || v[i] !== 'woff') {
                        result = false;
                        break;
                    }
                }
                return result;
            }
        }).watch(function (v) {
            format = v;
            update();
        }),
        formatStr = {
            eot: function (url) {
                return 'url("' + url + '.eot?#iefix") format("embedded-opentype")';
            },
            woff: function (url) {
                return 'url("' + url + '.woff") format("woff")';
            },
            ttf: function (url) {
                return 'url("' + url + '.ttf") format("truetype")';
            },
            svg: function (url, font, style) {
                return 'url("' + url + '.svg#' + font + '-' + (style.charAt(0).toUpperCase() + style.slice(1)) + '") format("svg")';
            }
        },
        self = this;

    Config.define('fontDir', './fonts', {isString: true});

    document.getElementsByTagName('head')[0].appendChild(element);

    function fontString(font, root) {

        var result = '';

        for (var w = 0; w < font.weight.length; w++) {
            for (var s = 0; s < font.style.length; s++) {
                var filestring = root + '/' + font.name + '-' + font.weight[w] + '-' + font.style[s];
                var string = '@font-face {' +
                    'font-family: "' + self.format(font.name) + '-' + font.weight[w] + '";' +
                    'src:';

                for (var f = 0; f < format.length; f++) {
                    string += formatStr[format[f]](filestring, font.name, font.style[s]);
                    if (f < format.length - 1) {
                        string += ','
                    }
                    else {
                        string += ';'
                    }
                }
                string += 'font-weight: ' + font.weight[w] + ';';
                string += 'font-style:' + font.style[s] + ';}';
                font[font.weight[w] + '-' + font.style[s]] = string;

                result += font[font.weight[w] + '-' + font.style[s]];
            }
        }

        return result;
    }

    function update(path) {
        var string = '';
        for (var family in families) {
            if (families.hasOwnProperty(family)) {
                string += fontString(families[family], path);
            }
        }
        element.innerHTML = string;
    }

    function inArray(array, value) {
        var result = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                result = true;
                break;
            }
        }
        return result;
    }

    this.font = function (path, font, weight, style) {
        if (!families[font]) {
            families[font] = {
                name: font
            };
        }
        if (!families[font].weight) families[font].weight = [];
        if (!families[font].style) families[font].style = [];
        if (!inArray(families[font].weight, weight)) families[font].weight.push(weight);
        if (!inArray(families[font].style, style)) families[font].style.push(style);
        update(path);
    };

    this.format = function (font) {
        return app + '-' + font;
    };

    this.formats = function () {
        var result = [];
        for (var i = 0; i < format.length; i++) {
            result.push(format[i]);
        }
        return result;
    };
});