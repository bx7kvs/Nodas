/**
 * Created by Viktor Khodosevich on 6/2/2017.
 */
$R.$(['@define', function FontFamilyManager(define) {

    var element = document.createElement('style');

    var families = {},
        format = ['eot', 'svg', 'ttf', 'woff'];

    document.getElementsByTagName('head')[0].appendChild(element);

    var formatStr = {
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
    };

    function fontString(font, root) {

        var result = '';

        for (var w = 0; w < font.weight.length; w++) {
            for (var s = 0; s < font.style.length; s++) {
                if (!font[font.weight[w] + '-' + font.style[s]]) {
                    var filestring = root + '/' + font.name + '-' + font.weight[w] + '-' + font.style[s];
                    var string = '@font-face {' +
                        'font-family: "' + font.name + '-' + font.weight[w] + '";' +
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
                }

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
    };

    function inArray(array, value) {
        var result = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                result = true;
                break;
            }
        }
        return result;
    };

    define('font', function (path, font, weight, style) {
        if (!families[font]) {
            families[font] = {
                name: font
            };
        }
        if (families[font][weight + '-' + style]) return;
        if (!families[font].weight) families[font].weight = [];
        if (!families[font].style) families[font].style = [];
        if (!inArray(families[font].weight, weight)) families[font].weight.push(weight);
        if (!inArray(families[font].style, style)) families[font].style.push(style);
        update(path);
    });

    define('fontFormats', function () {
        var result = [];
        for (var i = 0; i < format.length; i++) {
            result.push(format[i]);
        }
        return result;
    })
}]);