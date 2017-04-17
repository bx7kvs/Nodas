/**
 * Created by bx7kv_000 on 1/10/2017.
 */
$R.part('Objects', function ColorHelper () {

    function NormalizeColorArray (array) {
        if(array !== false && array !== undefined) {
            for(var i =0 ;i < array.length; i++) {
                array[i] = array[i] <= 255 ? array[i] : 255;
                array[i] = array[i] >= 0 ? array[i] :0;
                array[i] = (i !== 3 && array[i] !== 0) ? parseInt(array[i]) : array[i];
                array[i] = ((i == 3) && array[i]) <=1 ? array[i] : 1;
                array[i] = Math.abs(array[i]);
            }
            return array;
        }
        else {
            return false;
        }
    }

    function ParseColour (color) {
        var cache
            , p = parseInt // Use p as a byte saving reference to parseInt
            , color = color.replace(/\s\s*/g,'') // Remove all spaces
            ;//var

        // Checks for 6 digit hex and converts string to integer
        if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
            cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];

        // Checks for 3 digit hex and converts string to integer
        else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
            cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];

        // Checks for rgba and converts string to
        // integer/float using unary + operator to save bytes
        else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color))
            cache = [+cache[1], +cache[2], +cache[3], +cache[4]];

        // Checks for rgb and converts string to
        // integer/float using unary + operator to save bytes
        else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
            cache = [+cache[1], +cache[2], +cache[3]];

        // Otherwise throw an exception to make debugging easier
        else return false;

        // Performs RGBA conversion by default
        isNaN(cache[3]) && (cache[3] = 1);

        // Adds or removes 4th value based on rgba support
        // Support is flipped twice to prevent erros if
        // it's not defined
        return NormalizeColorArray (cache.slice(0,4));
    }

    this.colorToArray = ParseColour;
    this.normalize = NormalizeColorArray;
    this.isColor = function (array) {
        var error = false;
        if(array.length == 4) {
            var valerror = false;
            for(var i = 0; i < array.length; i++) {
                if(typeof array[i] == 'number'|| typeof array[i] == 'string') {
                    if(typeof  array[i] == 'string' && isNaN(array[i]*1)) {
                        error = true;
                    }
                }
                else {
                    error = true;
                }
            }
        }
        else {
            error = true;
        }
        if(error) {
            console.warn('Silk : Check for color unsuccessful. "'+array+'" is not a color Array.');
        }
        return !error;
    };

    this.arrayToColor = function (array) {
        if(array && array.length ==4) {
            var string = 'rgba(';
            for(var i =0; i< array.length; i++){
                string+= i==3 ? array[i] + ')' : array[i]+',';
            }
            return string;
        }
        else  {
            console.warn('Unknown Input array format. Should be [R,G,B,A];');
            return false;
        }
    }
})