/**
 * Created by bx7kv_000 on 12/29/2016.
 */
$R.helper.system(
    ['Debug',
        function Model(Debug) {

            this.cloneHash = function (hash) {
                if (typeof hash !== "object") {
                    Debug.error('Hash is not an object!');
                    return;
                }
                return JSON.parse(JSON.stringify(hash));
            };

            this.cloneArray = function (array) {
                if (typeof array !== "object" || array.constructor !== Array) {
                    Debug.error('array is not an array!');
                    return;
                }

                var result = [];

                for (var i = 0; i < array.length; i++) {
                    if (typeof array[i] == "object") {
                        if (array[i].constructor === Array) {
                            result.push(this.cloneArray(array[i]))
                        }
                        else {
                            result.push(this.cloneHash(array[i]));
                        }
                    }
                    else if (typeof array[i] == "function") {
                        var text = array[i].toString();
                        result.push(eval(text));
                        Debug.warn('You\'ve just cloned a function. It may be slow', this);
                    }
                    else {
                        result.push(array[i]);
                    }
                }

                return result;
            };

            this.validNumericArray = function (array) {
                var result = true;

                if (typeof array !== "object" || array.constructor !== Array) return false;

                for (var i = 0; i < array.length; i++) {
                    if (typeof array[i] !== "number") {
                        result = false;
                        break;
                    }
                }

                return result;
            };

            var blendings = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over',
                'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply',
                'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
                'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
            ];

            this.validBlending = function (value) {
                var result = false;

                for (var i = 0; i < blendings.length; i++) {
                    if (blendings[i] == value) {
                        result = true;
                        break;
                    }
                }

                return result;
            };

            var sprite_regexp = /^([./_\da-zA-Z]+)(\[(\d+)\])$/;

            this.isSpriteString = function (str) {
                return sprite_regexp.test(str);
            };

            this.readSpriteString = function (str) {
                var result = str.match(sprite_regexp);

                return {
                    url: result[1],
                    frames: parseInt(result[3])
                }
            };

        }]);