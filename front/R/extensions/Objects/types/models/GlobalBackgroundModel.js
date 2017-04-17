/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.part('Objects', ['$ModelHelper', '$ColorHelper', 'Debug', 'Resource', function GlobalBackgroundModel(ModelHelper, ColorHelper, Debug, Resource) {
    var style = this.extension('Style'),
        animation = this.extension('Animation');

    function SyncBgProperty(bg, property, def) {
        for (var i = 0; i < bg.length; i++) {
            if (!property[i]) {
                property.push(ModelHelper.cloneArray(def));
            }
        }

        if (bg.length < property.length) {
            property.splice(bg.length - 1, property.length - path.length);
        }

    }

    style.define(0, 'fill', 'rgba(0,0,0,1)',
        function (value) {
            if (typeof value == "string") {
                if (ColorHelper.colorToArray(value)) {
                    return value;
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid color!');
                    return false;
                }
            }
            else if (typeof value == "object" && value.constructor == Array) {
                if (ColorHelper.isColor(value)) {
                    return ColorHelper.arrayToColor(value);
                }
                else {
                    Debug.warn({val: value}, '[{val}] is not a valid color');
                    return false;
                }
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid color!');
                return false;
            }
        },
        function (value) {
            return ColorHelper.colorToArray(value);
        }
    );

    animation.morph('fill', 0,
        function (start,end,value) {
            if(typeof value == 'string') {
                var color = ColorHelper.colorToArray(value);
                if(color) {
                    start(this.style('fill'));
                    end(color);
                }
                else {
                    Debug.warn({v:value}, '[{v}] is not avalid color!');
                }
            }
            else if (typeof value == "object" && value.constructor === Array) {
                if(ColorHelper.isColor(value)) {
                    start(this.style('fill'));
                    end(ModelHelper.cloneArray(value));
                }
            }
            else {
                Debug.warn({v : value}, '[{v}] is not a valid color!');
            }
        },
        function (value) {
            ColorHelper.normalize(value);
            return value;
        }
    );

    style.define(0, 'bg', [],
        function (value) {
            if (typeof value == "string") {
                if (ModelHelper.isSpriteString(value)) {
                    var data = ModelHelper.readSpriteString(value),
                        resource = Resource.sprite(data.url);

                    resource.config(data.frames);

                    return [resource];
                }
                else {
                    return [Resource.image(value)];
                }
            }
            else if (typeof value == "object" || value.constructor == Array) {
                if (value.length == 2 && typeof value[0] == "string" && typeof value[1] == "number") {
                    if (value[1] > 0) {
                        var resource = Resource.sprite(value[0]);
                        resource.config(value[1]);
                        return [resource];
                    }
                    else {
                        return false;
                    }
                }
                else {
                    var result = [];

                    for (var i = 0; i < value.length; i++) {
                        if (typeof value[i] == "string") {
                            if (ModelHelper.isSpriteString(value[i])) {
                                var data = ModelHelper.readSpriteString(value[i]),
                                    resource = Resource.sprite(data.url);

                                resource.config(data.frames);

                                result.push(value);
                            }
                            else {
                                result.push(Resource.image(value[i]));
                            }
                        }
                        else if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (value[i].length == 2 && typeof value[i][0] == "string" && typeof value[i][1] == "number") {
                                if (value[i][1] > 0) {
                                    var resource = Resource.sprite(value[i][0]);
                                    resource.config(value[i][1]);
                                    result.push(resource)
                                }
                                else {
                                    Debug.warn({
                                        val: value[i],
                                        i: i
                                    }, '[{i}][{val}] is not a valid bg value. Skipped.');
                                }
                            }
                        }
                        else {
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bg value. Skipped')
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var old = style.get('bg'),
                    result = [];

                for (var i = 0; i < old.length; i++) {
                    if (value[i]) {
                        if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (typeof value[i][0] == "string" && typeof value[i][1] == "number") {
                                var resource = Resource.sprite(value[i][0]);

                                resource.config(value[i][1]);

                                result.push(resource);
                            }
                            else {
                                Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bg array value.')
                            }
                        }
                        else if (typeof value[i] == "string") {
                            if (ModelHelper.isSpriteString(value[i])) {
                                var data = ModelHelper.readSpriteString(value[i]),
                                    resource = Resource.sprite(data.url);

                                resource.config(data.frames);

                                result.push(value);
                            }
                            else {
                                result.push(Resource.image(value[i]));
                            }
                        }
                        else {
                            result.push(old[i]);
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid value for bg.');
                        }
                    }
                    else {
                        result.push(old[i]);
                    }
                }

                return result;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not valid value for bg');
                return false;
            }

        },
        function (value) {
            var result = [];

            for (var i = 0; i < value.length; i++) {
                if (value[i].type == 'Image') {
                    result.push(value[i].url());
                }
                else if (value[i].type == 'Sprite') {
                    result.push(value[i].url() + '[' + value[i].frames() + ']');
                }
                else {
                    Debug.error({
                            val: value[i],
                            i: i
                        } + '[{i}][{val}] Unknown type of the background object container. Critical error.');
                }
            }

            return result;
        }
    );

    var defBgPosval = [0, 0];

    style.define(2, 'bgPosition', [defBgPosval],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (ModelHelper.validNumericArray(value) && value.length == 2) {
                    var bg = style.get('bg'),
                        result = [];

                    var _res = [value[0], value[1]];

                    for (var i = 0; i < bg.length; i++) {
                        result.push(_res);
                    }

                    return result;
                }
                else {
                    var result = [],
                        bg = style.get('bg'),
                        bgposition = style.get('bgPosition');

                    for (var i = 0; i < bg.length; i++) {
                        if (value[i]) {
                            if (ModelHelper.validNumericArray(value[i]) && value[i].length == 2) {
                                result.push([value[0], value[1]]);
                            }
                            else {
                                if (bgposition[i]) {
                                    result.push(bgposition[i]);
                                }
                                else {
                                    result.push(ModelHelper.cloneArray(defBgPosval));
                                }

                                Debug.warn({i: i, val: value[i]}, '[{i}][{val}] is not a valid bgposition value');
                            }
                        }
                        else {
                            if (bgposition[i]) {
                                result.push(bgposition[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgPosval));
                            }
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var result = [],
                    bg = style.get('bg'),
                    bgposition = style.get('bgPosition');

                for (var i = 0; i < bg.length; i++) {
                    if (value.hasOwnProperty(i)) {
                        if (bgposition[i]) {
                            if (ModelHelper.validNumericValue() && value[i].length == 2) {
                                result.push([value[0], value[1]]);
                            }
                            else {
                                result.push(bgposition[i]);
                                Debug.warn({i: i, val: value[i]}, '[{i}][{val}] is not a valid bgposition value');
                            }
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgPosval));
                        }
                    }
                    else {
                        if (bgposition[i]) {
                            result.push(bgposition[i]);
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgPosval));
                        }
                    }
                }

                return result;
            }
            else {
                Debug.warn({val: value}, '[{val}] is not a valid bgposition value');
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );

    var defBgSizeVal = [1, 1];

    style.define(1, 'bgSize', [defBgSizeVal],
        function (value) {
            if (typeof value == "object" && value.constructor == Array) {
                if (value.length == 2 && ModelHelper.validNumericArray(value)) {
                    var bg = style.get('bg'),
                        result = [],
                        _res = [value[0], value[1]];

                    for (var i = 0; i < bg.length; i++) {
                        result.push(_res)
                    }

                    return result;
                }
                else {
                    var bg = style.get('bg'),
                        bgsize = style.get('bgSize'),
                        result = [];

                    for (var i = 0; i < bg.length; i++) {
                        if (value[i].length == 2 && ModelHelper.validNumericArray(value[i])) {
                            result.push(value[i][0], value[i][1]);
                        }
                        else {
                            if (bgsize[i]) {
                                result.push(bgsize[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgSizeVal));
                            }
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value');
                        }
                    }

                    return result;
                }
            }
            else if (typeof value == "object") {
                var bg = style.get('bg'),
                    bgsize = style.get('bgSize'),
                    result = [];

                for (var i = 0; i < bg.length; i++) {
                    if (value.hasOwnProperty(i)) {
                        if (typeof value[i] == "object" && value[i].constructor == Array) {
                            if (value[i].length == 2 && ModelHelper.validNumericArray(value[i])) {
                                result.push([value[i][0], value[i][1]]);
                            }
                            else {
                                if (bgsize[i]) {
                                    result.push(bgsize[i]);
                                }
                                else {
                                    result.push(ModelHelper.cloneArray(defBgSizeVal));
                                }
                                Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value.');
                            }
                        }
                        else {
                            if (bgsize[i]) {
                                result.push(bgsize[i]);
                            }
                            else {
                                result.push(ModelHelper.cloneArray(defBgSizeVal));
                            }
                            Debug.warn({val: value[i], i: i}, '[{i}][{val}] is not a valid bgsize value.');
                        }
                    }
                    else {
                        if (bgsize[i]) {
                            result.push(bgsize[i]);
                        }
                        else {
                            result.push(ModelHelper.cloneArray(defBgSizeVal));
                        }
                    }
                }

                return result;
            }
        },
        function (value) {
            return ModelHelper.cloneArray(value);
        }
    );
    
    this.watch('bg' , function (o,n) {
        if(o.length !== n.length) {
            SyncBgProperty(n, style.get('bgPosition'), defBgPosval);
            SyncBgProperty(n, style.get('bgSize'), defBgSizeVal);
        }
    });
}]);